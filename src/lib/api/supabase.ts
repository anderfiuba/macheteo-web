"use client";
import { createClient } from "@/lib/supabase/client";
import type { CostoExtension, CrearResumenResult, EstadoResumenDTO, MacheteoApi, Saldo } from "./types";

/**
 * Implementación real contra Supabase. Los nombres de RPC/vistas son PROPUESTOS y
 * deben confirmarse con Backend (ver docs/endpoints-backend.md).
 */
export const supabaseApi: MacheteoApi = {
  async getSaldo() {
    const { data, error } = await createClient().rpc("obtener_saldo");
    if (error) throw error;
    const d = data as { saldo: number; reservados: number; por_vencer_cantidad: number | null; por_vencer_at: string | null; email_verificado: boolean };
    return {
      saldo: d.saldo,
      reservados: d.reservados ?? 0,
      porVencer: d.por_vencer_cantidad ? { cantidad: d.por_vencer_cantidad, venceAt: d.por_vencer_at! } : null,
      emailVerificado: d.email_verificado,
    } satisfies Saldo;
  },
  async getCostos() {
    const { data, error } = await createClient().from("costos_extension").select("extension,max_creditos,min_creditos");
    if (error) throw error;
    return (data ?? []).map((r) => ({ extension: r.extension, maxCreditos: r.max_creditos, minCreditos: r.min_creditos })) as CostoExtension[];
  },
  async crearResumen(input) {
    const { data, error } = await createClient().rpc("crear_resumen", {
      p_apuntes: input.apuntes,
      p_instrucciones: input.instrucciones ?? null,
      p_tipo: input.tipo,
      p_extension: input.extension,
      p_diseno: input.diseno,
      p_opciones: input.opciones,
      p_idempotency_key: input.idempotencyKey,
    });
    if (error) {
      const map: Record<string, CrearResumenResult & { ok: false }> = {
        saldo_insuficiente: { ok: false, error: "saldo_insuficiente" },
        email_no_verificado: { ok: false, error: "email_no_verificado" },
        limite_activos: { ok: false, error: "limite_activos" },
      };
      return map[error.message] ?? { ok: false, error: "desconocido", mensaje: error.message };
    }
    const d = data as { resumen_id: string; creditos_reservados: number; saldo: number };
    return { ok: true, resumenId: d.resumen_id, creditosReservados: d.creditos_reservados, saldo: d.saldo };
  },
  async getEstadoResumen(id) {
    const { data, error } = await createClient()
      .from("resumenes")
      .select("id,estado,progreso,tipo,extension,opciones,creditos_reservados,creditos_cobrados,paginas,error_codigo")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const cobrados = data.creditos_cobrados as number | null;
    return {
      id: data.id,
      estado: data.estado,
      progreso: data.progreso ?? 0,
      materia: (data.opciones as { materia?: string })?.materia ?? "",
      tipo: data.tipo,
      extension: data.extension,
      creditosReservados: data.creditos_reservados,
      creditosCobrados: cobrados,
      creditosDevueltos: data.estado === "error" ? data.creditos_reservados : cobrados != null ? data.creditos_reservados - cobrados : null,
      paginas: data.paginas,
      errorCodigo: data.error_codigo ?? null,
    } as EstadoResumenDTO;
  },
  async getUrlDescarga(id) {
    const { data, error } = await createClient().rpc("url_descarga_resumen", { p_resumen_id: id });
    if (error) return null;
    return data as string;
  },
  async solicitarArrepentimiento(input) {
    const { data, error } = await createClient().rpc("crear_solicitud_arrepentimiento", {
      p_email: input.email,
      p_referencia_pago: input.referenciaPago,
      p_motivo: input.motivo ?? null,
    });
    if (error) {
      if (error.message === "rate_limit") return { ok: false, error: "rate_limit" };
      if (error.message === "validacion") return { ok: false, error: "validacion" };
      return { ok: false, error: "desconocido" };
    }
    const d = data as { numero: string; created_at: string };
    return { ok: true, numero: d.numero, creadaAt: d.created_at };
  },
};
