"use client";
import { useState } from "react";
import { isSupabaseConfigured, SITE_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Aviso, Boton, Campo, emailValido } from "./ui";

export function RecoverForm({ vencido }: { vencido?: boolean }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValido(email)) return setErr("Ingresá un email válido.");
    setErr(null);
    setCargando(true);
    if (isSupabaseConfigured) {
      await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${SITE_URL}/auth/callback?type=recovery` });
    }
    setCargando(false);
    setEnviado(true); // respuesta idéntica exista o no el email
  }

  if (enviado) return <Aviso tipo="ok">Si hay una cuenta con ese email, te mandamos un link para crear una contraseña nueva. Vence en 1 hora.</Aviso>;
  return (
    <form onSubmit={onSubmit} noValidate>
      {vencido && <Aviso tipo="warning">El link venció o ya se usó. Pedí uno nuevo.</Aviso>}
      <p className="mb-5 text-sm text-ink-muted">Escribí tu email y te mandamos un link para crear una contraseña nueva.</p>
      <Campo id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={err} />
      <Boton type="submit" cargando={cargando}>Mandarme el link</Boton>
    </form>
  );
}
