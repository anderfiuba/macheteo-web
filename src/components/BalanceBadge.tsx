"use client";
import Link from "next/link";
import { useBalance } from "./BalanceProvider";

export function BalanceBadge() {
  const { saldo, cargando } = useBalance();
  const vence = saldo?.porVencer
    ? new Date(saldo.porVencer.venceAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })
    : null;
  return (
    <Link
      href="/historial"
      className="flex flex-col items-end rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-right leading-tight hover:bg-amber-100"
      aria-label="Ver historial de créditos"
    >
      <span className="text-sm font-semibold text-amber-900">
        {cargando || !saldo ? "…" : `${saldo.saldo} ${saldo.saldo === 1 ? "crédito" : "créditos"}`}
      </span>
      {vence && saldo?.porVencer && (
        <span className="text-[11px] text-amber-700">{saldo.porVencer.cantidad} vencen el {vence}</span>
      )}
    </Link>
  );
}
