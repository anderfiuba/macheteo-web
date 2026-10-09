import { Wizard } from "@/components/wizard/Wizard";

export const metadata = { title: "Nuevo resumen · Macheteo" };

export default function Page() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Nuevo resumen</h1>
      <Wizard />
    </>
  );
}
