"use client";
import { hojasDe } from "@/lib/catalog";
import type { CrearResumenInput, CrearResumenResult, EstadoResumenDTO, MacheteoApi, PedidoGuardado, Perfil, UsoDiario } from "./types";

// Implementación simulada en localStorage, con la misma semántica que el contrato v2.
// Probar LU-02: incluí "#global" en los apuntes (simula el tope global USD 10/día).
// Probar N-19: incluí "#tope" (tope_costo), "#timeout" (render_timeout) o "#falla" (error de plataforma) en los apuntes.
const KEY = "macheteo:mock:v3";
// PM 2026-10-09: 16 hojas por día (cada machete descuenta su largo 2/4/8/16), 1 en curso, 3 errores propios/día. Sin tope de cantidad de machetes.
const LIM = { machetes: Number.POSITIVE_INFINITY, hojas: 16, enCurso: 1, errores: 3 };
const DURACION_MS = 20_000;
const DIA = 24 * 3600_000;

interface MockResumen { id: string; input: CrearResumenInput; createdAt: number }
interface MockState { resumenes: Record<string, MockResumen>; idem: Record<string, string>; perfil: Perfil; donacionDia: string | null; eventos: { n: string; p: unknown; t: number }[] }

const perfilInicial: Perfil = { nombre: "Martina", email: "martina@correo.com", nombreEnHojas: "Martina", hojaDefault: "rayado", tintaDefault: "azul", avisarEmail: true };

function load(): MockState {
  const vacio: MockState = { resumenes: {}, idem: {}, perfil: perfilInicial, donacionDia: null, eventos: [] };
  if (typeof window === "undefined") return vacio;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...vacio, ...(JSON.parse(raw) as MockState) };
  } catch {}
  return vacio;
}
const save = (s: MockState) => typeof window !== "undefined" && localStorage.setItem(KEY, JSON.stringify(s));
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const hoyART = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

function codigoError(r: MockResumen): { codigo: string; origen: "usuario" | "plataforma" } | null {
  const a = r.input.apuntes;
  if (a.includes("#tope")) return { codigo: "tope_costo", origen: "usuario" };
  if (a.includes("#timeout")) return { codigo: "render_timeout", origen: "usuario" };
  if (a.includes("#falla")) return { codigo: "worker_caido", origen: "plataforma" };
  if (a.includes("#excede")) return { codigo: "excede_hojas", origen: "plataforma" }; // N-20
  return null;
}

function estadoDe(r: MockResumen): EstadoResumenDTO {
  const progreso = Math.min(100, Math.round(((Date.now() - r.createdAt) / DURACION_MS) * 100));
  const err = codigoError(r);
  let estado: EstadoResumenDTO["estado"] = progreso >= 100 ? "listo" : progreso >= 70 ? "armando" : progreso >= 15 ? "generando" : "en_cola";
  if (err && progreso >= 60) estado = "error";
  return {
    id: r.id, estado, progreso,
    materia: r.input.opciones.materia, tipo: r.input.tipo, largo: r.input.largo, hojaMax: hojasDe(r.input.largo),
    paginas: estado === "listo" ? Math.max(1, hojasDe(r.input.largo) - 1) : null,
    createdAt: new Date(r.createdAt).toISOString(),
    errorCodigo: estado === "error" ? err!.codigo : null,
    errorOrigen: estado === "error" ? err!.origen : null,
  };
}

function calcularUso(s: MockState): UsoDiario {
  const todos = Object.values(s.resumenes).map((r) => ({ r, e: estadoDe(r) }));
  const recientes = todos.filter((x) => Date.now() - x.r.createdAt < DIA && x.e.estado !== "error");
  const hojas = recientes.reduce((a, { r, e }) => a + (e.paginas ?? hojasDe(r.input.largo)), 0);
  const enCurso = recientes.filter((x) => x.e.estado !== "listo").length;
  const masViejo = recientes.map((x) => x.r.createdAt).sort((a, b) => a - b)[0];
  const lleno = recientes.length >= LIM.machetes || LIM.hojas - hojas < 2;
  const errores = todos.filter((x) => x.e.errorOrigen === "usuario" && new Date(x.r.createdAt).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }) === hoyART()).length;
  const manana = new Date(`${hoyART()}T00:00:00-03:00`).getTime() + DIA;
  return {
    machetesUsados: recientes.length, machetesMax: Number.isFinite(LIM.machetes) ? LIM.machetes : 0, hojasUsadas: hojas, hojasMax: LIM.hojas,
    enCurso, enCursoMax: LIM.enCurso,
    proximoCupoAt: lleno && masViejo ? new Date(masViejo + DIA).toISOString() : null,
    limiteGlobal: false, limiteGlobalVueltaAt: null, emailVerificado: true,
    erroresHoy: errores, erroresMax: LIM.errores, bloqueadoHasta: errores >= LIM.errores ? new Date(manana).toISOString() : null,
  };
}

const largoEfectivo = (i: CrearResumenInput) => (i.tipo === "machete" ? "machete" : i.largo);

