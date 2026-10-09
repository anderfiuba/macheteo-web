import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/config";

const PROTECTED = ["/nuevo", "/resumenes", "/biblioteca", "/perfil", "/recuperar/nueva"];
const AUTH_ONLY_GUEST = ["/ingresar", "/registro"];
/** Pantallas de la app que exigen T&C aceptados (Google y cuentas viejas no pasan por el checkbox del registro). */
const REQUIERE_TYC = ["/nuevo", "/resumenes", "/biblioteca", "/perfil"];
export const BIENVENIDA = "/bienvenida";
const HOME_LOGUEADO = "/nuevo"; // referencia "Birome": la app abre en Nuevo machete

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
    url.search = "";
    url.searchParams.set("volver", path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (user && REQUIERE_TYC.some((p) => path.startsWith(p))) {
    const { data: perfil } = await supabase.from("perfiles").select("acepto_terminos_at").eq("id", user.id).maybeSingle();
    if (perfil && !perfil.acepto_terminos_at) {
      const url = request.nextUrl.clone();
      url.pathname = BIENVENIDA;
      url.search = "";
      url.searchParams.set("volver", path + request.nextUrl.search);
      return redirectCon(url, response);
    }
  }
  if (!user && path.startsWith(BIENVENIDA)) {
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    return NextResponse.redirect(url);
  }
  if (user && (path === "/" || AUTH_ONLY_GUEST.some((p) => path.startsWith(p)))) {
    // Con sesión, la landing y las pantallas de invitado llevan a la app.
    const url = request.nextUrl.clone();
    url.pathname = HOME_LOGUEADO;
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

/** Redirect que conserva las cookies de sesión refrescadas en esta request. */
function redirectCon(url: URL, base: NextResponse) {
  const r = NextResponse.redirect(url);
  base.cookies.getAll().forEach((c) => r.cookies.set(c));
  return r;
}
