"use client";

// L05 · Error general (LG11)
export default function ErrorGeneral({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 py-20 text-center">
      <div aria-hidden className="font-serif text-[64px] leading-none text-celeste lg:text-[120px]">500</div>
      <h1 className="text-3xl lg:text-[44px] lg:leading-tight">Algo falló de nuestro lado.</h1>
      <p className="text-sm lg:text-base">Probá de nuevo en unos minutos.</p>
      <button type="button" onClick={() => reset()} className="w-full rounded-md bg-birome px-6 py-3 font-semibold text-white lg:w-[260px]">Recargar</button>
    </main>
  );
}
