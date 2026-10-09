import { BIROMES, RESALTADORES, type ColorBirome, type ColorResaltador, type Diseno } from "@/lib/catalog";

// Preview CSS provisorio hasta tener las miniaturas reales del motor (NR-05 / Diseño).
const FONDOS: Record<Diseno, string> = {
  rayado: "repeating-linear-gradient(#fff, #fff 17px, #bfdbfe 18px)",
  cuadriculado: "linear-gradient(#e2e8f0 1px, transparent 1px) 0 0/12px 12px, linear-gradient(90deg, #e2e8f0 1px, #fff 1px) 0 0/12px 12px",
  punteado: "radial-gradient(#f9a8d4 1px, #fffbf5 1px) 0 0/12px 12px",
};

export function DesignPreview(p: { diseno: Diseno; resaltador: ColorResaltador; birome: ColorBirome; materia: string; nombre: string; fecha: string }) {
  const res = RESALTADORES.find((r) => r.id === p.resaltador)!.hex;
  const bir = BIROMES.find((b) => b.id === p.birome)!.hex;
  return (
    <figure aria-label="Vista previa del diseño" className="aspect-[1/1.414] w-full overflow-hidden rounded-md border shadow-md" style={{ background: FONDOS[p.diseno], color: bir }}>
      <div className="font-hand h-full p-3 text-[13px] leading-[18px]">
        <div className="flex justify-between text-[11px]">
          <span>{p.nombre || "Tu nombre"}</span>
          <span>{p.fecha.split("-").reverse().join("/")}</span>
        </div>
        <p className="mt-2 text-lg font-bold">
          <span style={{ background: `linear-gradient(transparent 45%, ${res} 45%)` }}>{p.materia || "Materia"}</span>
        </p>
        <p className="mt-1">• Definición: lorem ipsum dolor sit amet.</p>
        <p>• <span style={{ backgroundColor: res }}>Concepto clave</span> para el parcial.</p>
        <p>• Ejemplo resuelto paso a paso…</p>
      </div>
    </figure>
  );
}
