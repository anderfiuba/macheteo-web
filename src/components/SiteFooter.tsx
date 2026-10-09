"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONTACTO_EMAIL, DEFENSA_CONSUMIDOR_URL } from "@/lib/config";

export function SiteFooter() {
  // La landing trae su propio footer (L03).
  if (usePathname() === "/") return null;
  return (
    <footer className="border-t border-borde bg-hoja pb-20 lg:pb-0">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-sm text-gastado lg:px-10">
        <Link href="/terminos" className="hover:underline">Términos</Link>
        <Link href="/privacidad" className="hover:underline">Privacidad</Link>
        <a href={`mailto:${CONTACTO_EMAIL}`} aria-label={`Contacto: escribinos a ${CONTACTO_EMAIL}`} className="hover:underline">Contacto</a>
        <a
          href={DEFENSA_CONSUMIDOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Defensa de las y los Consumidores. Para reclamos ingrese aquí (sitio del Gobierno, se abre en una pestaña nueva)"
          className="hover:underline"
        >
          Defensa de las y los Consumidores ↗
        </a>
        <span>Macheteo es gratis · © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
