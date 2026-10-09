"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { DONACION, DONACION_ACTIVA } from "@/lib/config";
import { useToast } from "@/components/Toast";

async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Fallback (iOS Safari viejo / contexto no seguro)
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, texto.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

export type Ubicacion = "perfil" | "bajo_boton" | "mientras_se_arma";
const ev = api.registrarEvento;

/** donacion_cta_visto una vez por montaje (plan-beta §9). */
function useCtaVisto(ubicacion: Ubicacion) {
  const hecho = useRef(false);
  useEffect(() => {
    if (!DONACION_ACTIVA || hecho.current) return;
    hecho.current = true;
    ev("donacion_cta_visto", { ubicacion });
  }, [ubicacion]);
}

function Renglon({ label, valor, mono, ubicacion }: { label: "Alias" | "CVU"; valor: string; mono?: boolean; ubicacion: Ubicacion }) {
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    if (await copiarTexto(valor)) {
      setCopiado(true);
      ev(label === "Alias" ? "donacion_alias_copiado" : "donacion_cvu_copiado", { ubicacion });
      toast(<><strong>{label} copiado.</strong> Pegalo en Mercado Pago o en tu banco.</>);
      setTimeout(() => setCopiado(false), 2000); // S18: "✓ Copiado" por 2 s
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-celeste px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-gastado">{label}</p>
        <p className={`truncate font-semibold ${mono ? "font-mono text-sm tracking-tight" : ""}`}>{valor}</p>
      </div>
      <button
        type="button"
        onClick={copiar}
        aria-label={`Copiar ${label}`}
        className={`h-11 shrink-0 rounded-sm border-[1.5px] px-4 text-sm font-semibold transition ${copiado ? "border-birome bg-birome text-white" : "border-birome bg-hoja text-birome hover:bg-celeste"}`}
      >
        {copiado ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

/** DO-02 / S18 · Tarjeta "Bancá a Macheteo". Datos estáticos (DO-01): alias + titular; CVU y QR se ocultan si están vacíos. */
export function TarjetaDonacion({ onCerrar, ubicacion }: { onCerrar?: () => void; ubicacion: Ubicacion }) {
  useEffect(() => {
    if (DONACION_ACTIVA && DONACION.qrUrl) ev("donacion_qr_mostrado", { ubicacion });
  }, [ubicacion]);
  if (!DONACION_ACTIVA) return null;
  const d = DONACION;
  return (
    <section aria-labelledby="donacion-titulo" className="rounded-lg bg-hoja p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 id="donacion-titulo" className="flex items-center gap-2 text-[18px] leading-6 lg:text-[22px] lg:leading-7">
          <span aria-hidden>☕︎</span> Bancá a Macheteo
        </h2>
        {onCerrar && (
          <button onClick={onCerrar} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-full bg-celeste text-lg">×</button>
        )}
      </div>
      <p className="mt-3 text-sm">
        Macheteo es gratis. Cada machete usa una IA que cuesta plata: si te sirvió, transferí lo que quieras, sin mínimo ni máximo.
      </p>
      <div className="mt-4 space-y-3">
        {d.alias && <Renglon label="Alias" valor={d.alias} ubicacion={ubicacion} />}
        {d.cvu && <Renglon label="CVU" valor={d.cvu} mono ubicacion={ubicacion} />}
        {d.qrUrl && (
          <figure className="flex items-center gap-4 rounded-lg border border-borde p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.qrUrl} alt="QR para donar con Mercado Pago" width={88} height={88} className="h-[88px] w-[88px] rounded-sm border border-borde" />
            <figcaption className="text-sm text-gastado">
              <span className="hidden md:inline">Escaneá con la app de Mercado Pago.</span>
              <span className="md:hidden">Desde otra pantalla, escaneá el QR con la app de Mercado Pago.</span>
            </figcaption>
          </figure>
        )}
      </div>
      {d.titular && <p className="mt-3 text-xs text-gastado">Titular: {d.titular}</p>}
      {ubicacion === "perfil" && <YaDone />}
    </section>
  );
}

/** "Ya doné" (DON-28): RPC declarar_donacion, máx. 1 por día. Sin monto obligatorio, sin datos de la transferencia. */
function YaDone() {
  const toast = useToast();
  const [estado, setEstado] = useState<"idle" | "enviando" | "hecho">("idle");
  async function declarar() {
    if (estado !== "idle") return;
    setEstado("enviando");
    const r = await api.declararDonacion();
    if (r.ok) {
      setEstado("hecho");
      toast(<><strong>¡Gracias por bancar Macheteo!</strong> Lo anotamos.</>);
    } else if (r.error === "ya_declarada_hoy") {
      setEstado("hecho");
      toast("Ya lo anotamos hoy. ¡Gracias!");
    } else {
      setEstado("idle");
      toast("No pudimos anotarlo. Probá de nuevo en un rato.");
    }
  }
  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-borde pt-3">
      <p className="text-xs text-gastado">¿Ya transferiste? Avisanos (es opcional y no cambia nada de lo que podés hacer).</p>
      <button
        type="button" onClick={declarar} disabled={estado !== "idle"}
        className="h-11 shrink-0 rounded-md border-[1.5px] border-birome px-4 text-sm font-semibold text-birome hover:bg-celeste disabled:opacity-60"
      >
        {estado === "hecho" ? "✓ ¡Gracias!" : estado === "enviando" ? "Anotando…" : "Ya doné"}
      </button>
    </div>
  );
}

/** Modal (desktop) / bottom sheet (mobile) con la tarjeta. Nunca se abre solo. */
export function DonacionSheet({ abierto, onCerrar, ubicacion }: { abierto: boolean; onCerrar: () => void; ubicacion: Ubicacion }) {
  const cerrarRef = useRef(onCerrar);
  useEffect(() => {
    cerrarRef.current = onCerrar;
  });
  useEffect(() => {
    if (!abierto || !DONACION_ACTIVA) return;
    ev("donacion_abierta", { ubicacion });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cerrarRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, ubicacion]);
  if (!abierto || !DONACION_ACTIVA) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Bancá a Macheteo" className="fixed inset-0 z-40 flex items-end justify-center bg-[var(--overlay)] md:items-center md:p-6" onClick={onCerrar}>
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-hoja pt-2 shadow-lg md:max-w-xl md:rounded-lg" onClick={(e) => e.stopPropagation()}>
        <div aria-hidden className="mx-auto mb-1 h-1 w-10 rounded-full bg-borde md:hidden" />
        <TarjetaDonacion onCerrar={onCerrar} ubicacion={ubicacion} />
      </div>
    </div>
  );
}

/** DO-03 · "Es gratis. Si te sirve, podés donar lo que quieras." (o la variante "Mientras esperás"). */
export function LineaDonar({ className = "", variante = "armar" }: { className?: string; variante?: "armar" | "esperando" }) {
  const [abierto, setAbierto] = useState(false);
  const ubicacion: Ubicacion = variante === "armar" ? "bajo_boton" : "mientras_se_arma";
  useCtaVisto(ubicacion);
  if (!DONACION_ACTIVA) return null;
  const link = <button type="button" onClick={() => setAbierto(true)} className="link-garabato">podés donar</button>;
  return (
    <>
      {variante === "armar" ? (
        <p className={`text-center text-sm text-gastado ${className}`}>
          <span aria-hidden>☕︎ </span>Es gratis. Si te sirve, {link} lo que quieras.
        </p>
      ) : (
        <p className={`text-sm ${className}`}>
          <strong>Mientras esperás:</strong> Macheteo es gratis y lo bancan quienes lo usan. Si te sirve, {link} lo que quieras.
        </p>
      )}
      <DonacionSheet abierto={abierto} onCerrar={() => setAbierto(false)} ubicacion={ubicacion} />
    </>
  );
}

/** DO-02 · Fila en el Perfil que no interrumpe. */
export function FilaDonar() {
  const [abierto, setAbierto] = useState(false);
  useCtaVisto("perfil");
  if (!DONACION_ACTIVA) return null;
  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-lg bg-celeste px-4 py-3">
        <p className="text-sm"><span aria-hidden>☕︎ </span>Macheteo es gratis. Si te sirve, podés bancarlo.</p>
        <button type="button" onClick={() => setAbierto(true)} className="link-garabato shrink-0 text-birome">Donar</button>
      </div>
      <DonacionSheet abierto={abierto} onCerrar={() => setAbierto(false)} ubicacion="perfil" />
    </>
  );
}
