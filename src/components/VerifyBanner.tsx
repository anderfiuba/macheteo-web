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
    <div className="border-b border-border bg-warning-bg text-warning">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm lg:px-10">
        <span><strong>Verificá tu email</strong> para generar y comprar.{msg && <span className="ml-2">{msg}</span>}</span>
        <button onClick={reenviar} disabled={cooldown > 0} className="min-h-11 rounded-md border-[1.5px] border-warning bg-surface px-3 font-semibold disabled:opacity-50">
          {cooldown > 0 ? `Reenviar (${cooldown} s)` : "Reenviar"}
        </button>
      </div>
    </div>
  );
}
