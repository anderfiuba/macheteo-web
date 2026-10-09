"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { copiarTexto } from "@/components/donacion/Donacion";
import { useToast } from "@/components/Toast";
import { CONTACTO_EMAIL, DONACION, DONACION_ACTIVA } from "@/lib/config";

function LineaAlias() {
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);
  if (!DONACION_ACTIVA || !DONACION.alias) return null;
  return (
    <>
      <span className="mt-2 flex items-center justify-between gap-2 rounded-[10px] bg-celeste py-1.5 pl-3 pr-1.5 text-[13px]">
        <span>Alias: <b>{DONACION.alias}</b></span>
        <button
          type="button"
          aria-label={`Copiar alias ${DONACION.alias}`}
          onClick={async () => {
            if (await copiarTexto(DONACION.alias)) {
              setCopiado(true);
              toast("Alias copiado. Pegalo en Mercado Pago o en tu banco.");
            } else toast(`No pudimos copiar el alias. Copialo a mano: ${DONACION.alias}`);
          }}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold ${copiado ? "bg-birome text-white" : "border border-borde-fuerte bg-white text-birome"}`}
        >
          {copiado ? "✓ Copiado" : "Copiar"}
        </button>
      </span>
      {DONACION.titular && <span className="mt-1.5 block text-[12.5px]">Titular: {DONACION.titular}</span>}
      <span className="mt-1.5 block text-[11.5px] leading-snug text-gastado">
        Donar es voluntario: no es una compra y no te da beneficios. Solo pueden donar mayores de 18. Si te equivocaste de monto, escribinos a{" "}
        <a href={`mailto:${CONTACTO_EMAIL}`} className="underline">{CONTACTO_EMAIL}</a> dentro de los 30 días.
      </span>
    </>
  );
}

type Item = { q: string; a: React.ReactNode };
const ITEMS: Item[] = [
  { q: "¿Es gratis de verdad?", a: "Sí. No hay planes ni te pedimos tarjeta. Las donaciones son opcionales." },
  ...(DONACION_ACTIVA
    ? [{ q: "¿Cómo dono?", a: <>Transferís al alias de Mercado Pago que está en tu perfil o acá abajo. Sin mínimo ni máximo.<LineaAlias /></> }]
    : []),
  { q: "¿Cómo creo mi cuenta?", a: "Con tu cuenta de Google, en un clic. No tenés que inventar otra contraseña." },
  { q: "¿Sirve para cualquier materia?", a: "Sí: programación, derecho, medicina, economía o historia. Las fórmulas salen bien escritas." },
  { q: "¿Y si la IA se equivoca?", a: "Puede pasar. Cada PDF lo avisa al final: revisalo con el material de tu cátedra." },
  // LG3 decía "2 armándose a la vez"; el límite real (PA-16) es 1 en curso.
  { q: "¿Hay un límite?", a: "Sí. Podés armar hasta 16 hojas por día, de a un machete por vez." },
  { q: "¿Donar me da algo extra?", a: "No, y está bien así: donar no cambia nada de lo que podés hacer. Es una forma de bancar el proyecto." },
  {
    q: "¿Qué pasa con mis apuntes?",
    a: <>Se usan solo para armar tu machete. No los publicamos ni vendemos tus datos. Podés borrar tu cuenta cuando quieras. <Link href="/privacidad" className="link-garabato">Política de privacidad</Link></>,
  },
  { q: "¿Esto es para copiarse?", a: "No. Es para estudiar. Respetá siempre las reglas de tu cátedra." },
  { q: "¿Puedo subir fotos o un PDF?", a: "Por ahora pegás el texto. Subir PDF y fotos está en camino." },
];

/** L03 · Desktop: las 9 abiertas en 2 columnas. Mobile: acordeón con la 1.ª abierta. */
export function Preguntas() {
  const [abierta, setAbierta] = useState<number | null>(0);
  const base = useId();
  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-11">
      {ITEMS.map((it, i) => {
        const open = abierta === i;
        return (
          <div key={it.q} className="border-t border-borde py-3.5 lg:pb-6 lg:pt-4">
            <h3 className="font-serif text-[17px] text-birome lg:text-lg">
              <button
                id={`${base}-q${i}`}
                type="button"
                aria-expanded={open}
                aria-controls={`${base}-a${i}`}
                onClick={() => setAbierta(open ? null : i)}
                className="flex w-full justify-between gap-2 text-left lg:pointer-events-none"
              >
                {it.q}
                <span aria-hidden className="font-sans lg:hidden">{open ? "−" : "+"}</span>
              </button>
            </h3>
            <div id={`${base}-a${i}`} role="region" aria-labelledby={`${base}-q${i}`} className={`${open ? "block" : "hidden"} mt-2 text-[13.5px] leading-relaxed lg:block`}>
              {it.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
