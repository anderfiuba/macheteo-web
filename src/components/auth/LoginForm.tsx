"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Aviso, Boton, Campo, emailValido } from "./ui";
import { GoogleButton, Separador } from "./GoogleButton";

export function LoginForm({ next, error: errorInicial }: { next: string; error?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(
    errorInicial === "link_vencido" ? "El link venció o ya se usó. Pedí uno nuevo." : null,
  );
  const [errores, setErrores] = useState<{ email?: string; password?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errores = {};
    if (!emailValido(email)) errs.email = "Ingresá un email válido.";
    if (!password) errs.password = "Ingresá tu contraseña.";
    setErrores(errs);
    if (Object.keys(errs).length) return;

    setCargando(true);
    setError(null);
    if (!isSupabaseConfigured) {
      router.push(next);
      return;
    }
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      setError(error.status === 429 ? "Probá de nuevo en unos minutos." : "El email o la contraseña no coinciden.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <>
      {error && <Aviso tipo="error">{error}</Aviso>}
      <GoogleButton next={next} />
      <Separador />
      <form onSubmit={onSubmit} noValidate>
        <Campo id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errores.email} />
        <Campo id="password" label="Contraseña" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errores.password} />
        <div className="mb-4 text-right">
          <Link href="/recuperar" className="text-sm text-blue-700 hover:underline">¿Te olvidaste la contraseña?</Link>
        </div>
        <Boton type="submit" cargando={cargando}>Entrar</Boton>
      </form>
    </>
  );
}
