"use client";
import { useRouter } from "next/navigation";
import { cerrarSesion } from "./UserMenu";

export function CuentaAcciones() {
  const router = useRouter();
  return (
    <div className="max-w-[440px] space-y-4">
      <section className="rounded-lg border-[1.5px] border-border bg-surface p-4 shadow-1">
        <h2 className="text-lg font-semibold">Sesión</h2>
        <p className="mt-1 text-sm text-ink-muted">Si cerrás sesión se borra el borrador del resumen que tengas a medias en este dispositivo.</p>
        <button onClick={() => cerrarSesion(router)} className="mt-4 h-12 w-full rounded-md border-[1.5px] border-border-strong bg-surface font-semibold hover:bg-surface-alt">
          Cerrar sesión
        </button>
      </section>
      <section className="rounded-lg border-[1.5px] border-border bg-surface p-4 shadow-1">
        <h2 className="text-lg font-semibold text-danger">Eliminar cuenta</h2>
        <p className="mt-1 text-sm text-ink-muted">Disponible en la semana 3.</p>
        <button disabled className="mt-4 h-12 w-full rounded-md border-2 border-danger font-semibold text-danger opacity-50">Eliminar cuenta</button>
      </section>
    </div>
  );
}
