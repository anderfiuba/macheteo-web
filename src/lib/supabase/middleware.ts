import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/config";

const PROTECTED = ["/nuevo", "/resumenes", "/historial", "/creditos", "/biblioteca", "/actualizar-contrasena"];
const AUTH_ONLY_GUEST = ["/ingresar", "/registro", "/recuperar"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response; // modo demo

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user && PROTECTED.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (user && AUTH_ONLY_GUEST.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/nuevo";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}
