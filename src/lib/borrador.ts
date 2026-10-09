export const BORRADOR_KEY = "macheteo:borrador";
/** Pedido con el que se armó cada machete (para "Editar y reintentar", N-19). Solo en este dispositivo. */
export const PEDIDO_PREFIX = "macheteo:pedido:";

export const limpiarBorrador = () => {
  if (typeof window !== "undefined") localStorage.removeItem(BORRADOR_KEY);
};

/** Al cerrar sesión: borrador + pedidos guardados (no dejar apuntes en una compu compartida). */
export const limpiarDatosLocales = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BORRADOR_KEY);
  Object.keys(localStorage).filter((k) => k.startsWith(PEDIDO_PREFIX)).forEach((k) => localStorage.removeItem(k));
};

export function guardarPedido(resumenId: string, borrador: unknown) {
  try {
    localStorage.setItem(PEDIDO_PREFIX + resumenId, JSON.stringify(borrador));
  } catch {}
}

/** Copia el pedido de un machete fallido al borrador del formulario Nuevo. Devuelve true si había algo. */
export function pedidoABorrador(resumenId: string): boolean {
  const raw = localStorage.getItem(PEDIDO_PREFIX + resumenId);
  if (!raw) return false;
  localStorage.setItem(BORRADOR_KEY, raw);
  return true;
}
