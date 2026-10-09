import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "Biblioteca · Macheteo" };

// BI-01 — listado real con chips por tipo en semana 3. Por ahora, empty state.
export default function Page() {
  return (
    <>
      <h1 className="mb-6 text-[28px] leading-[34px] lg:text-[36px] lg:leading-[42px]">Biblioteca</h1>
      <EmptyState titulo="Todavía no armaste ningún machete" texto="Tus machetes quedan guardados acá y los podés descargar las veces que quieras." cta={{ href: "/nuevo", label: "Armar mi primer machete" }} />
    </>
  );
}
