"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, type UsoDiario } from "@/lib/api";
import { horaCorta } from "@/lib/catalog";

interface Ctx { uso: UsoDiario | null; refrescar: () => Promise<void> }
const UsoContext = createContext<Ctx | null>(null);

/** LU-01/02 · Uso del día. Se refresca al enfocar la ventana y después de armar. */
export function UsoProvider({ children }: { children: React.ReactNode }) {
  const [uso, setUso] = useState<UsoDiario | null>(null);
  const refrescar = useCallback(async () => {
    try {
      setUso(await api.getUso());
    } catch {
      /* si falla, la UI no muestra avisos; el backend valida igual */
    }
  }, []);
  useEffect(() => {
    refrescar();
    window.addEventListener("focus", refrescar);
    return () => window.removeEventListener("focus", refrescar);
  }, [refrescar]);
  return <UsoContext.Provider value={{ uso, refrescar }}>{children}</UsoContext.Provider>;
}

export function useUso() {
  const c = useContext(UsoContext);
  if (!c) throw new Error("useUso fuera de UsoProvider");
  return c;
}

export const machetesRestantes = (u: UsoDiario) => Math.max(0, u.machetesMax - u.machetesUsados);
export const hojasRestantes = (u: UsoDiario) => Math.max(0, u.hojasMax - u.hojasUsadas);
export const enLimite = (u: UsoDiario) => machetesRestantes(u) === 0 || hojasRestantes(u) === 0;

/** "Mañana a las HH:MM" / "Hoy a las HH:MM" */
export function cuandoVuelve(iso: string | null) {
  if (!iso) return "Mañana";
  const d = new Date(iso);
  const esHoy = d.toDateString() === new Date().toDateString();
  return `${esHoy ? "Hoy" : "Mañana"} a las ${horaCorta(iso)}`;
}

/** Aviso de límites de uso (copy de LU-01/LU-02). Nunca condicionado a donar. */
export function AvisoUso({ uso, className = "" }: { uso: UsoDiario | null; className?: string }) {
  if (!uso) return null;
  const base = `rounded-lg px-4 py-3 text-sm ${className}`;
  if (uso.limiteGlobal) {
    return <p role="status" className={`${base} bg-celeste font-semibold`}>Hoy Macheteo llegó a su límite. Volvé mañana.</p>;
  }
  if (enLimite(uso)) {
    return (
      <p role="status" className={`${base} bg-celeste`}>
        <strong>Llegaste al límite de hoy.</strong> {cuandoVuelve(uso.proximoCupoAt)} podés armar otro.
      </p>
    );
  }
  if (uso.enCurso >= uso.enCursoMax) {
    return (
      <p role="status" className={`${base} border border-tachon/40 bg-hoja`}>
        <strong className="text-tachon">Ya tenés {uso.enCursoMax} {uso.enCursoMax > 1 ? "machetes armándose" : "machete armándose"}.</strong> Esperá a que termine.
      </p>
    );
  }
  const m = machetesRestantes(uso);
  return (
    <p className={`tnum text-sm text-gastado ${className}`}>
      Hoy te quedan {m} {m === 1 ? "machete" : "machetes"} ({hojasRestantes(uso)} hojas).
    </p>
  );
}
