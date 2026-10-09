import Link from "next/link";
import { Logo } from "@/components/Logo";

// L05 · 404 (LG11)
export default function NotFound() {
  return (
    <>
      <header className="border-b border-borde">
        <div className="mx-auto max-w-[1180px] px-5 py-4 lg:px-16"><Link href="/" aria-label="macheteo, ir al inicio"><Logo /></Link></div>
      </header>
      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 py-20 text-center">
        <div aria-hidden className="font-serif text-[64px] leading-none text-celeste lg:text-[120px]">404</div>
        <h1 className="text-3xl lg:text-[44px] lg:leading-tight">Esta hoja no está en la carpeta.</h1>
        <p className="text-sm lg:text-base">La página que buscás no existe o se movió.</p>
        <Link href="/" className="w-full rounded-md bg-birome px-6 py-3 font-semibold text-white lg:w-[260px]">Volver al inicio</Link>
        <Link href="/nuevo" className="link-garabato">Armar mi machete</Link>
      </main>
    </>
  );
}
