"use client";
import { createClient } from "@/lib/supabase/client";
import type { CrearResumenResult, ErrorCrear, EstadoResumenDTO, MacheteoApi, Perfil, UsoDiario } from "./types";

/**
 * Implementación real contra Supabase. Nombres de RPC/columnas PROPUESTOS; confirmar con Backend
 * (ver docs/endpoints-backend.md).
 */
type PerfilRow = { nombre: string | null; nombre_en_hojas: string | null; hoja_default: string | null; tinta_default: string | null; avisar_email: boolean | null };
const aPerfil = (r: PerfilRow | null, email: string | null): Perfil => ({
  nombre: r?.nombre ?? "",
  email,
  nombreEnHojas: r?.nombre_en_hojas ?? r?.nombre ?? "",
  hojaDefault: (r?.hoja_default as Perfil["hojaDefault"]) ?? "rayado",
  tintaDefault: (r?.tinta_default as Perfil["tintaDefault"]) ?? "azul",
  avisarEmail: r?.avisar_email ?? true,
});
const COLS = "nombre,nombre_en_hojas,hoja_default,tinta_default,avisar_email";

export const supabaseApi: MacheteoApi = {
  async getUso() {
    const { data, error } = await createClient().rpc("obtener_uso_diario");
    if (error) throw error;
    const d = data as Record<string, unknown>;
    return {
      machetesUsados: d.machetes_usados, machetesMax: d.machetes_max,
      hojasUsadas: d.hojas_usadas, hojasMax: d.hojas_max,
      enCurso: d.en_curso, enCursoMax: d.en_curso_max,
      proximoCupoAt: d.proximo_cupo_at ?? null, limiteGlobal: Boolean(d.limite_global),
      emailVerificado: Boolean(d.email_verificado),
    } as UsoDiario;
  },
  async getPerfil() {
    const sb = createClient();
    const { data: u } = await sb.auth.getUser();
    const { data } = await sb.from("perfiles").select(COLS).eq("id", u.user?.id ?? "").maybeSingle();
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
    const { data, error } = await sb.from("perfiles").update(patch).eq("id", u.user?.id ?? "").select(COLS).single();
    if (error) throw error;
    return aPerfil(data as PerfilRow, u.user?.email ?? null);
  },
  async crearResumen(input): Promise<CrearResumenResult> {
    const { data, error } = await createClient().rpc("armar_machete", {
      p_apuntes: input.apuntes,
      p_instrucciones: input.instrucciones ?? null,
      p_tipo: input.tipo,
      p_largo: input.largo,
      p_hoja: input.hoja,
      p_opciones: input.opciones,
      p_idempotency_key: input.idempotencyKey,
    });
    if (error) {
      // Backend: raise exception '<codigo>' con detail = proximo_cupo_at (ISO) cuando aplique
      const codigos: ErrorCrear[] = ["limite_diario", "limite_hojas", "en_curso", "limite_global", "limite_fallos", "email_no_verificado", "validacion"];
      const code = codigos.find((c) => error.message === c) ?? "desconocido";
      return { ok: false, error: code, proximoCupoAt: error.details || null, mensaje: error.message };
    }
    return { ok: true, resumenId: (data as { resumen_id: string }).resumen_id };
  },
  async getEstadoResumen(id) {
    const { data, error } = await createClient()
      .from("resumenes")
      .select("id,estado,progreso,tipo,largo,opciones,paginas,created_at,error_codigo,intentos_restantes_hoy")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id, estado: data.estado, progreso: data.progreso ?? 0,
      materia: (data.opciones as { materia?: string })?.materia ?? "",
      tipo: data.tipo, largo: data.largo, paginas: data.paginas,
      createdAt: data.created_at, errorCodigo: data.error_codigo ?? null,
      intentosRestantesHoy: data.intentos_restantes_hoy ?? null,
    } as EstadoResumenDTO;
  },
  async getUrlDescarga(id) {
    const { data, error } = await createClient().rpc("url_descarga_resumen", { p_resumen_id: id });
    return error ? null : (data as string);
  },
};
