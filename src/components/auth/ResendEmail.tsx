"use client";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Boton, Campo, emailValido } from "./ui";

/** Reenviar email de verificación con cooldown de 60 s (CU-03). */
export function ResendEmail({ emailInicial }: { emailInicial?: string }) {
  const [email, setEmail] = useState(emailInicial ?? "");
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function reenviar() {
    if (!emailValido(email)) return setMsg("Ingresá un email válido.");
    if (isSupabaseConfigured) await createClient().auth.resend({ type: "signup", email });
    setMsg("Te lo mandamos de nuevo. Revisá también spam.");
    setCooldown(60);
  }
  return (
    <div>
      {!emailInicial && <Campo id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
      <Boton type="button" variante="secundario" onClick={reenviar} disabled={cooldown > 0}>
        {cooldown > 0 ? `Reenviar email (${cooldown} s)` : "Reenviar email"}
      </Boton>
      {msg && <p role="status" className="mt-2 text-center text-sm text-gastado">{msg}</p>}
    </div>
  );
}
