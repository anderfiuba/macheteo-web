import { BIROMES, RESALTADORES, type ColorBirome, type ColorResaltador, type Diseno } from "@/lib/catalog";

// Preview CSS provisorio con los "papeles" de design-tokens §6, hasta tener miniaturas del motor (C14).
const FONDOS: Record<Diseno, string> = {
  rayado: "linear-gradient(90deg, transparent 22px, #E8A0A0 22px, #E8A0A0 23px, transparent 23px), repeating-linear-gradient(#FFFFFF, #FFFFFF 17px, #BFD3E6 18px)",
  cuadriculado: "linear-gradient(#C9D3DC 1px, transparent 1px) 0 0/12px 12px, linear-gradient(90deg, #C9D3DC 1px, #FFFFFF 1px) 0 0/12px 12px",
  punteado: "radial-gradient(#D9CFE3 1.2px, #FFFDF8 1.2px) 0 0/12px 12px",
};

export function DesignPreview(p: { diseno: Diseno; resaltador: ColorResaltador; birome: ColorBirome; materia: string; nombre: string; fecha: string }) {
  const res = RESALTADORES.find((r) => r.id === p.resaltador)!.hex;
  const bir = BIROMES.find((b) => b.id === p.birome)!.hex;
  const resaltar = { backgroundColor: res, mixBlendMode: "multiply" as const, opacity: 0.85 };
  return (
    <figure aria-label="Vista previa del diseño" className="aspect-[1/1.414] w-full overflow-hidden rounded-md border border-border shadow-1" style={{ background: FONDOS[p.diseno], color: bir }}>
      <div className="h-full p-3 pl-7 text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-hand-stack)" }}>
        <div className="flex justify-between text-[11px]">
          <span>{p.nombre || "Tu nombre"}</span>
          <span>{p.fecha.split("-").reverse().join("/")}</span>
        </div>
        <p className="mt-2 text-lg font-bold">
          <span style={{ background: `linear-gradient(transparent 45%, ${res} 45%)` }}>{p.materia || "Materia"}</span>
        </p>
        <p className="mt-1">• Definición: lorem ipsum dolor sit amet.</p>
        <p>• <span style={resaltar}>Concepto clave</span> para el parcial.</p>
        <p>• Ejemplo resuelto paso a paso…</p>
      </div>
    </figure>
  );
}
