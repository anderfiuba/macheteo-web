import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="font-hand text-2xl font-bold text-slate-900">Macheteo</Link>
          <nav className="flex gap-4 text-sm font-medium text-slate-700">
            <Link href="/terminos" className="hover:underline">Términos</Link>
            <Link href="/privacidad" className="hover:underline">Privacidad</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </>
  );
}
