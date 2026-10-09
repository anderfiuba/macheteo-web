import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "Mi biblioteca · Macheteo" };

// S07 — listado real en semana 3 (BI-01). Por ahora, empty state.
export default function Page() {
  return (
    <>
      <h1 className="mb-6 text-[22px] font-bold lg:text-2xl">Mi biblioteca</h1>
      <EmptyState titulo="Todavía no tenés resúmenes" cta={{ href: "/nuevo", label: "Crear mi primer resumen" }} />
    </>
  );
}
