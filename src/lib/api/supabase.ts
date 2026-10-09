"use client";
import { createClient } from "@/lib/supabase/client";
import { VERSION_TERMINOS } from "@/lib/config";
import { crearViaRoute, pedidoViaRoute, reintentarViaRoute } from "./http";
import type { EstadoResumenDTO, MacheteoApi, Perfil, UsoDiario } from "./types";

/**
 * Implementación real (contrato v2: /workspace/macheteo-backend/docs/contrato-frontend.md).
 * Siempre select explícito: select=* falla por privilegios de columna.
 */
const COLS_PERFIL = "nombre, email, nombre_en_hojas, hoja_default, tinta_default, avisar_email, acepto_terminos_at, version_terminos, email_verificado_at";
// `largo` es columna generada (= extension): no viene por Realtime, por eso siempre se lee por select.
const COLS_RESUMEN = "id, estado, progreso, tipo, largo, extension, diseno, tinta, materia, opciones, hojas_max, paginas, error_codigo, error_origen, intentos_restantes_hoy, en_cola_at, listo_at, error_at, created_at";

type PerfilRow = { nombre: string | null; email: string | null; nombre_en_hojas: string | null; hoja_default: string | null; tinta_default: string | null; avisar_email: boolean | null };
const aPerfil = (r: PerfilRow | null, email: string | null): Perfil => ({
  nombre: r?.nombre ?? "",
  email: r?.email ?? email,
  nombreEnHojas: r?.nombre_en_hojas ?? r?.nombre ?? "",
  hojaDefault: (r?.hoja_default as Perfil["hojaDefault"]) ?? "rayado",
  tintaDefault: (r?.tinta_default as Perfil["tintaDefault"]) ?? "azul",
  avisarEmail: r?.avisar_email ?? true,
});

const plataforma = () => (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? "web-mobile" : "web-desktop");

