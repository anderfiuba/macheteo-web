/** Hoja del hero (LG13). Dibujada en HTML (no imagen) para que se lea en cualquier tamaño. */
export function HojaHero({ completa = true }: { completa?: boolean }) {
  return (
    <div className="relative" role="img" aria-label="Ejemplo de machete de Análisis I sobre derivadas, hoja 1 de 2">
      <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-3.5 rotate-[4deg] rounded-md bg-[#5560E6]" />
      <div aria-hidden className="relative -rotate-2 rounded-md bg-white px-6 py-5 text-[11px] leading-relaxed text-birome shadow-lg">
        <div className="text-[10px] text-gastado">Análisis I, machete de 2 hojas</div>
        <div className="mt-1 font-serif text-[34px] leading-tight">Derivadas</div>
        <div className="text-noche">Mide cuánto cambia f cuando x cambia muy poco.</div>
        <div className="mt-2 rounded border-[1.5px] border-birome px-3 py-2.5 text-center text-[13px] italic">
          f′(x) = lím<sub>h→0</sub> [f(x + h) − f(x)] / h
        </div>
        {completa ? (
          <>
            <div className="mt-3 inline-block rounded-full border-2 border-birome px-3 py-0.5 text-[14px] font-semibold">Si es derivable, es continua.</div>
            <div className="ml-10 mt-1 italic text-gastado">↳ Pero no al revés: |x| es continua en 0 y no es derivable ahí.</div>
            <div className="mt-3 font-serif text-[16px]">Reglas ☆</div>
            <div className="text-noche">Suma, producto, cociente y cadena. En una función compuesta se aplican una dentro de otra.</div>
            <div className="mt-1.5 rounded bg-celeste px-3 py-2 italic">(x² sen x)′ = 2x sen x + x² cos x</div>
            <div className="mt-4 text-right text-[10px] text-gastado">1 de 2</div>
          </>
        ) : (
          <div className="h-10" />
        )}
      </div>
    </div>
  );
}
