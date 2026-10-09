"use client";
import { hojasDe } from "@/lib/catalog";
import type { CrearResumenInput, EstadoResumenDTO, MacheteoApi, Perfil, UsoDiario } from "./types";

// Implementación simulada en localStorage. Reemplazar por ./supabase.ts cuando Backend publique las RPC.
const KEY = "macheteo:mock:v2";
const LIM = { machetes: 3, hojas: 24, enCurso: 1, fallosContenido: 3 }; // LU-01 / N-19 defaults propuestos [CONFIRMAR]
// Para probar N-19 en mock: incluí "#tope" (tope_costo), "#timeout" (render_timeout) o "#falla" (error de plataforma) en los apuntes.
const DURACION_MS = 20_000;
const DIA = 24 * 3600_000;

interface MockResumen { id: string; input: CrearResumenInput; createdAt: number }
interface MockState { resumenes: Record<string, MockResumen>; idem: Record<string, string>; perfil: Perfil }

const perfilInicial: Perfil = { nombre: "Martina", email: "martina@correo.com", nombreEnHojas: "Martina", hojaDefault: "rayado", tintaDefault: "azul", avisarEmail: true };

function load(): MockState {
  const vacio: MockState = { resumenes: {}, idem: {}, perfil: perfilInicial };
  if (typeof window === "undefined") return vacio;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...vacio, ...(JSON.parse(raw) as MockState) };
  } catch {}
  return vacio;
}
const save = (s: MockState) => typeof window !== "undefined" && localStorage.setItem(KEY, JSON.stringify(s));
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function codigoError(r: MockResumen): string | null {
  const a = r.input.apuntes;
  return a.includes("#tope") ? "tope_costo" : a.includes("#timeout") ? "render_timeout" : a.includes("#falla") ? "plataforma_worker" : null;
}

function fallosContenidoHoy(s: MockState): number {
  return Object.values(s.resumenes).filter((r) => Date.now() - r.createdAt < DIA && ["tope_costo", "render_timeout"].includes(codigoError(r) ?? "")).filter((r) => Date.now() - r.createdAt >= DURACION_MS * 0.6).length;
}

function estadoDe(r: MockResumen, s?: MockState): EstadoResumenDTO {
  const progreso = Math.min(100, Math.round(((Date.now() - r.createdAt) / DURACION_MS) * 100));
  const err = codigoError(r);
  let estado: EstadoResumenDTO["estado"] = progreso >= 100 ? "listo" : progreso >= 70 ? "armando" : progreso >= 15 ? "generando" : "en_cola";
  if (err && progreso >= 60) estado = "error";
  return {
    id: r.id, estado, progreso,
    materia: r.input.opciones.materia, tipo: r.input.tipo, largo: r.input.largo,
    paginas: estado === "listo" ? Math.max(1, hojasDe(r.input.largo) - 1) : null,
    createdAt: new Date(r.createdAt).toISOString(),
    errorCodigo: estado === "error" ? err : null,
    intentosRestantesHoy: estado === "error" && s ? Math.max(0, LIM.fallosContenido - fallosContenidoHoy(s)) : null,
  };
}

function calcularUso(s: MockState): UsoDiario {
  const recientes = Object.values(s.resumenes).filter((r) => Date.now() - r.createdAt < DIA);
  const estados = recientes.map((r) => ({ r, e: estadoDe(r) })).filter((x) => x.e.estado !== "error");
  const hojas = estados.reduce((a, { r, e }) => a + (e.paginas ?? hojasDe(r.input.largo)), 0);
  const enCurso = estados.filter((x) => x.e.estado !== "listo").length;
  const masViejo = recientes.map((r) => r.createdAt).sort((a, b) => a - b)[0];
  const lleno = estados.length >= LIM.machetes || hojas >= LIM.hojas;
  return {
    machetesUsados: estados.length, machetesMax: LIM.machetes,
    hojasUsadas: hojas, hojasMax: LIM.hojas,
    enCurso, enCursoMax: LIM.enCurso,
    proximoCupoAt: lleno && masViejo ? new Date(masViejo + DIA).toISOString() : null,
    limiteGlobal: false, emailVerificado: true,
  };
}

export const mockApi: MacheteoApi = {
  async getUso() {
    await delay(120);
    return calcularUso(load());
  },
  async getPerfil() {
    await delay(100);
    return load().perfil;
  },
  async guardarPerfil(cambios) {
    await delay(150);
    const s = load();
    s.perfil = { ...s.perfil, ...cambios };
    save(s);
    return s.perfil;
  },
  async crearResumen(input) {
    await delay(500);
    const s = load();
    if (s.idem[input.idempotencyKey]) return { ok: true, resumenId: s.idem[input.idempotencyKey] };
    const uso = calcularUso(s);
    if (uso.limiteGlobal) return { ok: false, error: "limite_global" };
    if (uso.enCurso >= uso.enCursoMax) return { ok: false, error: "en_curso" };
    if (uso.machetesUsados >= uso.machetesMax) return { ok: false, error: "limite_diario", proximoCupoAt: uso.proximoCupoAt };
    if (uso.hojasUsadas + hojasDe(input.largo) > uso.hojasMax) return { ok: false, error: "limite_hojas", proximoCupoAt: uso.proximoCupoAt };
    if (fallosContenidoHoy(s) >= LIM.fallosContenido) return { ok: false, error: "limite_fallos", proximoCupoAt: null };
    const id = crypto.randomUUID();
    s.resumenes[id] = { id, input, createdAt: Date.now() };
    s.idem[input.idempotencyKey] = id;
    save(s);
    return { ok: true, resumenId: id };
  },
  async getEstadoResumen(id) {
    await delay(100);
    const s = load();
    const r = s.resumenes[id];
    return r ? estadoDe(r, s) : null;
  },
  async getUrlDescarga() {
    await delay(200);
    return null; // sin PDF real en modo mock
  },
};
