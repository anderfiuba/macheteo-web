"use client";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, type MacheteEnCurso, type UsoDiario } from "@/lib/api";
import { horaCorta } from "@/lib/catalog";

interface Ctx { uso: UsoDiario | null; enCurso: MacheteEnCurso | null; refrescar: () => Promise<void> }
const UsoContext = createContext<Ctx | null>(null);

/** LU-01/02 + N-03 · Uso del día y machete en curso. Se refresca al enfocar la ventana y después de armar. */
export function UsoProvider({ children }: { children: React.ReactNode }) {
  const [uso, setUso] = useState<UsoDiario | null>(null);
  const [enCurso, setEnCurso] = useState<MacheteEnCurso | null>(null);
  const refrescar = useCallback(async () => {
    try {
      const u = await api.getUso();
      setUso(u);
      setEnCurso(u.enCurso > 0 ? await api.getEnCurso() : null);
    } catch {
      /* si falla, la UI no muestra avisos; el backend valida igual */
    }
  }, []);
  useEffect(() => {
    refrescar();
    window.addEventListener("focus", refrescar);
    return () => window.removeEventListener("focus", refrescar);
  }, [refrescar]);
  return <UsoContext.Provider value={{ uso, enCurso, refrescar }}>{children}</UsoContext.Provider>;
}

export function useUso() {
  const c = useContext(UsoContext);
  if (!c) throw new Error("useUso fuera de UsoProvider");
  return c;
}

/** machetesMax = 0 → sin tope de cantidad (PM: el límite es de hojas). Si el backend manda un tope, se respeta. */
export const machetesRestantes = (u: UsoDiario) => (u.machetesMax > 0 ? Math.max(0, u.machetesMax - u.machetesUsados) : Number.POSITIVE_INFINITY);
export const hojasRestantes = (u: UsoDiario) => Math.max(0, u.hojasMax - u.hojasUsadas);
export const intentosRestantes = (u: UsoDiario) => Math.max(0, u.erroresMax - u.erroresHoy);
/** Sin cupo si no entra ni el largo más chico (2 hojas). */
export const enLimite = (u: UsoDiario) => machetesRestantes(u) === 0 || hojasRestantes(u) < 2;
export const bloqueado = (u: UsoDiario) =>
  u.limiteGlobal || !!u.bloqueadoHasta || enLimite(u) || u.enCurso >= u.enCursoMax || !u.emailVerificado;

/** "Mañana a las HH:MM" / "Hoy a las HH:MM" */
export function cuandoVuelve(iso: string | null) {
  if (!iso) return "Mañana";
  const d = new Date(iso);
  const esHoy = d.toDateString() === new Date().toDateString();
  return `${esHoy ? "Hoy" : "Mañana"} a las ${horaCorta(iso)}`;
}

/** Aviso de límites de uso (copy de LU-01/LU-02/N-19). Nunca condicionado a donar. */
export function AvisoUso({ uso, enCurso, className = "" }: { uso: UsoDiario | null; enCurso?: MacheteEnCurso | null; className?: string }) {
  if (!uso) return null;
  const base = `rounded-lg px-4 py-3 text-sm ${className}`;
  if (uso.limiteGlobal) return <p role="status" className={`${base} bg-celeste font-semibold`}>Hoy Macheteo llegó a su límite. Volvé mañana.</p>;
  if (uso.bloqueadoHasta) {
    return <p role="status" className={`${base} border border-tachon/40 text-tachon`}>Llegaste al máximo de intentos fallidos de hoy. Mañana podés volver a probar.</p>;
  }
  if (uso.enCurso >= uso.enCursoMax) {
    // PM: 1 machete en curso a la vez (S08 en singular) → mostrarlo con "esperá que termine".
    return (
      <div role="status" className={`${base} flex flex-wrap items-center justify-between gap-2 border border-borde bg-hoja`}>
        <span>
          <strong>Ya tenés un machete armándose{enCurso?.materia ? `: ${enCurso.materia}` : ""}.</strong> Esperá que termine para armar otro.
        </span>
        {enCurso && <Link href={`/resumenes/${enCurso.id}`} className="link-garabato">Ver cómo va{enCurso.progreso ? ` (${enCurso.progreso} %)` : ""}</Link>}
      </div>
    );
  }
  if (enLimite(uso)) {
    return <p role="status" className={`${base} bg-celeste`}><strong>Llegaste al límite de hoy.</strong> {cuandoVuelve(uso.proximoCupoAt)} se renueva y podés armar otro.</p>;
  }
  const h = hojasRestantes(uso);
  return <p className={`tnum text-sm text-gastado ${className}`}>Te quedan <strong className="text-tinta">{h} {h === 1 ? "hoja" : "hojas"}</strong> hoy.</p>;
}
