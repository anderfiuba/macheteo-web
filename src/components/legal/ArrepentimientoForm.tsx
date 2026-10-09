"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Aviso, Boton, Campo, InlineError, emailValido } from "@/components/auth/ui";

const MOTIVO_MAX = 1000;

export function ArrepentimientoForm() {
  const [email, setEmail] = useState("");
  const [referencia, setReferencia] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errores, setErrores] = useState<{ email?: string; referencia?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [numero, setNumero] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cargando) return;
    const errs: typeof errores = {};
    if (!emailValido(email)) errs.email = "Ingresá el email con el que compraste.";
    if (referencia.trim().length < 3) errs.referencia = "Ingresá el número de operación de Mercado Pago o la referencia del pago.";
    setErrores(errs);
    if (Object.keys(errs).length) return;
    setCargando(true);
    setError(null);
    try {
      const r = await api.solicitarArrepentimiento({ email: email.trim(), referenciaPago: referencia.trim(), motivo: motivo.trim() || undefined });
      if (r.ok) setNumero(r.numero);
      else setError(r.error === "rate_limit" ? "Probá de nuevo en unos minutos." : r.error === "validacion" ? "Revisá los datos e intentá de nuevo." : "Algo falló. Probá de nuevo en un ratito.");
    } catch {
      setError("No pudimos enviar la solicitud. Revisá tu conexión y reintentá.");
    } finally {
      setCargando(false);
    }
  }

  if (numero) {
    return (
      <div className="mt-6" role="status">
        <Aviso tipo="ok">Recibimos tu solicitud.</Aviso>
        <p className="text-sm">Tu número de solicitud es:</p>
        <p className="tnum mt-1 rounded-md bg-highlight px-3 py-2 text-center text-2xl font-extrabold tracking-wide">{numero}</p>
        <p className="mt-3 text-sm text-ink-muted">Guardalo: lo vas a necesitar si nos escribís. Te respondemos a <strong>{email}</strong> con los próximos pasos.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6">
      {error && <Aviso tipo="error">{error}</Aviso>}
      <Campo id="arr-email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errores.email} />
      <Campo
        id="arr-ref" label="Pago (número de operación o referencia)" placeholder="Ej.: 1234567890"
        value={referencia} onChange={(e) => setReferencia(e.target.value)} error={errores.referencia}
      />
      <p className="-mt-4 mb-5 text-xs text-ink-muted">Lo encontrás en el comprobante de Mercado Pago o en el mail de la compra.</p>
      <label htmlFor="arr-motivo" className="mb-5 block">
        <span className="text-base font-semibold">Motivo <span className="font-normal text-ink-muted">(opcional)</span></span>
        <textarea
          id="arr-motivo" rows={3} maxLength={MOTIVO_MAX} value={motivo} onChange={(e) => setMotivo(e.target.value)}
          placeholder="No hace falta que nos digas por qué, pero si querés contarnos, nos ayuda."
          className="mt-2 w-full rounded-md border-[1.5px] border-border-strong bg-surface p-3 text-base outline-none focus:ring-2 focus:ring-primary"
        />
        {motivo.length > MOTIVO_MAX && <InlineError>Máximo {MOTIVO_MAX} caracteres.</InlineError>}
      </label>
      <Boton type="submit" cargando={cargando}>{cargando ? "Enviando…" : "Enviar solicitud de arrepentimiento"}</Boton>
    </form>
  );
}
