export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const API_MODE: "mock" | "supabase" =
  process.env.NEXT_PUBLIC_API_MODE === "supabase" ? "supabase" : "mock";

/** Sin env vars de Supabase la app corre en "modo demo" (sin auth real). */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
