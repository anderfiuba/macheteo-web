"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Isotipo } from "./Logo";

const ITEMS = [
  { href: "/nuevo", label: "Nuevo", icono: "✎" },
  { href: "/biblioteca", label: "Biblioteca", icono: "▤" },
  { href: "/perfil", label: "Perfil", icono: "◯" },
];

/** Navegación principal: sidebar azul (desktop) · tab bar abajo (mobile). Nuevo · Biblioteca · Perfil. */
export function AppNav({ inicial }: { inicial: string }) {
  const path = usePathname();
  const activo = (href: string) => path === href || path.startsWith(href + "/") || (href === "/nuevo" && path.startsWith("/resumenes"));
  return (
    <>
      <nav aria-label="Principal" className="sticky top-0 hidden h-screen w-[84px] shrink-0 flex-col items-center gap-2 bg-birome py-5 text-white lg:flex">
        <Link href="/nuevo" aria-label="Macheteo, inicio" className="mb-6"><Isotipo invert size={34} /></Link>
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={activo(it.href) ? "page" : undefined}
            className={`flex w-[64px] flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium ${activo(it.href) ? "bg-white text-birome" : "hover:bg-white/10"}`}
          >
            <span aria-hidden className="text-lg leading-none">{it.icono}</span>
            {it.label}
          </Link>
        ))}
        <Link href="/perfil" aria-label="Tu perfil" className="mt-auto flex h-10 w-10 items-center justify-center rounded-full bg-white font-serif text-birome">
          {inicial}
        </Link>
      </nav>

      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-borde bg-hoja lg:hidden">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={activo(it.href) ? "page" : undefined}
            className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${activo(it.href) ? "text-birome" : "text-gastado"}`}
          >
            <span aria-hidden className="text-lg leading-none">{it.icono}</span>
            {it.label}
            {activo(it.href) && <span aria-hidden className="h-1 w-1 rounded-full bg-birome" />}
          </Link>
        ))}
      </nav>
    </>
  );
}
