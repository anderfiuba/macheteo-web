"use client";
import Link from "next/link";
import { useState } from "react";
import { isSupabaseConfigured, SITE_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Aviso, Boton, Campo, emailValido } from "./ui";
import { GoogleButton, Separador } from "./GoogleButton";

export const VERSION_TERMINOS = "2026-10";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errores, setErrores] = useState<{ email?: string; password?: string; acepto?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errores = {};
    if (!emailValido(email)) errs.email = "Ingresá un email válido.";
    if (password.length < 8) errs.password = "La contraseña tiene que tener al menos 8 caracteres.";
    if (!acepto) errs.acepto = "Tenés que aceptar los Términos y la Política de Privacidad.";
    setErrores(errs);
    if (Object.keys(errs).length) return;

    setCargando(true);
    setError(null);
    if (isSupabaseConfigured) {
      const { error } = await createClient().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${SITE_URL}/auth/callback?next=/nuevo`,
          // El trigger de perfiles (Backend) lee estos metadatos para acepto_terminos_at / version_terminos.
          data: { acepto_terminos: true, version_terminos: VERSION_TERMINOS },
        },
      });
      if (error && error.status === 429) {
        setCargando(false);
        setError("Probá de nuevo en unos minutos.");
        return;
      }
      // Cualquier otro caso (incluido email ya registrado) → mensaje genérico, no revela si existe.
    }
    setCargando(false);
    setListo(true);
  }

  if (listo) {
    return (
      <Aviso tipo="ok">
        ¡Listo! Si el email es válido, te llegó un mensaje para verificar tu cuenta. Al verificarla te regalamos 2 créditos.
      </Aviso>
    );
  }

  return (
    <>
      {error && <Aviso tipo="error">{error}</Aviso>}
      <GoogleButton />
      <Separador />
      <form onSubmit={onSubmit} noValidate>
        <Campo id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errores.email} />
        <Campo id="password" label="Contraseña" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} error={errores.password} />
        <label className="mb-4 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} className="mt-1" aria-invalid={Boolean(errores.acepto)} />
          <span>
            Acepto los <Link href="/terminos" className="underline">Términos y Condiciones</Link> y la{" "}
            <Link href="/privacidad" className="underline">Política de Privacidad</Link> (Ley 25.326).
            {errores.acepto && <span className="mt-1 block text-xs text-red-600">{errores.acepto}</span>}
          </span>
        </label>
        <Boton type="submit" cargando={cargando}>Crear cuenta</Boton>
      </form>
    </>
  );
}