function armar(s: MockState, input: CrearResumenInput): CrearResumenResult {
  if (s.idem[input.idempotencyKey]) return { ok: true, resumenId: s.idem[input.idempotencyKey] };
  const m = input.opciones.materia.trim();
  if (input.apuntes.length < 300 || input.apuntes.length > 40000 || !m || m.length > 60) return { ok: false, error: "validacion" };
  const uso = calcularUso(s);
  if (uso.limiteGlobal || input.apuntes.includes("#global")) {
    const manana = new Date(new Date(`${hoyART()}T00:00:00-03:00`).getTime() + DIA).toISOString();
    return { ok: false, error: "limite_global", vueltaAt: manana };
  }
  if (uso.bloqueadoHasta) return { ok: false, error: "limite_errores", vueltaAt: uso.bloqueadoHasta };
  if (uso.enCurso >= uso.enCursoMax) return { ok: false, error: "limite_activos" };
  if ((uso.machetesMax > 0 && uso.machetesUsados >= uso.machetesMax) || uso.hojasUsadas + hojasDe(largoEfectivo(input)) > uso.hojasMax)
    return { ok: false, error: "limite_diario", vueltaAt: uso.proximoCupoAt, motivo: "hojas" };
  const id = crypto.randomUUID();
  const largo = input.tipo === "machete" ? "machete" : input.largo;
  s.resumenes[id] = { id, input: { ...input, largo }, createdAt: Date.now() };
  s.idem[input.idempotencyKey] = id;
  save(s);
  return { ok: true, resumenId: id };
}

export const mockApi: MacheteoApi = {
  async getUso() { await delay(120); return calcularUso(load()); },
  async getEnCurso() {
    await delay(80);
    const x = Object.values(load().resumenes).map(estadoDe).find((e) => ["en_cola", "generando", "armando"].includes(e.estado));
    return x ? { id: x.id, estado: x.estado, progreso: x.progreso, materia: x.materia } : null;
  },
  async getPerfil() { await delay(100); return load().perfil; },
  async guardarPerfil(c) { await delay(150); const s = load(); s.perfil = { ...s.perfil, ...c }; save(s); return s.perfil; },
  async getMaterias() {
    await delay(50);
    return [...new Set(Object.values(load().resumenes).sort((a, b) => b.createdAt - a.createdAt).map((r) => r.input.opciones.materia))];
  },
  async crearResumen(input) { await delay(500); return armar(load(), input); },
  async reintentarResumen(id, key) {
    await delay(400);
    const s = load();
    const r = s.resumenes[id];
    if (!r || estadoDe(r).estado !== "error") return { ok: false, error: "validacion" };
    // Mismo pedido; en mock sacamos el marcador de falla para que el reintento salga bien.
    return armar(s, { ...r.input, apuntes: r.input.apuntes.replace(/#(tope|timeout|falla)/g, ""), idempotencyKey: key });
  },
  async getPedido(id): Promise<PedidoGuardado | null> {
    await delay(150);
    const r = load().resumenes[id];
    if (!r || estadoDe(r).estado !== "error" || Date.now() - r.createdAt > 7 * DIA) return null;
    const i = r.input;
    return { apuntes: i.apuntes, instrucciones: i.instrucciones ?? "", tipo: i.tipo, largo: i.largo, hoja: i.hoja, tinta: i.tinta, nombre: i.opciones.nombre_en_hojas, materia: i.opciones.materia, fecha: i.opciones.fecha };
  },
  async getEstadoResumen(id) { await delay(100); const r = load().resumenes[id]; return r ? estadoDe(r) : null; },
  async listarResumenes() {
    await delay(120);
    return Object.values(load().resumenes).sort((a, b) => b.createdAt - a.createdAt).map((r) => {
      const e = estadoDe(r);
      return { id: e.id, estado: e.estado, materia: e.materia, tipo: e.tipo, largo: e.largo, paginas: e.paginas, createdAt: e.createdAt };
    });
  },
  async getUrlDescarga() { await delay(200); return null; },
  async aceptarTerminos() { await delay(300); return true; },
  async eliminarCuenta(confirmacion) {
    await delay(600);
    if (confirmacion.trim() !== "ELIMINAR") return { ok: false, error: "confirmacion_invalida" };
    Object.keys(localStorage).filter((k) => k.startsWith("macheteo")).forEach((k) => localStorage.removeItem(k));
    return { ok: true };
  },
  async declararDonacion() {
    await delay(300);
    const s = load();
    if (s.donacionDia === hoyART()) return { ok: false, error: "ya_declarada_hoy" };
    s.donacionDia = hoyART();
    save(s);
    return { ok: true };
  },
  async registrarEvento(nombre, props) {
    const s = load();
    s.eventos = [...s.eventos.slice(-199), { n: nombre, p: props ?? {}, t: Date.now() }];
    save(s);
    if (process.env.NODE_ENV !== "production") console.debug("[evento]", nombre, props ?? {});
  },
};
