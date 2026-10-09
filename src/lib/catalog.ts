// Catálogo del formulario "Nuevo machete" (NR-03..06, referencia "Birome").
export type TipoResumen = "ejercicios" | "teoria" | "machete" | "autoevaluacion";
export type Largo = "machete" | "corto" | "medio" | "completo";
/** IDs canónicos de diseño de hoja (frontend + backend). */
export type Hoja = "rayado" | "cuadriculado" | "punteado";
export type Tinta = "azul" | "negro" | "verde" | "violeta";

export const TIPOS: { id: TipoResumen; nombre: string; descripcion: string; icono: string }[] = [
  { id: "ejercicios", nombre: "Entender ejercicios", descripcion: "Cada ejercicio de la guía, resuelto y explicado paso a paso.", icono: "💡" },
  { id: "teoria", nombre: "Teoría para parcial", descripcion: "Los conceptos en orden, con ejemplos y lo que seguro toman.", icono: "📖" },
  { id: "machete", nombre: "Machete de 1 hoja", descripcion: "Todo en una hoja doble faz: definiciones, fórmulas y trampas.", icono: "📄" },
  { id: "autoevaluacion", nombre: "Autoevaluación", descripcion: "Preguntas con su respuesta para ponerte a prueba antes del examen.", icono: "✅" },
];

/** El número es el máximo de hojas. "Machete de 1 hoja" = 1 hoja doble faz = 2 págs (PA-08, decidido). */
export const LARGOS: { id: Largo; nombre: string; hojas: number }[] = [
  { id: "machete", nombre: "Machete", hojas: 2 },
  { id: "corto", nombre: "Corto", hojas: 4 },
  { id: "medio", nombre: "Medio", hojas: 8 },
  { id: "completo", nombre: "Completo", hojas: 16 },
];
export const hojasDe = (l: Largo | null) => LARGOS.find((x) => x.id === l)?.hojas ?? 0;

export const HOJAS: { id: Hoja; nombre: string }[] = [
  { id: "rayado", nombre: "Rayada" },
  { id: "cuadriculado", nombre: "Cuadriculada" },
  { id: "punteado", nombre: "Punteada" },
];

/** Tinta del PDF — hex según design-tokens v1 (--tinta-*). */
export const TINTAS: { id: Tinta; nombre: string; hex: string }[] = [
  { id: "azul", nombre: "Azul", hex: "#2B35DB" },
  { id: "negro", nombre: "Negro", hex: "#1A1A1A" },
  { id: "verde", nombre: "Verde", hex: "#1E6B47" },
  { id: "violeta", nombre: "Violeta", hex: "#7B2D8E" },
];

export const LIMITES = { apuntesMin: 300, apuntesMax: 40_000, instruccionesMax: 1_000, materiaMax: 60, nombreMax: 60 };
export const MACHETE_1_HOJA = { hojas: 2, largo: "machete" as Largo };

export const formatNumero = (n: number) => n.toLocaleString("es-AR");
/** "Unas 3 páginas de guía" (~4.000 caracteres por página) */
export const paginasDeGuia = (chars: number) => Math.max(1, Math.round(chars / 4000));
export const fechaCorta = (iso: string) => {
  const [, m, d] = iso.split("-");
  return d && m ? `${Number(d)}/${Number(m)}` : iso;
};
export const horaCorta = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
