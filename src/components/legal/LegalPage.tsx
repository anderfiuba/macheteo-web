export const VERSION_LEGAL = "2026-10 (borrador)";

export function LegalPage({ titulo, secciones }: { titulo: string; secciones: { titulo: string; texto: string }[] }) {
  return (
    <article className="rounded-lg border-[1.5px] border-borde bg-hoja p-6 shadow-sm">
      <div role="note" className="mb-6 rounded-lg border-2 border-dashed border-noche bg-celeste p-4 text-sm font-semibold text-noche">
        ⚠️ Texto provisorio, la versión final está en preparación. Este contenido no tiene validez legal todavía.
      </div>
      <h1 className="text-[34px] leading-tight">{titulo}</h1>
      <p className="mt-1 text-xs text-gastado">Versión {VERSION_LEGAL}</p>
      {secciones.map((s, i) => (
        <section key={s.titulo} className="mt-6">
          <h2 className="text-xl">{i + 1}. {s.titulo}</h2>
          <p className="mt-2 text-noche">
            <span className="mr-1 rounded bg-celeste px-1.5 py-0.5 text-xs font-semibold text-noche">PROVISORIO</span>
            {s.texto}
          </p>
        </section>
      ))}
    </article>
  );
}
