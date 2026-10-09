"use client";
import type { CostoExtension, CrearResumenInput, CrearResumenResult, EstadoResumenDTO, MacheteoApi, Saldo } from "./types";

// Implementación simulada en localStorage. Reemplazar por ./supabase.ts cuando Backend publique las RPC.
const KEY = "macheteo:mock";
interface MockResumen { input: CrearResumenInput; reservados: number; createdAt: number; id: string }
interface MockState { saldo: number; resumenes: Record<string, MockResumen>; idem: Record<string, string> }

const COSTOS: CostoExtension[] = [
  { extension: "machete", maxCreditos: 2, minCreditos: 1 },
  { extension: "corto", maxCreditos: 4, minCreditos: 2 },
  { extension: "medio", maxCreditos: 8, minCreditos: 4 },
  { extension: "completo", maxCreditos: 16, minCreditos: 8 },
];

function load(): MockState {
  if (typeof window === "undefined") return { saldo: 10, resumenes: {}, idem: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as MockState;
  } catch {}
  return { saldo: 10, resumenes: {}, idem: {} };
}
function save(s: MockState) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
}
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const DURACION_MS = 15_000;

function estadoDe(r: MockResumen, s: MockState): EstadoResumenDTO {
  const t = (Date.now() - r.createdAt) / DURACION_MS;
  const progreso = Math.min(100, Math.round(t * 100));
  const estado = progreso >= 100 ? "listo" : progreso >= 75 ? "armando" : progreso >= 10 ? "generando" : "en_cola";
  const costo = COSTOS.find((c) => c.extension === r.input.extension)!;
  const paginas = Math.max(1, costo.maxCreditos - 1);
  const cobrados = Math.min(costo.maxCreditos, Math.max(costo.minCreditos, paginas));
  if (estado === "listo" && !(r as MockResumen & { liquidado?: boolean }).liquidado) {
    s.saldo += r.reservados - cobrados;
    (r as MockResumen & { liquidado?: boolean }).liquidado = true;
    save(s);
  }
  return {
    id: r.id,
    estado,
    progreso,
    materia: r.input.opciones.materia,
    tipo: r.input.tipo,
    extension: r.input.extension,
    creditosReservados: r.reservados,
    creditosCobrados: estado === "listo" ? cobrados : null,
    creditosDevueltos: estado === "listo" ? r.reservados - cobrados : null,
    paginas: estado === "listo" ? paginas : null,
    posicionCola: estado === "en_cola" ? 3 : null,
    errorCodigo: null,
  };
}

export const mockApi: MacheteoApi = {
  async getSaldo(): Promise<Saldo> {
    await delay(150);
    const s = load();
    Object.values(s.resumenes).forEach((r) => estadoDe(r, s));
    const st = load();
    const reservados = Object.values(st.resumenes)
      .filter((r) => !(r as MockResumen & { liquidado?: boolean }).liquidado)
      .reduce((a, r) => a + r.reservados, 0);
    // C11: vencimiento oculto hasta que exista el dato (CR-07) → null en mock
    return { saldo: st.saldo, reservados, porVencer: null, emailVerificado: true };
  },
  async getCostos() {
    await delay(100);
    return COSTOS;
  },
  async crearResumen(input): Promise<CrearResumenResult> {
    await delay(500);
    const s = load();
    if (s.idem[input.idempotencyKey]) {
      const id = s.idem[input.idempotencyKey];
      return { ok: true, resumenId: id, creditosReservados: s.resumenes[id].reservados, saldo: s.saldo };
    }
    const costo = COSTOS.find((c) => c.extension === input.extension)!;
    if (s.saldo < costo.maxCreditos) return { ok: false, error: "saldo_insuficiente" };
    const id = crypto.randomUUID();
    s.saldo -= costo.maxCreditos;
    s.resumenes[id] = { id, input, reservados: costo.maxCreditos, createdAt: Date.now() };
    s.idem[input.idempotencyKey] = id;
    save(s);
    return { ok: true, resumenId: id, creditosReservados: costo.maxCreditos, saldo: s.saldo };
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
  async solicitarArrepentimiento(input) {
    await delay(500);
    if (!input.email.includes("@") || input.referenciaPago.trim().length < 3) return { ok: false, error: "validacion" };
    const n = Math.floor(Math.random() * 900000 + 100000);
    return { ok: true, numero: `ARR-${new Date().getFullYear()}-${n}`, creadaAt: new Date().toISOString() };
  },
};
