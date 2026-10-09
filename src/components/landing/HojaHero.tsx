import Image from "next/image";
import { EJEMPLO_P1, EJEMPLO_PDF } from "./copy";

/** Hoja del hero = página 1 del PDF de ejemplo (motor v2, Análisis II). Abre el PDF completo en otra pestaña. */
export function HojaHero({ completa = true }: { completa?: boolean }) {
  return (
    <a
      href={EJEMPLO_PDF}
      target="_blank"
      rel="noopener"
      aria-label="Ver un ejemplo de machete en PDF (se abre en una pestaña nueva)"
      className="group relative block"
    >
      <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-3.5 rotate-[4deg] rounded-md bg-[#5560E6]" />
      <div className={`relative -rotate-2 overflow-hidden rounded-md bg-white shadow-lg transition group-hover:-rotate-1 ${completa ? "" : "h-[210px]"}`}>
        <Image
          src={EJEMPLO_P1}
          alt="Ejemplo de machete de Análisis II sobre integrales dobles, hoja 1 de 3"
          width={909}
          height={1287}
          sizes="(min-width: 1024px) 440px, 290px"
          priority={completa}
          className="h-auto w-full"
        />
      </div>
    </a>
  );
}
