import { Wizard } from "@/components/wizard/Wizard";

export const metadata = { title: "Nuevo resumen · Macheteo" };

// Ruta única /nuevo?paso=1..5 (flows.md D2)
export default function Page() {
  return <Wizard />;
}
