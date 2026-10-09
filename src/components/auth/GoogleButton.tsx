"use client";
import { isSupabaseConfigured, SITE_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton({ next = "/nuevo" }: { next?: string }) {
  async function entrar() {
    if (!isSupabaseConfigured) return alert("Modo demo: Supabase no está configurado.");
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }
  return (
    <button type="button" onClick={entrar} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-medium hover:bg-slate-50">
      Seguir con Google
    </button>
  );
}

export function Separador() {
  return (
    <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
      <span className="h-px flex-1 bg-slate-200" />o<span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
