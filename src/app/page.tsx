import type { Metadata } from "next";
import Link from "next/link";
import { AvisoBaja } from "@/components/EliminarCuenta";
import { BotonFijo } from "@/components/landing/BotonFijo";
import { FooterLegal } from "@/components/landing/FooterLegal";
import { HojaHero } from "@/components/landing/HojaHero";
import { Estrella, Flecha, IconoTipo, Taza, Tick } from "@/components/landing/Iconos";
import { LandingNav } from "@/components/landing/LandingNav";
import { Preguntas } from "@/components/landing/Preguntas";
import { CHECKS, CHECKS_M, EJEMPLO_PDF, GRATIS_T, NOTA_DON, PASOS, PASOS_NOTA, SUB, TIPOS } from "@/components/landing/copy";
import { DONACION_ACTIVA } from "@/lib/config";

// L01–L04. Sin sesión se ve la landing; con sesión el middleware manda a /nuevo.
export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { url: "/" } };

const ARMAR = "/registro"; // S01; con sesión nunca se llega acá (middleware → /nuevo)

export default function Landing() {
  return (
    <>
      <AvisoBaja />
      <div id="hero" className="bg-birome text-white">
        <LandingNav />
        <main className="mx-auto grid max-w-[1180px] gap-10 px-5 pb-0 pt-3 lg:grid-cols-[1.05fr_1fr] lg:px-16 lg:pb-[70px] lg:pt-2.5">
          <div>
            <p className="mt-2 text-[15px] font-semibold lg:mt-8 lg:text-lg">Es gratis.</p>
            <h1 className="mb-4 mt-1 font-serif text-[34px] leading-[1.08] !text-white lg:mb-6 lg:text-[76px] lg:leading-[1.02]">
              <span className="lg:hidden">Estudiá lo que<br />te van a tomar.</span>
              <span className="hidden lg:inline">Estudiá lo<br />que te van<br />a tomar.</span>
            </h1>
            <p className="mb-6 max-w-[470px] text-sm leading-relaxed text-[#E3E6FF] lg:mb-7 lg:text-[17px]">{SUB}</p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
              <Link href={ARMAR} className="rounded-md bg-white px-6 py-3 text-center font-semibold text-birome hover:bg-celeste lg:w-[200px]">
                Armar mi machete
              </Link>
              <div className="flex items-center justify-between text-[13px] lg:contents lg:text-sm">
                <a
                  href={EJEMPLO_PDF}
                  target="_blank"
                  rel="noopener"
                  aria-label="Ver un ejemplo de machete en PDF (se abre en una pestaña nueva)"
                  className="font-semibold underline decoration-wavy underline-offset-4"
                >
                  Ver un ejemplo ↗
                </a>
                <span className="flex items-center gap-1.5 text-[#D9DDFF] lg:hidden"><Estrella />Gratis, sin tarjeta</span>
              </div>
            </div>
            <p className="mt-5 hidden items-center gap-2 text-[13px] text-[#D9DDFF] lg:flex"><Estrella /> Gratis, sin tarjeta y sin planes.</p>
          </div>
          <div className="mx-auto w-[290px] translate-y-6 overflow-hidden pb-4 lg:hidden"><HojaHero completa={false} /></div>
          <div className="hidden px-8 pt-2.5 lg:block"><HojaHero /></div>
        </main>
      </div>

      <section id="como-funciona" className="mx-auto max-w-[1180px] scroll-mt-4 px-5 py-10 lg:px-16 lg:py-16">
        <h2 className="mb-6 text-[30px] lg:mb-8 lg:text-[46px] lg:leading-tight">Cómo funciona</h2>
        <ol className="grid gap-5 lg:grid-cols-3 lg:gap-10">
          {PASOS.map(([t, d], i) => (
            <li key={t} className="flex gap-3.5 lg:block">
              <div className="flex w-7 items-center gap-3.5 font-serif text-[40px] leading-none text-birome lg:w-auto lg:text-[64px]">
                {i > 0 && <Flecha className="hidden lg:block" />}
                {i + 1}
              </div>
              <div>
                <b className="block text-[15px] lg:mb-2 lg:mt-4 lg:text-base">{t}</b>
                <p className="mt-1 text-sm leading-relaxed">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-gastado lg:text-sm">{PASOS_NOTA}</p>
      </section>

      <section id="tipos" className="scroll-mt-4 bg-celeste">
        <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-16 lg:py-16">
          <h2 className="mb-2 text-2xl leading-tight lg:text-[46px]">Un machete para cada momento</h2>
          <p className="mb-5 text-xs lg:text-sm">Elegís el tipo según lo que te falta repasar. Lo podés cambiar en cada guía.</p>
          <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-4">
            {TIPOS.map(([ic, t, d]) => (
              <div key={t} className="flex gap-3 rounded-[14px] bg-white px-3 py-3 lg:gap-4 lg:rounded-2xl lg:px-5 lg:py-5">
                <IconoTipo tipo={ic} />
                <div>
                  <h3 className="font-serif text-base text-birome lg:mb-1.5 lg:text-xl">{t}</h3>
                  <p className="text-xs leading-snug lg:text-[13.5px]">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="es-gratis" className="mx-auto grid max-w-[1180px] scroll-mt-4 gap-3 px-5 py-10 lg:grid-cols-2 lg:gap-12 lg:px-16 lg:py-16">
        <h2 className="text-[44px] leading-none lg:text-[76px]">Es gratis.</h2>
        <div>
          <p className="text-sm leading-relaxed lg:text-base">{GRATIS_T}</p>
          <ul className="my-4 flex flex-col gap-2.5 text-[13px] lg:text-sm">
            {CHECKS.map((c, i) => (
              <li key={c} className="flex items-center gap-2.5">
                <Tick />
                <span className="hidden lg:inline">{c}</span>
                <span className="lg:hidden">{CHECKS_M[i]}</span>
              </li>
            ))}
          </ul>
          {DONACION_ACTIVA && (
            <p className="flex gap-2.5 border-t border-borde pt-3.5 text-xs text-gastado lg:text-[12.5px]"><Taza />{NOTA_DON}</p>
          )}
        </div>
      </section>

      <section id="preguntas" className="mx-auto max-w-[1180px] scroll-mt-4 px-5 pb-10 lg:px-16 lg:pb-16 lg:pt-5">
        <h2 className="mb-4 text-[30px] lg:mb-8 lg:text-[46px]">Preguntas</h2>
        <Preguntas />
      </section>

      <section id="cta-final" className="bg-birome text-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3.5 px-5 py-9 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-12">
          <div>
            <h2 className="font-serif text-4xl leading-[1.05] !text-white lg:text-[52px]">Pegá tu<br />primera guía.</h2>
            <p className="mt-3 text-sm text-[#D9DDFF]">Es gratis y no te pedimos tarjeta.</p>
          </div>
          <div className="flex items-center gap-3.5">
            <Flecha />
            <Link href={ARMAR} className="flex-1 rounded-md bg-white px-6 py-3 text-center font-semibold text-birome hover:bg-celeste lg:w-[200px] lg:flex-none">
              Armar mi machete
            </Link>
          </div>
        </div>
      </section>

      <FooterLegal />
      <BotonFijo />
    </>
  );
}
