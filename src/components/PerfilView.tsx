"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Perfil } from "@/lib/api";
import { HOJAS, LIMITES, TINTAS, type Hoja, type Tinta } from "@/lib/catalog";
import { MOSTRAR_AVISO_EMAIL } from "@/lib/config";
import { cerrarSesion } from "@/lib/sesion";
import { FilaDonar } from "@/components/donacion/Donacion";
import { EliminarCuenta } from "@/components/EliminarCuenta";
import { useToast } from "@/components/Toast";
import { AvisoUso, useUso } from "./UsoProvider";

/** DO-04 · Perfil: datos, "Para tus PDF", "Cuenta", uso del día (LU-01), donación (DO-02), cerrar sesión. */
export function PerfilView() {
  const router = useRouter();
  const toast = useToast();
  const { uso } = useUso();
  const [p, setP] = useState<Perfil | null>(null);

  useEffect(() => {
    api.getPerfil().then(setP);
  }, []);

  async function guardar(c: Partial<Omit<Perfil, "email">>) {
    if (!p) return;
    setP({ ...p, ...c });
    try {
      setP(await api.guardarPerfil(c));
      toast("Guardado.");
    } catch {
      toast("No pudimos guardar. Probá de nuevo.");
    }
  }

  if (!p) return <div className="h-96 max-w-[640px] animate-pulse rounded-xl bg-celeste" aria-busy="true" aria-label="Cargando" />;
  const fila = "flex min-h-14 items-center justify-between gap-4 border-b border-borde py-2";

  return (
    <div className="max-w-[640px] space-y-8">
      <h1 className="text-[28px] leading-[34px] lg:text-[36px] lg:leading-[42px]">Tu perfil</h1>

      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-celeste font-serif text-2xl text-birome">{(p.nombre || p.email || "M").charAt(0).toUpperCase()}</span>
        <div>
          <p className="font-semibold">{p.nombre || "Sin nombre"}</p>
          <p className="text-sm text-gastado">{p.email ?? "Modo demo"}</p>
        </div>
      </div>

      {uso && (
        <section aria-label="Uso de hoy" className="rounded-lg border border-borde px-4 py-3">
          <p className="tnum text-sm">Hoy usaste <strong>{uso.hojasUsadas} de {uso.hojasMax}</strong> hojas{uso.machetesUsados ? ` (${uso.machetesUsados} ${uso.machetesUsados === 1 ? "machete" : "machetes"})` : ""}.</p>
          <AvisoUso uso={uso} className="mt-1" />
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-gastado" style={{ fontFamily: "inherit", color: "var(--azul-gastado)" }}>Para tus PDF</h2>
        <label className={fila}>
          <span>Nombre en las hojas</span>
          <input
            defaultValue={p.nombreEnHojas} maxLength={LIMITES.nombreMax} onBlur={(e) => e.target.value !== p.nombreEnHojas && guardar({ nombreEnHojas: e.target.value.trim() })}
            className="h-10 w-44 rounded-md border border-borde px-2 text-right text-base outline-none focus:border-birome"
          />
        </label>
        <label className={fila}>
          <span>Hoja</span>
          <select value={p.hojaDefault} onChange={(e) => guardar({ hojaDefault: e.target.value as Hoja })} className="h-10 rounded-md border border-borde bg-hoja px-2 text-base">
            {HOJAS.map((h) => <option key={h.id} value={h.id}>{h.nombre}</option>)}
          </select>
        </label>
        <label className={fila}>
          <span>Tinta</span>
          <select value={p.tintaDefault} onChange={(e) => guardar({ tintaDefault: e.target.value as Tinta })} className="h-10 rounded-md border border-borde bg-hoja px-2 text-base">
            {TINTAS.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </label>
      </section>

      {MOSTRAR_AVISO_EMAIL && (
      <section>
        <h2 className="text-sm font-semibold" style={{ fontFamily: "inherit", color: "var(--azul-gastado)" }}>Cuenta</h2>
        {(
          <div className={fila}>
            <span id="avisar-label">Avisarme por mail cuando esté listo</span>
            <button
              type="button" role="switch" aria-checked={p.avisarEmail} aria-labelledby="avisar-label" onClick={() => { guardar({ avisarEmail: !p.avisarEmail }); api.registrarEvento("preferencia_mail_cambiada", { valor: !p.avisarEmail }); }}
              className={`relative h-7 w-12 rounded-full transition ${p.avisarEmail ? "bg-birome" : "bg-borde-fuerte"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${p.avisarEmail ? "left-6" : "left-1"}`} />
            </button>
          </div>
        )}
      </section>
      )}

      <FilaDonar />

      <div className="space-y-3">
        <button onClick={() => cerrarSesion(router)} className="link-garabato block">Cerrar sesión</button>
        <EliminarCuenta />
      </div>
    </div>
  );
}
