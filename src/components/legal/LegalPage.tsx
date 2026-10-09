export const VERSION_LEGAL = "2026-10 (borrador)";

export function LegalPage({ titulo, secciones }: { titulo: string; secciones: { titulo: string; texto: string }[] }) {
  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm">
      <div role="note" className="mb-6 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
        ⚠️ Texto provisorio, la versión final está en preparación. Este contenido no tiene validez legal todavía.
      </div>
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <p className="mt-1 text-xs text-slate-500">Versión {VERSION_LEGAL}</p>
      {secciones.map((s, i) => (
        <section key={s.titulo} className="mt-6">
          <h2 className="text-lg font-semibold">{i + 1}. {s.titulo}</h2>
          <p className="mt-2 text-slate-700">
            <span className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900">PROVISORIO</span>
            {s.texto}
          </p>
        </section>
      ))}
    </article>
  );
}
