import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CONTACTO_EMAIL, DEFENSA_CONSUMIDOR_URL, UBICACION } from "@/lib/config";

/** Footer de la landing (L03, LG4). */
export function FooterLegal() {
  return (
    <footer className="mx-auto max-w-[1180px] px-5 pb-24 pt-5 text-[12.5px] text-gastado lg:px-16 lg:pb-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
        <Logo />
        <span>Hecho en Argentina. © 2026</span>
        <nav aria-label="Enlaces legales" className="flex flex-wrap gap-4 lg:ml-auto">
          <Link href="/terminos" className="link-garabato">Términos y condiciones</Link>
          <Link href="/privacidad" className="link-garabato">Privacidad</Link>
          <a href={`mailto:${CONTACTO_EMAIL}`} aria-label={`Contacto: escribinos a ${CONTACTO_EMAIL}`} className="link-garabato">Contacto</a>
        </nav>
      </div>
      <p className="mt-3">
        Defensa de las y los Consumidores. Para reclamos{" "}
        <a
          href={DEFENSA_CONSUMIDOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Defensa de las y los Consumidores. Para reclamos ingrese aquí (sitio del Gobierno, se abre en una pestaña nueva)"
          className="font-semibold text-birome underline"
        >
          ingrese aquí ↗
        </a>
      </p>
      <p className="mt-1 text-[11px]">Macheteo es para estudiar: respetá las reglas de tu cátedra. Los machetes se arman con IA y pueden tener errores. · {UBICACION}</p>
    </footer>
  );
}
