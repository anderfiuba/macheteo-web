"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { api, type ResumenItem } from "@/lib/api";
import { TIPOS } from "@/lib/catalog";

const ESTADO: Record<ResumenItem["estado"], string> = {
  en_cola: "En la fila", generando: "Armándose", armando: "Armándose", listo: "Listo", error: "No se pudo armar",
};
const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "America/Argentina/Buenos_Aires" });

/** BI-01 (versión mínima): lista de machetes con estado; cada uno abre su página (descarga / reintentar). Chips por tipo: semana 3. */
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
          <li key={r.id}>
            <Link href={`/resumenes/${r.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-celeste">
              <span aria-hidden className="text-2xl">{tipo?.icono ?? "📄"}</span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate">{r.materia || "Sin materia"}</strong>
                <span className="text-sm text-gastado">
                  {tipo?.nombre ?? r.tipo} · {fecha(r.createdAt)}{r.estado === "listo" && r.paginas ? ` · ${r.paginas} ${r.paginas === 1 ? "página" : "páginas"}` : ""}
                </span>
              </span>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.estado === "listo" ? "bg-celeste text-birome" : r.estado === "error" ? "text-tachon" : "text-gastado"}`}>
                {ESTADO[r.estado]}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
