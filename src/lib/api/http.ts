"use client";
import type { CrearResumenInput, CrearResumenResult, EliminarCuentaResult, ErrorCrear, PedidoGuardado } from "./types";

const ERRORES: ErrorCrear[] = [
  "email_no_verificado", "terminos_no_aceptados", "validacion", "limite_errores", "limite_activos",
  "limite_diario", "limite_global", "cuenta_inexistente", "no_autenticado", "no_configurado",
];

async function postMachetes(body: Record<string, unknown>): Promise<CrearResumenResult> {
  try {
    const res = await fetch("/api/machetes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { resumen_id?: string; error?: string; vuelve_at?: string | null; motivo?: "hojas" | "ip" | "ip_desconocida" | null };
    if (res.ok && data.resumen_id) return { ok: true, resumenId: data.resumen_id };
    const error = ERRORES.find((e) => e === data.error) ?? "desconocido";
    return { ok: false, error, vueltaAt: data.vuelve_at ?? null, motivo: data.motivo ?? null };
  } catch {
    return { ok: false, error: "desconocido" };
  }
}

export const crearViaRoute = (i: CrearResumenInput) =>
  postMachetes({
    apuntes: i.apuntes, instrucciones: i.instrucciones ?? null, tipo: i.tipo, extension: i.largo,
    diseno: i.hoja, tinta: i.tinta, opciones: i.opciones, idempotency_key: i.idempotencyKey,
  });

export const reintentarViaRoute = (resumenId: string, key: string) =>
  postMachetes({ reintentar_de: resumenId, idempotency_key: key });

export async function pedidoViaRoute(resumenId: string): Promise<PedidoGuardado | null> {
  try {
    const res = await fetch(`/api/machetes/${encodeURIComponent(resumenId)}/pedido`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PedidoGuardado;
  } catch {
    return null;
  }
}

export async function eliminarCuentaViaRoute(confirmacion: string): Promise<EliminarCuentaResult> {
  try {
    const res = await fetch("/api/cuenta/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmacion }),
    });
    if (res.ok) return { ok: true };
    const { error } = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: error === "confirmacion_invalida" || error === "no_autenticado" || error === "no_configurado" ? error : "error" };
  } catch {
    return { ok: false, error: "error" };
  }
}
