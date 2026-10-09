"use client";
import { useState } from "react";
import { isSupabaseConfigured, SITE_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Boton, InlineError } from "./ui";

/** ¿Google está habilitado en Supabase Auth? (GET /auth/v1/settings es público con la publishable key). */
async function googleHabilitado(): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } });
    if (!res.ok) return true; // ante la duda, intentamos y que decida Supabase
    const s = (await res.json()) as { external?: { google?: boolean } };
    return s.external?.google !== false;
  } catch {
    return true;
  }
}

export function GoogleButton({ volver = "/nuevo" }: { volver?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  async function entrar() {
    setError(null);
    if (!isSupabaseConfigured) return setError("Modo demo: el ingreso con Google no está disponible.");
    setCargando(true);
    // Sin esto, con el proveedor apagado Supabase muestra un JSON crudo ("provider is not enabled").
    if (!(await googleHabilitado())) {
      setCargando(false);
      return setError("Entrar con Google no está disponible en este momento. Probá más tarde.");
    }
    const { error: e } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${SITE_URL}/auth/callback?volver=${encodeURIComponent(volver)}` },
    });
    if (e) {
      setCargando(false);
      setError("No pudimos conectar con Google. Probá de nuevo.");
    }
  }
  return (
    <div>
      <Boton type="button" onClick={entrar} disabled={cargando}>
        {cargando ? "Conectando…" : "Continuar con Google"}
      </Boton>
      {error && <div role="alert" className="mt-2"><InlineError>{error}</InlineError></div>}
    </div>
  );
}

