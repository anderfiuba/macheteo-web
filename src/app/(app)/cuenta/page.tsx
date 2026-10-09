import { CuentaAcciones } from "@/components/CuentaAcciones";

export const metadata = { title: "Mi cuenta · Macheteo" };

// S17 — cerrar sesión (CU-05). Eliminar cuenta (CU-06) llega en semana 3.
export default function Page() {
  return (
    <>
      <h1 className="mb-6 text-[22px] font-bold lg:text-2xl">Mi cuenta</h1>
      <CuentaAcciones />
    </>
  );
}
