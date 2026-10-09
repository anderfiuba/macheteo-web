export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
/** URL canónica de producción (sin dominio propio todavía). Canonical, OpenGraph, sitemap y robots apuntan acá. */
export const PRODUCTION_URL = "https://macheteo-web.vercel.app";
/** URL del entorno actual (redirects de email/OAuth). Local: NEXT_PUBLIC_SITE_URL=http://localhost:3000 en .env.local. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_URL;
/** Rutas públicas indexables (el resto requiere sesión o es transitorio). */
export const RUTAS_PUBLICAS = ["/", "/registro", "/ingresar", "/terminos", "/privacidad"] as const;
export const API_MODE: "mock" | "supabase" =
  process.env.NEXT_PUBLIC_API_MODE === "supabase" ? "supabase" : "mock";

/** Sin env vars de Supabase la app corre en "modo demo" (sin auth real). */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * DO-01 · Datos de donación (estáticos, sin integración con Mercado Pago). Datos reales provistos por PM (2026-10-09).
 * Las env vars NEXT_PUBLIC_DONACION_* pisan los defaults; un valor vacío ("") oculta ese renglón (hoy: sin CVU ni QR).
 * NEXT_PUBLIC_DONACION_ACTIVA=false oculta la tarjeta y todos los accesos a donar.
 */
const env = (v: string | undefined, def: string) => (v === undefined ? def : v.trim());

export const DONACION = {
  alias: env(process.env.NEXT_PUBLIC_DONACION_ALIAS, "macheteo.donacion.mp"),
  cvu: env(process.env.NEXT_PUBLIC_DONACION_CVU, ""),
  titular: env(process.env.NEXT_PUBLIC_DONACION_TITULAR, "Anderson Cavalcante Brayner"),
  qrUrl: env(process.env.NEXT_PUBLIC_DONACION_QR_URL, ""),
};
export const DONACION_ACTIVA =
  process.env.NEXT_PUBLIC_DONACION_ACTIVA !== "false" && Boolean(DONACION.alias || DONACION.cvu || DONACION.qrUrl);

/** Contacto (footer, letra chica de donación). Vacío = placeholder pendiente de PM: se ocultan los textos que lo usan. */
export const CONTACTO_EMAIL = (process.env.NEXT_PUBLIC_CONTACTO_EMAIL ?? "").trim();
/** Link obligatorio de Defensa del Consumidor (Res. SCI 274/2021 art. 8). */
export const DEFENSA_CONSUMIDOR_URL = "https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario";
