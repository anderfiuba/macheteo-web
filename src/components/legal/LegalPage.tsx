export const VERSION_LEGAL = "2026-10 (borrador)";

export function LegalPage({ titulo, secciones }: { titulo: string; secciones: { titulo: string; texto: string }[] }) {
  return (
    <article className="rounded-lg border-[1.5px] border-border bg-surface p-6 shadow-1">
      <div role="note" className="mb-6 rounded-lg border-2 border-dashed border-warning bg-warning-bg p-4 text-sm font-semibold text-warning">
        ⚠️ Texto provisorio, la versión final está en preparación. Este contenido no tiene validez legal todavía.
      </div>
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <p className="mt-1 text-xs text-ink-muted">Versión {VERSION_LEGAL}</p>
      {secciones.map((s, i) => (
        <section key={s.titulo} className="mt-6">
          <h2 className="text-lg font-semibold">{i + 1}. {s.titulo}</h2>
          <p className="mt-2 text-ink">
            <span className="mr-1 rounded bg-highlight px-1.5 py-0.5 text-xs font-semibold text-ink">PROVISORIO</span>
            {s.texto}
          </p>
        </section>
      ))}
    </article>
  );
}
