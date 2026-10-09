import { TINTAS, TIPOS, fechaCorta, hojasDe, type Hoja, type Largo, type Tinta, type TipoResumen } from "@/lib/catalog";

// Preview "Así va a salir" (CSS), estilo de la referencia: títulos en Young Serif, cuerpo en Instrument Sans, una tinta.
const FONDO: Record<Hoja, string> = {
  rayado: "linear-gradient(90deg, transparent 26px, #F1B9BC 26px, #F1B9BC 27px, transparent 27px), repeating-linear-gradient(#fff, #fff 19px, #D7DEF7 20px)",
  cuadriculado: "linear-gradient(#DCE2F5 1px, transparent 1px) 0 0/14px 14px, linear-gradient(90deg, #DCE2F5 1px, #fff 1px) 0 0/14px 14px",
  punteado: "radial-gradient(#C9D1EE 1.1px, #fff 1.2px) 0 0/14px 14px",
};

export interface PreviewProps { hoja: Hoja; tinta: Tinta; tipo: TipoResumen | null; largo: Largo | null; nombre: string; materia: string; fecha: string; apuntes: string }

function tituloDe(apuntes: string, materia: string) {
  const primera = apuntes.split(/[\n.:]/).map((s) => s.trim()).find((s) => s.length > 3);
  return (primera ?? materia ?? "Tu machete").slice(0, 42) || "Tu machete";
}

export function Preview(p: PreviewProps) {
  const ink = TINTAS.find((t) => t.id === p.tinta)!.hex;
  const tipo = TIPOS.find((t) => t.id === p.tipo)?.nombre ?? "Tipo de resumen";
  const total = hojasDe(p.largo) || 2;
  return (
    <figure aria-label="Así va a salir" className="aspect-[1/1.414] w-full overflow-hidden rounded-md border border-borde bg-white shadow-sm" style={{ background: FONDO[p.hoja] }}>
      <div className="flex h-full flex-col p-4 pl-9 text-[10px] leading-[20px]" style={{ color: ink }}>
        <p className="text-right text-[9px] opacity-80">{[p.nombre || "Tu nombre", p.materia || "Materia", fechaCorta(p.fecha)].join(", ")}</p>
        <p className="font-serif text-[20px] leading-[24px]">{tituloDe(p.apuntes, p.materia)}</p>
        <p className="opacity-80">{tipo}</p>
        <p className="mt-2 font-serif text-[13px]">Lo importante</p>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <div className="rounded border px-2 leading-[16px]" style={{ borderColor: ink }}><strong>Concepto</strong><br />Definición corta y clara.</div>
          <div className="rounded border px-2 leading-[16px]" style={{ borderColor: ink }}><strong>Ejemplo</strong><br />Un caso resuelto.</div>
        </div>
        <p className="mt-2 font-serif text-[13px]">Paso a paso</p>
        <p>1. Primer paso explicado.</p>
        <p>2. Segundo paso, con el porqué.</p>
        <p className="mt-1"><span aria-hidden>★</span> <strong>Ojo:</strong> lo que seguro toman.</p>
        <p className="mt-auto text-center text-[9px] opacity-70">1 de {total}</p>
      </div>
    </figure>
  );
}
