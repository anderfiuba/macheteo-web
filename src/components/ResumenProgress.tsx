"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type EstadoResumen, type EstadoResumenDTO } from "@/lib/api";
import { useBalance } from "./BalanceProvider";

const ETIQUETAS: Record<EstadoResumen, string> = {
  en_cola: "En cola",
  generando: "Escribiendo tu resumen",
  armando: "Armando el PDF",
  listo: "¡Listo!",
  error: "Algo falló",
};
const ORDEN: EstadoResumen[] = ["en_cola", "generando", "armando", "listo"];

export function ResumenProgress({ id }: { id: string }) {
  const [r, setR] = useState<EstadoResumenDTO | null | undefined>(undefined);
  const { refrescar } = useBalance();

  useEffect(() => {
    let activo = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const data = await api.getEstadoResumen(id);
      if (!activo) return;
      setR(data);
      if (data && (data.estado === "listo" || data.estado === "error")) {
        refrescar(); // se liquidó: actualizar saldo sin recargar
        return;
      }
      timer = setTimeout(tick, 3000); // polling cada 3 s (TODO: Supabase Realtime)
    };
    tick();
    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [id, refrescar]);

  if (r === undefined) return <p className="text-slate-500">Cargando…</p>;
  if (r === null) return <p>No encontramos ese resumen. <Link href="/nuevo" className="underline">Crear uno nuevo</Link></p>;

  async function descargar() {
    const url = await api.getUrlDescarga(id);
    if (url) window.location.href = url;
    else alert("La descarga todavía no está disponible (modo demo).");
  }

  const idx = ORDEN.indexOf(r.estado);
  const esError = r.estado === "error";
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{r.materia}</p>
      <h1 className="mt-1 text-2xl font-bold" aria-live="polite">{ETIQUETAS[r.estado]}</h1>

      <div className="mt-4 h-3 rounded-full bg-slate-200" role="progressbar" aria-valuenow={r.progreso} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del resumen">
        <div className={`h-3 rounded-full transition-all duration-700 ${esError ? "bg-red-500" : r.estado === "listo" ? "bg-green-600" : "bg-blue-600"}`} style={{ width: `${esError ? 100 : r.progreso}%` }} />
      </div>
      <ol className="mt-3 flex justify-between text-xs">
        {ORDEN.map((e, i) => (
          <li key={e} className={!esError && i <= idx ? "font-semibold text-slate-900" : "text-slate-400"}>{ETIQUETAS[e]}</li>
        ))}
      </ol>

      {r.estado !== "listo" && !esError && (
        <p className="mt-6 text-sm text-slate-600">Podés cerrar esta pestaña: te avisamos por email cuando esté listo.</p>
      )}
      {r.estado === "listo" && (
        <div className="mt-6">
          <p className="text-sm text-slate-700">
            {r.paginas} páginas · te cobramos {r.creditosCobrados} créditos
            {r.creditosDevueltos ? ` y te devolvimos ${r.creditosDevueltos}` : ""}.
          </p>
          <button onClick={descargar} className="mt-3 rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-600">Descargar PDF</button>
        </div>
      )}
      {esError && (
        <div className="mt-6">
          <p className="text-sm text-red-700">Algo falló, te devolvimos {r.creditosReservados} créditos.</p>
          <Link href="/nuevo" className="mt-3 inline-block rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white">Reintentar</Link>
        </div>
      )}
    </div>
  );
}