export const supabaseApi: MacheteoApi = {
  async getUso() {
    const { data, error } = await createClient().rpc("obtener_uso");
    if (error) throw error;
    const d = data as Record<string, unknown>;
    return {
      machetesUsados: Number(d.machetes_hoy ?? 0), machetesMax: Number(d.machetes_limite ?? 0),
      hojasUsadas: Number(d.hojas_hoy ?? 0), hojasMax: Number(d.hojas_limite ?? 0),
      enCurso: Number(d.en_curso ?? 0), enCursoMax: Number(d.en_curso_limite ?? 1),
      proximoCupoAt: (d.proximo_cupo_at as string | null) ?? null,
      limiteGlobal: Boolean(d.limite_global_alcanzado),
      limiteGlobalVueltaAt: (d.limite_global_vuelve_at as string | null) ?? null,
      emailVerificado: Boolean(d.email_verificado),
      erroresHoy: Number(d.errores_usuario_hoy ?? 0), erroresMax: Number(d.errores_usuario_limite ?? 3),
      bloqueadoHasta: (d.bloqueado_hasta as string | null) ?? null,
    } satisfies UsoDiario;
  },
  async getEnCurso() {
    const { data } = await createClient()
      .from("resumenes").select("id, estado, progreso, materia")
      .in("estado", ["en_cola", "generando", "armando"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return data ? { id: data.id, estado: data.estado, progreso: data.progreso ?? 0, materia: data.materia ?? "" } : null;
  },
  async getPerfil() {
    const sb = createClient();
    const { data: u } = await sb.auth.getUser();
    const { data } = await sb.from("perfiles").select(COLS_PERFIL).eq("id", u.user?.id ?? "").maybeSingle();
    return aPerfil(data as PerfilRow | null, u.user?.email ?? null);
  },
  async guardarPerfil(c) {
    const sb = createClient();
    const { data: u } = await sb.auth.getUser();
    const patch: Record<string, unknown> = {};
    if (c.nombre !== undefined) patch.nombre = c.nombre;
    if (c.nombreEnHojas !== undefined) patch.nombre_en_hojas = c.nombreEnHojas;
    if (c.hojaDefault !== undefined) patch.hoja_default = c.hojaDefault;
    if (c.tintaDefault !== undefined) patch.tinta_default = c.tintaDefault;
    if (c.avisarEmail !== undefined) patch.avisar_email = c.avisarEmail;
    const { data, error } = await sb.from("perfiles").update(patch).eq("id", u.user?.id ?? "").select(COLS_PERFIL).single();
    if (error) throw error;
    return aPerfil(data as PerfilRow, u.user?.email ?? null);
  },
  async getMaterias() {
    const { data } = await createClient().rpc("mis_materias");
    return Array.isArray(data) ? (data as string[]) : [];
  },
  crearResumen: crearViaRoute,
  async aceptarTerminos() {
    const { error } = await createClient().rpc("aceptar_terminos", { p_version: VERSION_TERMINOS });
    return !error;
  },
  /** Edge Function eliminar_cuenta (contrato v4.2 delta 11): idempotente, actúa sobre el usuario de la sesión. */
  async eliminarCuenta(confirmacion) {
    const sb = createClient();
    try {
      const { error } = await sb.functions.invoke("eliminar_cuenta", { body: { confirmar: confirmacion.trim() } });
      if (error) {
        const status = (error as { context?: Response }).context?.status;
        return { ok: false, error: status === 400 ? "confirmacion_invalida" : status === 401 ? "no_autenticado" : "error" };
      }
      // 200 { ok, ya_eliminada, pdfs_borrados }: las sesiones ya están revocadas server-side; limpiar la local.
      await sb.auth.signOut({ scope: "local" }).catch(() => {});
      return { ok: true };
    } catch {
      return { ok: false, error: "error" };
    }
  },
  reintentarResumen: reintentarViaRoute,
  getPedido: pedidoViaRoute,
  async getEstadoResumen(id) {
    const { data, error } = await createClient().from("resumenes").select(COLS_RESUMEN).eq("id", id).maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id, estado: data.estado, progreso: data.progreso ?? 0,
      materia: data.materia ?? (data.opciones as { materia?: string })?.materia ?? "",
      tipo: data.tipo, largo: data.largo ?? data.extension, hojaMax: data.hojas_max ?? null, paginas: data.paginas,
      createdAt: data.created_at, errorCodigo: data.error_codigo ?? null, errorOrigen: data.error_origen ?? null,
      intentosRestantesHoy: data.intentos_restantes_hoy ?? null,
    } as EstadoResumenDTO;
  },
  async listarResumenes() {
    const { data, error } = await createClient()
      .from("resumenes").select("id, estado, tipo, largo, extension, materia, paginas, created_at")
      .order("created_at", { ascending: false }).limit(50);
    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id, estado: d.estado, tipo: d.tipo, largo: d.largo ?? d.extension, materia: d.materia ?? "",
      paginas: d.paginas ?? null, createdAt: d.created_at,
    }));
  },
  async getUrlDescarga(id) {
    const { data, error } = await createClient().functions.invoke("url_descarga_resumen", { body: { p_resumen_id: id } });
    if (error || !data?.url) return null;
    return data.url as string;
  },
  async declararDonacion(monto) {
    const { error } = await createClient().rpc("declarar_donacion", { p_monto: monto ?? null });
    if (!error) return { ok: true };
    const m = `${error.message} ${error.details ?? ""}`.toLowerCase();
    return { ok: false, error: /limite|ya_|hoy|1\/d|duplic/.test(m) ? "ya_declarada_hoy" : "desconocido" };
  },
  async registrarEvento(nombre, props = {}) {
    try {
      // Devuelve false si pasó el rate limit (300/día) y `validacion` si no está en la allowlist o props > 2 KB: se ignora en silencio.
      const p_props = { plataforma: plataforma(), ...props };
      if (JSON.stringify(p_props).length > 2000) return;
      await createClient().rpc("registrar_evento", { p_nombre: nombre, p_props });
    } catch {
      /* fire-and-forget */
    }
  },
};
