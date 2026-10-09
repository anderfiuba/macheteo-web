import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "Comprar créditos · Macheteo" };

// S14 — packs con Mercado Pago en semana 3 (CR-03). Respeta ?volver= (D7).
export default async function Page({ searchParams }: { searchParams: Promise<{ volver?: string }> }) {
  const { volver } = await searchParams;
  const v = volver?.startsWith("/") && !volver.startsWith("//") ? volver : null;
  return (
    <>
      <h1 className="mb-6 text-[22px] font-bold lg:text-2xl">Comprar créditos</h1>
      <EmptyState titulo="Muy pronto" texto="Packs Prueba, Parcial y Cuatrimestre con Mercado Pago. Llega en la semana 3." />
      {v && <Link href={v} className="mt-4 inline-block font-semibold text-primary underline">Volver a mi resumen</Link>}
    </>
  );
}
