import Link from "next/link";

export default function Page() {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <h1 className="text-xl font-bold">Historial de créditos</h1>
      <p className="mt-2 text-slate-600">Acá vas a ver compras, regalos, reservas, consumos y devoluciones. Llega en la semana 3.</p>
      <Link href="/nuevo" className="mt-4 inline-block font-semibold text-blue-700 underline">Crear un resumen</Link>
    </div>
  );
}
