import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/machetes/[id]/pedido — N-19 "Editar y reintentar" (PA-13: apuntes guardados hasta 7 días en error).
 * RPC obtener_pedido_resumen(p_id) con la sesión del usuario (sin service role): devuelve apuntes + opciones
 * solo si el machete es suyo, está en `error` y tiene ≤ 7 días; si no, `no_encontrado`.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "validacion" }, { status: 400 });
  if (!isSupabaseConfigured) return NextResponse.json({ error: "no_configurado" }, { status: 503 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no_autenticado" }, { status: 401 });

  const { data, error } = await supabase.rpc("obtener_pedido_resumen", { p_id: id });
  if (error || !data) return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
  const d = data as {
    apuntes: string; instrucciones: string | null; tipo: string; extension: string; diseno: string; tinta: string;
    materia: string | null; opciones: { nombre_en_hojas?: string; fecha?: string } | null;
  };
  return NextResponse.json(
    {
      apuntes: d.apuntes, instrucciones: d.instrucciones ?? "", tipo: d.tipo, largo: d.extension, hoja: d.diseno, tinta: d.tinta,
      nombre: d.opciones?.nombre_en_hojas ?? "", materia: d.materia ?? "", fecha: d.opciones?.fecha ?? "",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
