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
  const next = searchParams.get("next") ?? "/nuevo";
  const safeNext = next.startsWith("/") ? next : "/nuevo";

  if (!isSupabaseConfigured) return NextResponse.redirect(`${origin}/ingresar`);
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
    return NextResponse.redirect(`${origin}/ingresar?error=link_vencido`);
  }
  const dest = type === "recovery" ? "/actualizar-contrasena" : safeNext;
  return NextResponse.redirect(`${origin}${dest}`);
}
