"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { api } from "@/lib/api";
import { Boton, InlineError } from "./ui";

/** Checkbox "Acepto los Términos y la Política de Privacidad" (mismo texto que el registro). */
export function CheckTerminos({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: string | null }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex items-start gap-3 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-birome" aria-invalid={Boolean(error)} />
      <span>
        Acepto los <Link href="/terminos" target="_blank" className="text-birome underline">Términos y Condiciones</Link> y la{" "}
        <Link href="/privacidad" target="_blank" className="text-birome underline">Política de Privacidad</Link>.
        {error && <InlineError>{error}</InlineError>}
      </span>
    </label>
  );
}

export function AceptarTerminosForm({ volver }: { volver: string }) {
  const router = useRouter();
  const [acepto, setAcepto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function continuar(e: React.FormEvent) {
    e.preventDefault();
    if (!acepto) return setError("Tenés que aceptar los Términos y la Política de Privacidad.");
    setCargando(true);
    setError(null);
    if (await api.aceptarTerminos()) {
      router.replace(volver);
      router.refresh();
    } else {
      setCargando(false);
      setError("No pudimos guardar tu aceptación. Probá de nuevo.");
    }
  }

  return (
    <form onSubmit={continuar} noValidate className="space-y-5">
      <CheckTerminos checked={acepto} onChange={(v) => { setAcepto(v); if (v) setError(null); }} error={error} />
      <Boton type="submit" cargando={cargando}>Continuar</Boton>
    </form>
  );
}
