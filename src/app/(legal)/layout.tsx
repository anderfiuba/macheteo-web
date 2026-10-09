import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="font-hand text-2xl text-ink">Macheteo</Link>
          <nav className="flex gap-4 text-sm font-medium text-ink">
            <Link href="/terminos" className="hover:underline">Términos</Link>
            <Link href="/privacidad" className="hover:underline">Privacidad</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1120px] px-4 py-6">{children}</main>
    </>
  );
}
