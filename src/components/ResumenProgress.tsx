"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type EstadoResumen, type EstadoResumenDTO } from "@/lib/api";
import { EXTENSIONES, TIPOS } from "@/lib/catalog";
import { useBalance } from "./BalanceProvider";

const ETIQUETAS: Record<EstadoResumen, string> = {
  en_cola: "En cola",
  generando: "Escribiendo tu resumen",
  armando: "Armando el PDF",
  listo: "¡Listo!",
  error: "Algo falló",
};
const AYUDA: Partial<Record<EstadoResumen, string>> = { generando: "Esto tarda un par de minutos.", armando: "Ya casi." };
const ORDEN: EstadoResumen[] = ["en_cola", "generando", "armando", "listo"];
const btnPrim = "flex h-12 w-full items-center justify-center rounded-md bg-primary px-5 font-semibold text-white hover:bg-primary-hover lg:h-11";
const btnSec = "flex h-12 w-full items-center justify-center rounded-md border-[1.5px] border-border-strong bg-surface px-5 font-semibold hover:bg-surface-alt lg:h-11";

export function ResumenProgress({ id }: { id: string }) {
  const [r, setR] = useState<EstadoResumenDTO | null | undefined>(undefined);
  const [offline, setOffline] = useState(false);
  const { refrescar } = useBalance();

  useEffect(() => {
    let activo = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const data = await api.getEstadoResumen(id);
        if (!activo) return;
        setOffline(false);
        setR(data);
        if (data && (data.estado === "listo" || data.estado === "error")) {
          refrescar(); // se liquidó: actualizar saldo sin recargar
          return;
        }
      } catch {
        if (activo) setOffline(true);
      }
      timer = setTimeout(tick, 3000); // polling cada 3 s (TODO: Supabase Realtime)
    };
    tick();
    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [id, refrescar]);

  if (r === undefined) {
    return <div className="mx-auto h-64 max-w-[560px] animate-pulse rounded-lg bg-surface-alt" aria-busy="true" aria-label="Cargando" />;
  }
  if (r === null) {
    return (
      <div className="mx-auto max-w-[560px] rounded-lg border-[1.5px] border-border bg-surface p-6 text-center shadow-1">
        <p>No encontramos ese resumen.</p>
        <Link href="/biblioteca" className="mt-3 inline-block font-semibold text-primary underline">Ir a mi biblioteca</Link>
      </div>
    );
  }

  async function descargar() {
    const url = await api.getUrlDescarga(id);
    if (url) window.location.href = url;
    else alert("No pudimos descargar. Probá de nuevo. (En modo demo no hay PDF.)");
  }

  const idx = ORDEN.indexOf(r.estado);
  const esError = r.estado === "error";
  const enCurso = !esError && r.estado !== "listo";
  const meta = [r.materia, TIPOS.find((t) => t.id === r.tipo)?.nombre, EXTENSIONES.find((e) => e.id === r.extension)?.nombre].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto max-w-[560px] rounded-lg border-[1.5px] border-border bg-surface p-6 shadow-1">
      <p className="text-sm text-ink-muted">{meta}</p>

      {enCurso && (
        <>
          <h1 className="mt-2 text-[22px] font-bold lg:text-2xl" aria-live="polite">{ETIQUETAS[r.estado]}</h1>
          <div className="mt-4 h-2 rounded-full bg-surface-alt" role="progressbar" aria-valuenow={r.progreso} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del resumen">
            <div className={`h-2 rounded-full bg-info transition-all duration-200 ${offline ? "opacity-50" : ""}`} style={{ width: `${r.progreso}%` }} />
          </div>
          <p className="tnum mt-2 text-sm text-ink-muted">
            {offline ? "Perdimos la conexión, reintentando…" : (
              <>
                {r.progreso} %
                {r.estado === "en_cola" && r.posicionCola ? ` · Hay ${r.posicionCola} resúmenes antes que el tuyo.` : AYUDA[r.estado] ? ` · ${AYUDA[r.estado]}` : ""}
              </>
            )}
          </p>
          <ol className="mt-4 space-y-2 text-sm">
            {ORDEN.map((e, i) => (
              <li key={e} className={`flex items-center gap-2 ${i === idx ? "font-semibold" : i < idx ? "" : "text-ink-muted"}`}>
                <span aria-hidden className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] text-[10px] ${i < idx ? "border-ink bg-ink text-white" : "border-border-strong"}`}>{i < idx ? "✓" : ""}</span>
                {ETIQUETAS[e]}
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-md border-[1.5px] border-border p-3 text-sm">Podés cerrar esta pestaña: te mandamos un mail cuando esté listo.</p>
          <Link href="/biblioteca" className={`${btnSec} mt-4`}>Ir a mi biblioteca</Link>
        </>
      )}

      {r.estado === "listo" && (
        <div className="mt-4 text-center">
          <h1 className="text-[22px] font-bold text-success lg:text-2xl" aria-live="polite">✓ ¡Listo!</h1>
          <p className="tnum mt-2 text-sm">
            {r.paginas} páginas · cobramos <strong>{r.creditosCobrados} créditos</strong>
            {r.creditosDevueltos ? <> · te devolvimos <strong>{r.creditosDevueltos}</strong></> : null}
          </p>
          <div className="mt-5 space-y-3">
            <button onClick={descargar} className={btnPrim}>⬇ Descargar PDF</button>
            <Link href="/nuevo" className={btnSec}>+ Nuevo resumen</Link>
          </div>
          <button disabled title="Disponible en semana 3 (BI-03)" className="mt-4 text-sm text-ink-muted underline disabled:opacity-60">Reportar error</button>
        </div>
      )}

      {esError && (
        <div className="mt-4 text-center">
          <h1 className="text-[22px] font-bold text-danger lg:text-2xl" aria-live="polite">⚠ Algo falló, te devolvimos {r.creditosReservados} créditos</h1>
          <p className="mt-2 text-sm text-ink-muted">No te cobramos nada. Podés intentarlo de nuevo.</p>
          <div className="mt-5 space-y-3">
            <Link href="/nuevo?paso=1" className={btnPrim}>Reintentar</Link>
            <Link href="/biblioteca" className={btnSec}>Ir a mi biblioteca</Link>
          </div>
          {r.errorCodigo && <p className="mt-4 text-xs text-ink-muted">Código: {r.errorCodigo} (para soporte)</p>}
        </div>
      )}
    </div>
  );
}
