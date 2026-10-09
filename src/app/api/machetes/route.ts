import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/config";
import { ipHashes } from "@/lib/ip-hash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/machetes — contrato v2 #3 / #3b (N-04).
 * - { apuntes, instrucciones, tipo, extension, diseno, tinta, opciones, idempotency_key } → crear_resumen
 * - { reintentar_de, idempotency_key } → reintentar_resumen
 * Valida la sesión, hashea la IP de x-real-ip (la setea Vercel; no se usa X-Forwarded-For) y llama la RPC con service role.
 */
const ERRORES = new Set([
  "cuenta_inexistente", "email_no_verificado", "terminos_no_aceptados", "validacion",
  "limite_global", "limite_activos", "limite_diario", "limite_errores",
]);
const STATUS: Record<string, number> = {
  validacion: 400, email_no_verificado: 403, terminos_no_aceptados: 403, cuenta_inexistente: 403,
  limite_activos: 429, limite_diario: 429, limite_errores: 429, limite_global: 503,
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ENUMS = {
  tipo: ["ejercicios", "teoria", "machete", "autoevaluacion"],
  extension: ["machete", "corto", "medio", "completo"],
  diseno: ["rayado", "cuadriculado", "punteado"],
  tinta: ["azul", "negro", "verde", "violeta"],
};

const err = (error: string, status: number, extra: Record<string, unknown> = {}) => NextResponse.json({ error, ...extra }, { status });

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) return err("no_configurado", 503);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err("no_autenticado", 401);

  const admin = createAdminClient();
  if (!admin) return err("no_configurado", 503);

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || typeof b.idempotency_key !== "string" || !UUID.test(b.idempotency_key)) return err("validacion", 400);

  const p_ip_hashes = ipHashes(req.headers.get("x-real-ip"));
  let rpc;
  if (typeof b.reintentar_de === "string") {
    if (!UUID.test(b.reintentar_de)) return err("validacion", 400);
    rpc = await admin.rpc("reintentar_resumen", {
      p_user_id: user.id, p_ip_hashes, p_resumen_id: b.reintentar_de, p_idempotency_key: b.idempotency_key,
    });
  } else {
    const okEnum = (k: keyof typeof ENUMS, opcional = false) =>
      (opcional && (b[k] === null || b[k] === undefined)) || (typeof b[k] === "string" && ENUMS[k].includes(b[k] as string));
    const op = b.opciones as Record<string, unknown> | undefined;
    if (
      typeof b.apuntes !== "string" || !okEnum("tipo") || !okEnum("extension") || !okEnum("diseno", true) || !okEnum("tinta", true) ||
      (b.instrucciones != null && typeof b.instrucciones !== "string") || !op || typeof op.materia !== "string"
    ) return err("validacion", 400);
    rpc = await admin.rpc("crear_resumen", {
      p_user_id: user.id,
      p_ip_hashes,
      p_apuntes: b.apuntes,
      p_instrucciones: (b.instrucciones as string | null) ?? null,
      p_tipo: b.tipo,
      p_extension: b.extension,
      p_diseno: b.diseno ?? null,
      p_tinta: b.tinta ?? null,
      p_opciones: {
        materia: String(op.materia).trim(),
        nombre_en_hojas: typeof op.nombre_en_hojas === "string" ? op.nombre_en_hojas.trim() : null,
        fecha: typeof op.fecha === "string" ? op.fecha : null,
      },
      p_idempotency_key: b.idempotency_key,
    });
  }

  if (rpc.error) {
    // Clave de service role inválida / de otro proyecto (PostgREST 401 sin código SQL) → problema de configuración, no del usuario.
    if (!rpc.error.code && /invalid api key|jwt/i.test(rpc.error.message)) {
      console.error("[api/machetes] service role rechazada por Supabase (¿clave de otro proyecto?)");
      return err("no_configurado", 503);
    }
    const code = ERRORES.has(rpc.error.message) ? rpc.error.message : "desconocido";
    let detalle: Record<string, unknown> = {};
    try { detalle = rpc.error.details ? JSON.parse(rpc.error.details) : {}; } catch {}
    if (code === "desconocido") console.error("[api/machetes] RPC error", rpc.error.code, rpc.error.message);
    return err(code, STATUS[code] ?? 500, { vuelve_at: detalle.vuelve_at ?? null, motivo: detalle.motivo ?? null });
  }
  const d = rpc.data as { resumen_id: string; estado: string; hojas_max: number };
  return NextResponse.json(d, { status: 201 });
}
