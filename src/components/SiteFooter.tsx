import Link from "next/link";

/** Footer global (todas las páginas, públicas y logueadas). Res. SCI 424/2020: link visible al Botón de arrepentimiento. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-alt">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-sm text-ink-muted lg:px-10">
        <Link href="/terminos" className="hover:underline">Términos</Link>
        <Link href="/privacidad" className="hover:underline">Privacidad</Link>
        <Link href="/arrepentimiento" className="font-semibold text-ink underline">Botón de arrepentimiento</Link>
        <span>© {new Date().getFullYear()} Macheteo</span>
      </div>
    </footer>
  );
}
