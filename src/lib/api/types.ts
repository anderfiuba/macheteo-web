import type { Hoja, Largo, Tinta, TipoResumen } from "@/lib/catalog";

// Contrato Frontend ↔ Backend v2: /workspace/macheteo-backend/docs/contrato-frontend.md

/** RPC obtener_uso() · LU-01 / LU-02 / N-03 */
export interface UsoDiario {
  machetesUsados: number;  // machetes_hoy
  machetesMax: number;     // machetes_limite: 0 = sin tope (PA-16)
  hojasUsadas: number;     // hojas_hoy
  hojasMax: number;        // hojas_limite (16 por día calendario ART; cada machete cobra su largo)
  enCurso: number;         // en_curso
  enCursoMax: number;      // en_curso_limite (1)
  proximoCupoAt: string | null;   // solo si llegó al límite diario
  limiteGlobal: boolean;          // limite_global_alcanzado (tope global USD 10/día ART)
  limiteGlobalVueltaAt: string | null; // limite_global_vuelve_at (00:00 ART siguiente)
  emailVerificado: boolean;
  erroresHoy: number;             // errores_usuario_hoy (N-03/N-19)
  erroresMax: number;             // errores_usuario_limite (3, confirmado)
  bloqueadoHasta: string | null;  // 00:00 ART siguiente si llegó a 3 errores propios
}

/** Machete en curso (para "esperá que termine"). */
export interface MacheteEnCurso { id: string; materia: string; estado: EstadoResumen; progreso: number }

export interface Perfil {
  nombre: string;
  email: string | null;
  nombreEnHojas: string;
  hojaDefault: Hoja;
  tintaDefault: Tinta;
  avisarEmail: boolean;
}

export interface OpcionesResumen {
  nombre_en_hojas: string;
  materia: string;
  fecha: string; // ISO yyyy-mm-dd
}

export interface CrearResumenInput {
  apuntes: string;
  instrucciones?: string;
  tipo: TipoResumen;
  largo: Largo;   // p_extension
  hoja: Hoja;     // p_diseno
  tinta: Tinta;   // p_tinta
  opciones: OpcionesResumen;
  idempotencyKey: string;
}

/** Errores exactos de crear_resumen / reintentar_resumen (+ los del route handler). */
export type ErrorCrear =
  | "email_no_verificado" | "terminos_no_aceptados" | "validacion" | "limite_errores" | "limite_activos"
  | "limite_diario" | "limite_global" | "cuenta_inexistente" | "no_autenticado" | "no_configurado" | "desconocido";

export type CrearResumenResult =
  | { ok: true; resumenId: string }
  | { ok: false; error: ErrorCrear; vueltaAt?: string | null; motivo?: "hojas" | "ip" | "ip_desconocida" | null };

export type EstadoResumen = "en_cola" | "generando" | "armando" | "listo" | "error";

export interface EstadoResumenDTO {
  id: string;
  estado: EstadoResumen;
  progreso: number; // 0-100
  materia: string;
  tipo: TipoResumen;
  largo: Largo;
  hojaMax: number | null;
  paginas: number | null;
  createdAt: string;
  errorCodigo: string | null;
  errorOrigen: "usuario" | "plataforma" | null;
  /** Foto al fallar (N-19); en vivo se prefiere obtener_uso. */
  intentosRestantesHoy?: number | null;
}

/** Códigos de plataforma conocidos (mensaje genérico, no cuentan): excede_hojas (N-20), worker_caido, llm_api_error, … */
/** N-19: errores "de contenido" que cuentan como intento fallido (3/día). Los timeouts cuentan (PM 09/10). */
export const ERRORES_CONTENIDO = ["tope_costo", "render_timeout", "timeout_duracion"] as const;
/** error_origen manda (lo decide el backend, que es quien cuenta el intento); la lista de códigos es solo el fallback si viene vacío. */
export const esErrorContenido = (r: Pick<EstadoResumenDTO, "errorCodigo" | "errorOrigen">) =>
  r.errorOrigen
    ? r.errorOrigen === "usuario"
    : !!r.errorCodigo && (ERRORES_CONTENIDO as readonly string[]).includes(r.errorCodigo);

/** Lo que se precarga en "Editar y reintentar" (apuntes guardados server-side hasta 7 días en error, PA-13). */
export interface PedidoGuardado {
  apuntes: string;
  instrucciones: string;
  tipo: TipoResumen;
  largo: Largo;
  hoja: Hoja;
  tinta: Tinta;
  nombre: string;
  materia: string;
  fecha: string;
}

/** Eventos del embudo que manda el cliente (plan-beta §9). Los machete_* de estado y donacion_autodeclarada los registra el backend. */
export type EventoCliente =
  | "machete_iniciado" | "pdf_descargado" | "limite_alcanzado" | "preferencia_mail_cambiada"
  | "donacion_cta_visto" | "donacion_abierta" | "donacion_alias_copiado" | "donacion_cvu_copiado" | "donacion_qr_mostrado";

export type DeclararDonacionResult = { ok: true } | { ok: false; error: "ya_declarada_hoy" | "desconocido" };

/** BI-01 · Item de la biblioteca. */
export interface ResumenItem { id: string; estado: EstadoResumen; materia: string; tipo: TipoResumen; largo: Largo; paginas: number | null; createdAt: string }

export type EliminarCuentaResult = { ok: true } | { ok: false; error: "confirmacion_invalida" | "no_autenticado" | "no_configurado" | "error" };

export interface MacheteoApi {
  getUso(): Promise<UsoDiario>;
  getEnCurso(): Promise<MacheteEnCurso | null>;
  getPerfil(): Promise<Perfil>;
  guardarPerfil(cambios: Partial<Omit<Perfil, "email">>): Promise<Perfil>;
  getMaterias(): Promise<string[]>;
  /** POST /api/machetes (route handler con service role). */
  crearResumen(input: CrearResumenInput): Promise<CrearResumenResult>;
  /** POST /api/machetes con reintentar_de: mismo pedido, nuevo job (errores de plataforma). */
  reintentarResumen(resumenId: string, idempotencyKey: string): Promise<CrearResumenResult>;
  /** GET /api/machetes/[id]/pedido → RPC obtener_pedido_resumen(p_id): apuntes y opciones de un machete propio en error (≤ 7 días). */
  getPedido(resumenId: string): Promise<PedidoGuardado | null>;
  getEstadoResumen(id: string): Promise<EstadoResumenDTO | null>;
  /** BI-01 · Últimos machetes del usuario (select explícito en resumenes). */
  listarResumenes(): Promise<ResumenItem[]>;
  /** Edge Function url_descarga_resumen → URL firmada 5 min. */
  getUrlDescarga(id: string): Promise<string | null>;
  /** RPC declarar_donacion(p_monto?) — máx. 1 por día. */
  declararDonacion(monto?: number): Promise<DeclararDonacionResult>;
  /** CU-06 · POST /api/cuenta/eliminar { confirmacion: "ELIMINAR" }. Borra todo y cierra las sesiones. */
  eliminarCuenta(confirmacion: string): Promise<EliminarCuentaResult>;
  /** RPC registrar_evento(p_nombre, p_props). Nunca tira error. */
  registrarEvento(nombre: EventoCliente, props?: Record<string, unknown>): Promise<void>;
}
