"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { CONTACTO_EMAIL } from "@/lib/config";
import { Circulo } from "./Iconos";
import { NAV } from "./copy";

/** Nav sobre el hero (L04). Desktop: anclas + Ingresar + Crear cuenta. Mobile: ☰ abre overlay role=dialog "Menú". */
export function LandingNav() {
  const [abierto, setAbierto] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const abrirRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const boton = abrirRef.current;
    cerrarRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      boton?.focus();
    };
  }, [abierto]);

  return (
    <header className="mx-auto flex max-w-[1180px] items-center gap-7 px-5 py-4 text-sm font-medium text-white lg:px-16 lg:py-6">
      <Link href="/" aria-label="macheteo, ir al inicio"><Logo invert /></Link>
      <nav aria-label="Navegación principal" className="ml-auto hidden gap-6 lg:flex">
        {NAV.map(([t, h]) => <a key={h} href={h} className="hover:underline">{t}</a>)}
      </nav>
      <Link href="/ingresar" className="ml-4 hidden underline decoration-wavy underline-offset-4 lg:inline">Ingresar</Link>
      <Link href="/registro" className="hidden rounded-md bg-white px-4 py-2 font-semibold text-birome hover:bg-celeste lg:inline-block">Crear cuenta</Link>
      <button
        ref={abrirRef}
        type="button"
        aria-label="Abrir menú"
        aria-expanded={abierto}
        onClick={() => setAbierto(true)}
        className="ml-auto flex h-10 w-10 items-center justify-center rounded-[11px] border-[1.5px] border-white/75 lg:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 8h14M5 12h14M5 16h14" /></svg>
      </button>

      {abierto && (
        <div role="dialog" aria-modal="true" aria-label="Menú" className="fixed inset-0 z-50 flex flex-col bg-birome px-5 pb-6 pt-4 text-white lg:hidden">
          <div className="flex items-center justify-between">
            <Logo invert />
            <button ref={cerrarRef} type="button" aria-label="Cerrar menú" onClick={() => setAbierto(false)} className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-white text-lg text-birome">✕</button>
          </div>
          <nav aria-label="Secciones" className="mt-8 flex flex-col">
            {NAV.map(([t, h]) => (
              <a key={h} href={h} onClick={() => setAbierto(false)} className="my-2 font-serif text-[32px] leading-tight">
                {h === "#es-gratis" ? <span className="relative inline-block">{t}<Circulo /></span> : t}
              </a>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2.5">
            <Link href="/registro" className="rounded-md bg-white py-3 text-center font-semibold text-birome">Crear cuenta</Link>
            <Link href="/ingresar" className="rounded-md border-[1.5px] border-white py-3 text-center font-semibold">Ingresar</Link>
            <div className="mt-2 flex justify-center gap-4 text-xs underline">
              <Link href="/terminos">Términos y condiciones</Link>
              <Link href="/privacidad">Privacidad</Link>
              <a href={`mailto:${CONTACTO_EMAIL}`} aria-label={`Contacto: escribinos a ${CONTACTO_EMAIL}`}>Contacto</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
