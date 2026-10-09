// Catálogo del wizard. Los costos vienen del backend (getCosts); estos son los defaults del backlog.
export type TipoResumen = "ejercicios" | "teoria" | "machete" | "autoevaluacion";
export type Extension = "machete" | "corto" | "medio" | "completo";
export type Diseno = "rayado" | "cuadriculado" | "punteado";
export type ColorResaltador = "amarillo" | "verde" | "rosa" | "celeste" | "naranja";
export type ColorBirome = "azul" | "negra" | "verde" | "violeta";

export const TIPOS: { id: TipoResumen; nombre: string; descripcion: string }[] = [
  { id: "ejercicios", nombre: "Entender ejercicios", descripcion: "Paso a paso de los ejercicios tipo, con el porqué de cada paso." },
  { id: "teoria", nombre: "Teoría para parcial", descripcion: "Definiciones, teoremas y conceptos clave, ordenados para estudiar." },
  { id: "machete", nombre: "Machete de 1 hoja", descripcion: "Lo esencial en una hoja, anverso y reverso." },
  { id: "autoevaluacion", nombre: "Autoevaluación", descripcion: "Preguntas y respuestas para ponerte a prueba." },
];

export const EXTENSIONES: { id: Extension; nombre: string; paginas: string }[] = [
  { id: "machete", nombre: "Machete", paginas: "2 págs" },
  { id: "corto", nombre: "Corto", paginas: "hasta 4 págs" },
  { id: "medio", nombre: "Medio", paginas: "hasta 8 págs" },
  { id: "completo", nombre: "Completo", paginas: "hasta 16 págs" },
];

export const DISENOS: { id: Diseno; nombre: string; disponible: boolean }[] = [
  { id: "rayado", nombre: "Cuaderno rayado", disponible: true },
  { id: "cuadriculado", nombre: "Cuadriculado de exactas", disponible: true },
  { id: "punteado", nombre: "Hoja punteada pastel", disponible: true },
];

export const RESALTADORES: { id: ColorResaltador; nombre: string; hex: string }[] = [
  { id: "amarillo", nombre: "Amarillo", hex: "#fde047" },
  { id: "verde", nombre: "Verde", hex: "#86efac" },
  { id: "rosa", nombre: "Rosa", hex: "#f9a8d4" },
  { id: "celeste", nombre: "Celeste", hex: "#7dd3fc" },
  { id: "naranja", nombre: "Naranja", hex: "#fdba74" },
];

export const BIROMES: { id: ColorBirome; nombre: string; hex: string }[] = [
  { id: "azul", nombre: "Azul", hex: "#1d4ed8" },
  { id: "negra", nombre: "Negra", hex: "#111827" },
  { id: "verde", nombre: "Verde", hex: "#15803d" },
  { id: "violeta", nombre: "Violeta", hex: "#7e22ce" },
];

export const LIMITES = { apuntesMin: 300, apuntesMax: 40_000, instruccionesMax: 1_000, materiaMax: 60 };

export const formatNumero = (n: number) => n.toLocaleString("es-AR");
