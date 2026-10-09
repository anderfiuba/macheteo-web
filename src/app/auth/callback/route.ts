import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

/** Maneja OAuth (code) y links de email (token_hash + type): verificación y recupero. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const volver = searchParams.get("volver") ?? "/nuevo";
  const safeNext = volver.startsWith("/") && !volver.startsWith("//") ? volver : "/nuevo";

  if (!isSupabaseConfigured) return NextResponse.redirect(`${origin}/ingresar`); // modo demo
  const supabase = await createClient();
  let error: unknown = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else {
    error = new Error("missing params");
  }

  if (error) {
    // S03 / S04: link vencido o ya usado
    const dest = type === "recovery" ? "/recuperar?estado=vencido" : "/verificar?estado=vencido";
    return NextResponse.redirect(`${origin}${dest}`);
  }
  if (type === "recovery") return NextResponse.redirect(`${origin}/recuperar/nueva`);
  // Google (y cuentas sin aceptación): sin T&C aceptados no pueden armar → pantalla de aceptación antes de seguir.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: perfil } = await supabase.from("perfiles").select("acepto_terminos_at").eq("id", user.id).maybeSingle();
    if (perfil && !perfil.acepto_terminos_at) return NextResponse.redirect(`${origin}/bienvenida?volver=${encodeURIComponent(safeNext)}`);
  }
  const dest = safeNext;
  return NextResponse.redirect(`${origin}${dest}`);
}
