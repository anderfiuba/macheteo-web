import type { ColorBirome, ColorResaltador, Diseno, Extension, TipoResumen } from "@/lib/catalog";

/** GET saldo — CR-01 */
export interface Saldo {
  saldo: number;
  /** Créditos que vencen en ≤30 días (null si no hay) */
  porVencer: { cantidad: number; venceAt: string } | null;
  emailVerificado: boolean;
}

/** GET costos — NR-04 */
export interface CostoExtension {
  extension: Extension;
  maxCreditos: number;
  minCreditos: number;
}

export interface OpcionesResumen {
  nombre: string;
  materia: string;
  fecha: string; // ISO yyyy-mm-dd
  resaltador: ColorResaltador;
  birome: ColorBirome;
}

/** POST crear resumen — NR-07 */
export interface CrearResumenInput {
  apuntes: string;
  instrucciones?: string;
  tipo: TipoResumen;
  extension: Extension;
  diseno: Diseno;
  opciones: OpcionesResumen;
  idempotencyKey: string;
}

export type CrearResumenResult =
  | { ok: true; resumenId: string; creditosReservados: number; saldo: number }
  | { ok: false; error: "saldo_insuficiente" | "email_no_verificado" | "validacion" | "limite_activos" | "desconocido"; mensaje?: string };

export type EstadoResumen = "en_cola" | "generando" | "armando" | "listo" | "error";

/** GET estado — GE-03 */
export interface EstadoResumenDTO {
  id: string;
  estado: EstadoResumen;
  progreso: number; // 0-100
  materia: string;
  tipo: TipoResumen;
  extension: Extension;
  creditosReservados: number;
  creditosCobrados: number | null;
  creditosDevueltos: number | null;
  paginas: number | null;
}

export interface MacheteoApi {
  getSaldo(): Promise<Saldo>;
  getCostos(): Promise<CostoExtension[]>;
  crearResumen(input: CrearResumenInput): Promise<CrearResumenResult>;
  getEstadoResumen(id: string): Promise<EstadoResumenDTO | null>;
  /** URL firmada (5 min) — BI-02 */
  getUrlDescarga(id: string): Promise<string | null>;
}
