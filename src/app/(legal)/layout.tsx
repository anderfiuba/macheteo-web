import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-borde bg-hoja/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3">
          <Link href="/" aria-label="Macheteo, inicio"><Logo /></Link>
          <nav className="flex gap-4 text-sm font-medium text-noche">
            <Link href="/terminos" className="hover:underline">Términos</Link>
            <Link href="/privacidad" className="hover:underline">Privacidad</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1120px] px-4 py-6">{children}</main>
    </>
  );
}
