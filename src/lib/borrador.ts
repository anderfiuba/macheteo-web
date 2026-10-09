export const BORRADOR_KEY = "macheteo:borrador";
export const limpiarBorrador = () => {
  if (typeof window !== "undefined") localStorage.removeItem(BORRADOR_KEY);
};
