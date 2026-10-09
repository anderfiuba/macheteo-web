import Link from "next/link";

export default function Page() {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <h1 className="text-xl font-bold">Comprar créditos</h1>
      <p className="mt-2 text-slate-600">Packs Prueba, Parcial y Cuatrimestre con Mercado Pago. Llega en la semana 3.</p>
      <Link href="/nuevo" className="mt-4 inline-block font-semibold text-blue-700 underline">Crear un resumen</Link>
    </div>
  );
}
