"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { EmptyState } from "@/components/EmptyState";
import { api, MSG_SERVICIO_NO_DISPONIBLE, SERVICIO_NO_DISPONIBLE, type ResumenItem } from "@/lib/api";
import { TIPOS } from "@/lib/catalog";

const ESTADO: Record<ResumenItem["estado"], string> = {
  en_cola: "En la fila", generando: "Armándose", armando: "Armándose", listo: "Listo", error: "No se pudo armar",
};
const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "America/Argentina/Buenos_Aires" });

/** BI-02 · Descarga directa desde la lista (Edge Function url_descarga_resumen → URL firmada 5 min). */
function BotonDescargar({ id, materia }: { id: string; materia: string }) {
  const toast = useToast();
  const [estado, setEstado] = useState<"idle" | "cargando" | "error">("idle");
  async function descargar() {
    if (estado === "cargando") return;
    setEstado("cargando");
    try {
      const url = await api.getUrlDescarga(id);
      if (!url) throw new Error("sin_url");
      api.registrarEvento("pdf_descargado", { resumen_id: id, es_redescarga: true });
      window.location.href = url;
      setEstado("idle");
    } catch {
      setEstado("error");
      toast("No pudimos descargar el PDF. Probá de nuevo en un rato.");
    }
  }
  const etiqueta = estado === "cargando" ? "Preparando…" : estado === "error" ? "Reintentar" : "Descargar";
  return (
    <button
      type="button"
      onClick={descargar}
      disabled={estado === "cargando"}
      aria-label={`${etiqueta} PDF de ${materia || "machete sin materia"}`}
      aria-busy={estado === "cargando"}
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
        estado === "error" ? "border border-tachon text-tachon" : "bg-birome text-white hover:bg-noche"
      }`}
    >
      {estado === "cargando" ? (
        <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <span aria-hidden>{estado === "error" ? "↻" : "⬇"}</span>
      )}
      <span className="hidden sm:inline">{etiqueta}</span>
    </button>
  );
}

/** BI-01 (versión mínima): lista de machetes con estado; cada uno abre su página (reintentar); los listos se descargan directo (BI-02). */
export function BibliotecaLista() {
  const [items, setItems] = useState<ResumenItem[] | null>(null);
  useEffect(() => {
    api.listarResumenes().then(setItems, () => setItems([]));
  }, []);
  if (items === null) return <p className="text-sm text-gastado">Cargando…</p>;
  if (!items.length) {
    return <EmptyState titulo="Todavía no armaste ningún machete" texto="Tus machetes quedan guardados acá y los podés descargar las veces que quieras." cta={{ href: "/nuevo", label: "Armar mi primer machete" }} />;
  }
  return (
    <ul className="divide-y divide-borde rounded-lg border border-borde bg-hoja">
      {items.map((r) => {
        const tipo = TIPOS.find((t) => t.id === r.tipo);
        return (
          <li key={r.id} className="flex items-center gap-2 pr-3 hover:bg-celeste">
            <Link href={`/resumenes/${r.id}`} className="flex min-w-0 flex-1 items-center gap-4 py-3 pl-4">
              <span aria-hidden className="text-2xl">{tipo?.icono ?? "📄"}</span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate">{r.materia || "Sin materia"}</strong>
                <span className="text-sm text-gastado">
                  {tipo?.nombre ?? r.tipo} · {fecha(r.createdAt)}{r.estado === "listo" && r.paginas ? ` · ${r.paginas} ${r.paginas === 1 ? "página" : "páginas"}` : ""}
                </span>
                {r.estado === "error" && r.errorCodigo === SERVICIO_NO_DISPONIBLE && (
                  <span className="mt-0.5 block text-sm text-tachon">{MSG_SERVICIO_NO_DISPONIBLE}</span>
                )}
              </span>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.estado === "listo" ? "bg-celeste text-birome" : r.estado === "error" ? "text-tachon" : "text-gastado"}`}>
                {ESTADO[r.estado]}
              </span>
            </Link>
            {r.estado === "listo" && <BotonDescargar id={r.id} materia={r.materia} />}
          </li>
        );
      })}
    </ul>
  );
}
