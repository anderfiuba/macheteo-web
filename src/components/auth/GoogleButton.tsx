"use client";
import { isSupabaseConfigured, SITE_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Boton } from "./ui";

export function GoogleButton({ volver = "/biblioteca" }: { volver?: string }) {
  async function entrar() {
    if (!isSupabaseConfigured) return alert("Modo demo: Supabase no está configurado.");
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${SITE_URL}/auth/callback?volver=${encodeURIComponent(volver)}` },
    });
  }
  return <Boton type="button" variante="secundario" onClick={entrar}>Seguir con Google</Boton>;
}

export function Separador() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
      <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
    </div>
  );
}
