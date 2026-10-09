import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "Historial de créditos · Macheteo" };

// S16 — listado agrupado en semana 3 (CR-05).
export default function Page() {
  return (
    <>
      <h1 className="mb-6 text-[22px] font-bold lg:text-2xl">Historial de créditos</h1>
      <EmptyState titulo="Sin movimientos todavía" texto="Acá vas a ver tus compras, regalos y consumos." cta={{ href: "/creditos", label: "Comprar créditos" }} />
    </>
  );
}
