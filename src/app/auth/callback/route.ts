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
  const volver = searchParams.get("volver") ?? "/biblioteca";
  const safeNext = volver.startsWith("/") && !volver.startsWith("//") ? volver : "/biblioteca";

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
  const dest = type === "recovery" ? "/recuperar/nueva" : safeNext;
  return NextResponse.redirect(`${origin}${dest}`);
}
