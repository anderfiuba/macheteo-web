import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/machetes/[id]/pedido — N-19 "Editar y reintentar" (PA-13: apuntes guardados hasta 7 días en error).
 * `apuntes`/`instrucciones` no son legibles con el JWT del usuario (privilegios de columna), así que se leen con
 * service role filtrando por dueño, estado 'error' y error_at ≤ 7 días. [PROPUESTO: confirmar con Backend o reemplazar por RPC]
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "validacion" }, { status: 400 });
  if (!isSupabaseConfigured) return NextResponse.json({ error: "no_configurado" }, { status: 503 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "no_configurado" }, { status: 503 });

  const desde = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
  const { data, error } = await admin
    .from("resumenes")
    .select("apuntes, instrucciones, tipo, extension, diseno, tinta, materia, opciones")
    .eq("id", id).eq("user_id", user.id).eq("estado", "error").gte("error_at", desde)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
  const op = (data.opciones ?? {}) as { nombre_en_hojas?: string; fecha?: string };
  return NextResponse.json(
    {
      apuntes: data.apuntes, instrucciones: data.instrucciones ?? "", tipo: data.tipo, largo: data.extension,
      hoja: data.diseno, tinta: data.tinta, nombre: op.nombre_en_hojas ?? "", materia: data.materia ?? "", fecha: op.fecha ?? "",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
