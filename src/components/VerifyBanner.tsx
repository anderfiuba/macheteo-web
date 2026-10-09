"use client";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

export function VerifyBanner({ email, verificado }: { email: string | null; verificado: boolean }) {
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  if (verificado || !email) return null;

  async function reenviar() {
    if (!isSupabaseConfigured || !email) return;
    await createClient().auth.resend({ type: "signup", email });
    setMsg("Te lo mandamos de nuevo. Revisá también spam.");
    setCooldown(60);
  }
  return (
    <div className="border-b border-sky-200 bg-sky-50 px-4 py-2 text-center text-sm text-sky-900">
      Verificá tu email para generar resúmenes y recibir tus 2 créditos de regalo.{" "}
      <button onClick={reenviar} disabled={cooldown > 0} className="font-semibold underline disabled:opacity-50">
        {cooldown > 0 ? `Reenviar (${cooldown} s)` : "Reenviar"}
      </button>
      {msg && <span className="ml-2">{msg}</span>}
    </div>
  );
}
