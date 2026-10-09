"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, type Saldo } from "@/lib/api";

interface Ctx { saldo: Saldo | null; cargando: boolean; refrescar: () => Promise<void>; setSaldoLocal: (n: number) => void }
const BalanceContext = createContext<Ctx | null>(null);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [cargando, setCargando] = useState(true);

  const refrescar = useCallback(async () => {
    try {
      setSaldo(await api.getSaldo());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    refrescar();
    const onFocus = () => refrescar();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refrescar]);

  const setSaldoLocal = (n: number) => setSaldo((s) => (s ? { ...s, saldo: n } : s));
  return <BalanceContext.Provider value={{ saldo, cargando, refrescar, setSaldoLocal }}>{children}</BalanceContext.Provider>;
}

export function useBalance() {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalance fuera de BalanceProvider");
  return ctx;
}
