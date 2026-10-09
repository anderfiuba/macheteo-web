import type { Hoja, Largo, Tinta, TipoResumen } from "@/lib/catalog";

/** LU-01 / LU-02 · Uso del día (ventana móvil de 24 h). */
export interface UsoDiario {
  machetesUsados: number;
  machetesMax: number;   // default propuesto 3
  hojasUsadas: number;   // por el máximo del largo; se ajusta a las reales al quedar listo
  hojasMax: number;      // default propuesto 24
  enCurso: number;
  enCursoMax: number;    // default propuesto 1
  /** Cuándo se libera el próximo cupo (si está en el límite) */
  proximoCupoAt: string | null;
  /** LU-02: tope global de gasto alcanzado */
  limiteGlobal: boolean;
  emailVerificado: boolean;
}

export interface Perfil {
  nombre: string;
  email: string | null;
  nombreEnHojas: string;
  hojaDefault: Hoja;
  tintaDefault: Tinta;
  avisarEmail: boolean;
}

export interface OpcionesResumen {
  nombre: string;
  materia: string;
  fecha: string; // ISO yyyy-mm-dd
  tinta: Tinta;
}

export interface CrearResumenInput {
  apuntes: string;
  instrucciones?: string;
  tipo: TipoResumen;
  largo: Largo;
  hoja: Hoja;
  opciones: OpcionesResumen;
  idempotencyKey: string;
}

export type ErrorCrear = "limite_diario" | "limite_hojas" | "en_curso" | "limite_global" | "limite_fallos" | "email_no_verificado" | "validacion" | "desconocido";
export type CrearResumenResult =
  | { ok: true; resumenId: string }
  | { ok: false; error: ErrorCrear; proximoCupoAt?: string | null; mensaje?: string };

export type EstadoResumen = "en_cola" | "generando" | "armando" | "listo" | "error";

export interface EstadoResumenDTO {
  id: string;
  estado: EstadoResumen;
  progreso: number; // 0-100
  materia: string;
  tipo: TipoResumen;
  largo: Largo;
  paginas: number | null;
  createdAt: string;
  /**
   * Código corto del error (sin stack). Errores "de contenido" (N-19): `tope_costo` (pasó el tope de USD por resumen)
   * y `render_timeout` (el armado del PDF no terminó). Cualquier otro código = error de plataforma (no cuenta).
   */
  errorCodigo?: string | null;
  /** N-19: intentos fallidos por contenido que le quedan hoy al usuario (solo relevante en errores de contenido). */
  intentosRestantesHoy?: number | null;
}

export const ERRORES_CONTENIDO = ["tope_costo", "render_timeout"] as const;
export const esErrorContenido = (c?: string | null) => !!c && (ERRORES_CONTENIDO as readonly string[]).includes(c);

export interface MacheteoApi {
  getUso(): Promise<UsoDiario>;
  getPerfil(): Promise<Perfil>;
  guardarPerfil(cambios: Partial<Omit<Perfil, "email">>): Promise<Perfil>;
  crearResumen(input: CrearResumenInput): Promise<CrearResumenResult>;
  getEstadoResumen(id: string): Promise<EstadoResumenDTO | null>;
  /** URL firmada (5 min) — BI-02 */
  getUrlDescarga(id: string): Promise<string | null>;
}
