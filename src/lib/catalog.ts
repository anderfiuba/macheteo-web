// Catálogo del wizard. Los costos vienen del backend (getCosts); estos son los defaults del backlog.
export type TipoResumen = "ejercicios" | "teoria" | "machete" | "autoevaluacion";
export type Extension = "machete" | "corto" | "medio" | "completo";
export type Diseno = "rayado" | "cuadriculado" | "punteado";
export type ColorResaltador = "amarillo" | "verde" | "rosa" | "celeste" | "naranja";
export type ColorBirome = "azul" | "negra" | "verde" | "violeta";

export const TIPOS: { id: TipoResumen; nombre: string; descripcion: string }[] = [
  { id: "ejercicios", nombre: "Entender ejercicios", descripcion: "Paso a paso de los ejercicios tipo, con el porqué de cada paso." },
  { id: "teoria", nombre: "Teoría para parcial", descripcion: "Definiciones, teoremas y conceptos clave, ordenados para estudiar." },
  { id: "machete", nombre: "Machete de 1 hoja", descripcion: "Lo esencial en 1 hoja A4, anverso y reverso (2 págs)." },
  { id: "autoevaluacion", nombre: "Autoevaluación", descripcion: "Preguntas y respuestas para ponerte a prueba." },
];

export const EXTENSIONES: { id: Extension; nombre: string; paginas: string }[] = [
  { id: "machete", nombre: "Machete", paginas: "hasta 2 págs" },
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
  { id: "amarillo", nombre: "Amarillo", hex: "#FFE45C" },
  { id: "verde", nombre: "Verde", hex: "#9BE58F" },
  { id: "rosa", nombre: "Rosa", hex: "#FF9FC7" },
  { id: "celeste", nombre: "Celeste", hex: "#8FD3F5" },
  { id: "naranja", nombre: "Naranja", hex: "#FFB766" },
];

export const BIROMES: { id: ColorBirome; nombre: string; hex: string }[] = [
  { id: "azul", nombre: "Azul", hex: "#1F3FA8" },
  { id: "negra", nombre: "Negra", hex: "#1A1A1A" },
  { id: "verde", nombre: "Verde", hex: "#1E6B3A" },
  { id: "violeta", nombre: "Violeta", hex: "#5B2A9C" },
];

export const LIMITES = { apuntesMin: 300, apuntesMax: 40_000, instruccionesMax: 1_000, materiaMax: 60 };

export const formatNumero = (n: number) => n.toLocaleString("es-AR");

/** PA-08 aprobado: "Machete de 1 hoja" = 1 hoja A4 anverso y reverso = 2 págs; fuerza la extensión Machete. */
export const MACHETE_1_HOJA = { paginas: 2, extension: "machete" as Extension };
