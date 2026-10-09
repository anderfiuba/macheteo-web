"use client";
import Link from "next/link";
import { useBalance } from "./BalanceProvider";

/** CR-01 + D4: saldo disponible y, si hay, "N reservados". Vencimiento oculto hasta que exista el dato (C11). */
export function BalanceBadge() {
  const { saldo, cargando } = useBalance();
  const vence = saldo?.porVencer
    ? new Date(saldo.porVencer.venceAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })
    : null;
  return (
    <Link
      href="/creditos/historial"
      className="tnum flex min-h-11 items-center gap-2 rounded-full bg-highlight px-3 py-1 text-ink hover:brightness-95"
      aria-label="Ver historial de créditos"
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-ink" />
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">
          {cargando || !saldo ? "…" : `${saldo.saldo} ${saldo.saldo === 1 ? "crédito" : "créditos"}`}
        </span>
        {saldo && saldo.reservados > 0 && <span className="text-[11px] font-medium">{saldo.reservados} reservados</span>}
        {vence && saldo?.porVencer && <span className="text-[11px] font-medium">{saldo.porVencer.cantidad} vencen el {vence}</span>}
      </span>
    </Link>
  );
}
