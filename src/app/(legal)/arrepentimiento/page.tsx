import { ArrepentimientoForm } from "@/components/legal/ArrepentimientoForm";

export const metadata = { title: "Botón de arrepentimiento · Macheteo" };

/** Res. SCI 424/2020 — revocación de la compra dentro de los 10 días corridos. Procesamiento manual. */
export default function Page() {
  return (
    <div className="mx-auto max-w-[560px] rounded-lg border-[1.5px] border-border bg-surface p-6 shadow-1">
      <h1 className="text-[22px] font-bold lg:text-2xl">Botón de arrepentimiento</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Si compraste un pack de créditos, podés arrepentirte dentro de los <strong>10 días corridos</strong> desde la compra,
        sin dar explicaciones (Res. SCI 424/2020 y art. 34 de la Ley 24.240). Completá el formulario y te damos un número de
        solicitud. Revisamos cada pedido a mano y te respondemos por email.
      </p>
      <ArrepentimientoForm />
    </div>
  );
}
