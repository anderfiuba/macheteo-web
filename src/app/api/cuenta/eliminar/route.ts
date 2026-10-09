import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PALABRA_CONFIRMACION_BAJA as PALABRA_CONFIRMACION, isSupabaseConfigured } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "resumenes";

const err = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * POST /api/cuenta/eliminar { confirmacion: "ELIMINAR" } — CU-06 (orquesta el flujo de la migración 070500 con service role):
 *  1) RPC eliminar_cuenta(user_id): cancela jobs en curso, suma bajas_diarias, borra perfiles (cascade) → {email, pdf_paths}
 *  2) Storage: remove(pdf_paths) del bucket "resumenes" (+ barrido del prefijo {user_id}/ por si quedó algo)
 *  3) auth.admin.signOut(jwt, "global") + auth.admin.deleteUser(user_id) (N-11)
 * Idempotente: si la RPC dice cuenta_inexistente (reintento tras un fallo en 2/3), sigue con Storage y Auth.
 * Email de confirmación de baja: pendiente de Backend (sin RESEND_API_KEY en el front).
 */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) return err("no_configurado", 503);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err("no_autenticado", 401);

  const b = (await req.json().catch(() => null)) as { confirmacion?: unknown } | null;
  if (!b || typeof b.confirmacion !== "string" || b.confirmacion.trim() !== PALABRA_CONFIRMACION) return err("confirmacion_invalida", 400);

  const admin = createAdminClient();
  if (!admin) return err("no_configurado", 503);

  // 1) Datos
  let paths: string[] = [];
  const rpc = await admin.rpc("eliminar_cuenta", { p_user_id: user.id });
  if (rpc.error) {
    if (!/cuenta_inexistente/.test(rpc.error.message ?? "")) {
      console.error("[cuenta/eliminar] eliminar_cuenta falló", rpc.error.code ?? "", rpc.error.message);
      return err("error", 500);
    }
  } else {
    paths = ((rpc.data as { pdf_paths?: string[] } | null)?.pdf_paths ?? []).filter(Boolean);
  }

  // 2) PDFs (best effort: un fallo acá no deja la cuenta viva; se registra para el barrido de huérfanos)
  try {
    const { data: resto } = await admin.storage.from(BUCKET).list(user.id, { limit: 1000 });
    const todos = Array.from(new Set([...paths, ...(resto ?? []).map((o) => `${user.id}/${o.name}`)]));
    if (todos.length) {
      const { error } = await admin.storage.from(BUCKET).remove(todos);
      if (error) console.error("[cuenta/eliminar] storage.remove falló", error.message);
    }
  } catch (e) {
    console.error("[cuenta/eliminar] storage", e instanceof Error ? e.message : "error");
  }

  // 3) Auth: cerrar todas las sesiones y borrar el usuario
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    const { error } = await admin.auth.admin.signOut(session.access_token, "global");
    if (error) console.error("[cuenta/eliminar] signOut global falló", error.message);
  }
  const del = await admin.auth.admin.deleteUser(user.id);
  if (del.error && del.error.status !== 404) {
    console.error("[cuenta/eliminar] deleteUser falló", del.error.message);
    return err("error", 500);
  }
  // Borra las cookies de sesión de este navegador.
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  return NextResponse.json({ ok: true });
}
