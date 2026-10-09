export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const API_MODE: "mock" | "supabase" =
  process.env.NEXT_PUBLIC_API_MODE === "supabase" ? "supabase" : "mock";

/** Sin env vars de Supabase la app corre en "modo demo" (sin auth real). */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * DO-01 · Datos de donación (estáticos, sin integración con Mercado Pago).
 * Si no hay env vars se usan DATOS DE EJEMPLO y la UI lo marca como tal.
 * Un renglón vacío ("") se oculta; NEXT_PUBLIC_DONACION_ACTIVA=false oculta toda la donación.
 */
const env = (v: string | undefined) => (v === undefined ? undefined : v.trim());
const alias = env(process.env.NEXT_PUBLIC_DONACION_ALIAS);
const cvu = env(process.env.NEXT_PUBLIC_DONACION_CVU);
const titular = env(process.env.NEXT_PUBLIC_DONACION_TITULAR);
const qr = env(process.env.NEXT_PUBLIC_DONACION_QR_URL);
const esEjemplo = alias === undefined && cvu === undefined && titular === undefined;

export const DONACION = {
  esEjemplo,
  alias: esEjemplo ? "macheteo.donaciones" : alias ?? "",
  cvu: esEjemplo ? "0000003100000000000000" : cvu ?? "",
  titular: esEjemplo ? "Anderson Brayner, cuenta de Mercado Pago." : titular ?? "",
  qrUrl: esEjemplo ? "/donacion-qr-ejemplo.svg" : qr ?? "",
};
export const DONACION_ACTIVA =
  process.env.NEXT_PUBLIC_DONACION_ACTIVA !== "false" && Boolean(DONACION.alias || DONACION.cvu || DONACION.qrUrl);
