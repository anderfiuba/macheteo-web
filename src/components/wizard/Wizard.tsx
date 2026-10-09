"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, type CostoExtension } from "@/lib/api";
import { useBalance } from "@/components/BalanceProvider";
import { BORRADOR_KEY, limpiarBorrador } from "@/lib/borrador";
import {
  BIROMES, DISENOS, EXTENSIONES, LIMITES, RESALTADORES, TIPOS, formatNumero,
  type ColorBirome, type ColorResaltador, type Diseno, type Extension, type TipoResumen,
} from "@/lib/catalog";
import { DesignPreview } from "./DesignPreview";

const PASOS = ["Apuntes", "Tipo", "Extensión", "Diseño", "Confirmar"] as const;

interface Borrador {
  paso: number;
  apuntes: string;
  instrucciones: string;
  tipo: TipoResumen | null;
  extension: Extension | null;
  diseno: Diseno;
  nombre: string;
  materia: string;
  fecha: string;
  resaltador: ColorResaltador;
  birome: ColorBirome;
  idempotencyKey: string;
}

const hoy = () => new Date().toISOString().slice(0, 10);
const nuevoBorrador = (): Borrador => ({
  paso: 0, apuntes: "", instrucciones: "", tipo: null, extension: null, diseno: "rayado",
  nombre: "", materia: "", fecha: hoy(), resaltador: "amarillo", birome: "azul",
  idempotencyKey: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
});

export function Wizard() {
  const router = useRouter();
  const { saldo, setSaldoLocal, refrescar } = useBalance();
  const [b, setB] = useState<Borrador | null>(null);
  const [costos, setCostos] = useState<CostoExtension[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let inicial = nuevoBorrador();
    try {
      const raw = localStorage.getItem(BORRADOR_KEY);
      if (raw) inicial = { ...inicial, ...(JSON.parse(raw) as Partial<Borrador>) };
    } catch {}
    setB(inicial);
    api.getCostos().then(setCostos);
  }, []);

  useEffect(() => {
    if (b) localStorage.setItem(BORRADOR_KEY, JSON.stringify(b));
  }, [b]);

  const set = <K extends keyof Borrador>(k: K, v: Borrador[K]) => setB((prev) => (prev ? { ...prev, [k]: v } : prev));
  const costoDe = (e: Extension | null) => costos.find((c) => c.extension === e);
  const saldoActual = saldo?.saldo ?? 0;

  const validoPaso = useMemo(() => {
    if (!b) return [false, false, false, false, false];
    const len = b.apuntes.length;
    const c = costoDe(b.extension);
    return [
      len >= LIMITES.apuntesMin && len <= LIMITES.apuntesMax && b.instrucciones.length <= LIMITES.instruccionesMax,
      b.tipo !== null,
      b.extension !== null && !!c && c.maxCreditos <= saldoActual,
      b.materia.trim().length > 0 && b.materia.length <= LIMITES.materiaMax && b.nombre.length <= 60,
      true,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b, costos, saldoActual]);

  if (!b) return <p className="text-slate-500">Cargando…</p>;

  const irA = (p: number) => {
    if (p <= b.paso || validoPaso.slice(0, p).every(Boolean)) set("paso", p);
  };

  function elegirTipo(t: TipoResumen) {
    setB((prev) => prev && { ...prev, tipo: t, extension: t === "machete" ? "machete" : prev.extension === "machete" && prev.tipo === "machete" ? null : prev.extension });
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    // Normaliza a texto plano (sin formato)
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain").replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");
    const el = e.currentTarget;
    const nuevo = el.value.slice(0, el.selectionStart) + text + el.value.slice(el.selectionEnd);
    set("apuntes", nuevo);
  }

  async function confirmar() {
    if (!b || !b.tipo || !b.extension) return;
    setEnviando(true);
    setError(null);
    const r = await api.crearResumen({
      apuntes: b.apuntes,
      instrucciones: b.instrucciones || undefined,
      tipo: b.tipo,
      extension: b.extension,
      diseno: b.diseno,
      opciones: { nombre: b.nombre, materia: b.materia.trim(), fecha: b.fecha, resaltador: b.resaltador, birome: b.birome },
      idempotencyKey: b.idempotencyKey,
    });
    if (!r.ok) {
      setEnviando(false);
      setError(
        {
          saldo_insuficiente: "No te alcanzan los créditos para esta extensión.",
          email_no_verificado: "Verificá tu email para poder generar resúmenes.",
          limite_activos: "Esperá a que termine uno de tus resúmenes en curso.",
          validacion: "Revisá los datos: algo no pasó la validación.",
          desconocido: "Algo falló. Probá de nuevo en un ratito.",
        }[r.error],
      );
      return;
    }
    setSaldoLocal(r.saldo);
    limpiarBorrador();
    refrescar();
    router.push(`/resumenes/${r.resumenId}`);
  }

  const c = costoDe(b.extension);
  const len = b.apuntes.length;

  return (
    <div>
      <WizardStatusBar paso={b.paso} validos={validoPaso} onIr={irA} />

      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        {b.paso === 0 && (
          <div>
            <h2 className="text-lg font-semibold">Pegá tus apuntes</h2>
            <textarea
              value={b.apuntes}
              onChange={(e) => set("apuntes", e.target.value)}
              onPaste={onPaste}
              rows={12}
              placeholder="Pegá acá tus apuntes, la desgrabación de la clase o el resumen de la cátedra…"
              className="mt-3 w-full rounded-lg border border-slate-300 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby="contador"
            />
            <div id="contador" className={`mt-1 text-right text-sm ${len > LIMITES.apuntesMax ? "font-semibold text-red-600" : "text-slate-500"}`}>
              {formatNumero(len)} / {formatNumero(LIMITES.apuntesMax)}
            </div>
            {len > 0 && len < LIMITES.apuntesMin && (
              <p className="text-sm text-amber-700">Necesitamos al menos {LIMITES.apuntesMin} caracteres para armar un buen resumen.</p>
            )}
            {len > LIMITES.apuntesMax && <p className="text-sm text-red-600">Te pasaste del máximo. Recortá un poco o dividilo en dos resúmenes.</p>}
            <label className="mt-4 block">
              <span className="text-sm font-medium">Instrucciones (opcional)</span>
              <textarea
                value={b.instrucciones}
                onChange={(e) => set("instrucciones", e.target.value)}
                maxLength={LIMITES.instruccionesMax}
                rows={2}
                placeholder="Ej.: enfocate en integrales dobles, el parcial es el martes"
                className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="block text-right text-xs text-slate-500">{formatNumero(b.instrucciones.length)} / {formatNumero(LIMITES.instruccionesMax)}</span>
            </label>
          </div>
        )}

        {b.paso === 1 && (
          <div>
            <h2 className="text-lg font-semibold">¿Qué tipo de resumen querés?</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {TIPOS.map((t) => (
                <Tarjeta key={t.id} activa={b.tipo === t.id} onClick={() => elegirTipo(t.id)}>
                  <span className="font-semibold">{t.nombre}</span>
                  <span className="text-sm text-slate-600">{t.descripcion}</span>
                </Tarjeta>
              ))}
            </div>
          </div>
        )}

        {b.paso === 2 && (
          <div>
            <h2 className="text-lg font-semibold">¿Qué tan largo?</h2>
            <p className="mt-1 text-sm text-slate-600">Reservamos el máximo; te cobramos solo las páginas que salgan y te devolvemos el resto.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {EXTENSIONES.map((e) => {
                const ce = costoDe(e.id);
                const forzado = b.tipo === "machete" && e.id !== "machete";
                const sinSaldo = !!ce && ce.maxCreditos > saldoActual;
                return (
                  <Tarjeta key={e.id} activa={b.extension === e.id} disabled={forzado || sinSaldo || !ce} onClick={() => set("extension", e.id)}>
                    <span className="flex items-baseline justify-between">
                      <span className="font-semibold">{e.nombre}</span>
                      <span className="text-xs text-slate-500">{e.paginas}</span>
                    </span>
                    <span className="text-sm text-slate-700">
                      {ce ? `Hasta ${ce.maxCreditos} créditos (mín. ${ce.minCreditos})` : "…"}
                    </span>
                    {forzado && <span className="text-xs text-slate-500">El Machete de 1 hoja va siempre en extensión Machete.</span>}
                    {sinSaldo && !forzado && <span className="text-xs text-red-600">No te alcanza el saldo.</span>}
                  </Tarjeta>
                );
              })}
            </div>
            {EXTENSIONES.some((e) => (costoDe(e.id)?.maxCreditos ?? 0) > saldoActual) && (
              <Link href="/creditos" className="mt-4 inline-block rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
                Comprar créditos
              </Link>
            )}
          </div>
        )}

        {b.paso === 3 && (
          <div className="grid gap-6 md:grid-cols-[1fr_220px]">
            <div>
              <h2 className="text-lg font-semibold">Diseño y personalización</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {DISENOS.map((d) => (
                  <Tarjeta key={d.id} activa={b.diseno === d.id} disabled={!d.disponible} onClick={() => set("diseno", d.id)}>
                    <span className="text-sm font-semibold">{d.nombre}</span>
                  </Tarjeta>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Tu nombre</span>
                  <input value={b.nombre} maxLength={60} onChange={(e) => set("nombre", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Materia *</span>
                  <input value={b.materia} maxLength={LIMITES.materiaMax} onChange={(e) => set("materia", e.target.value)} placeholder="Ej.: Análisis II" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Fecha</span>
                  <input type="date" value={b.fecha} onChange={(e) => set("fecha", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
              </div>
              <Swatches titulo="Color del resaltador" opciones={RESALTADORES} valor={b.resaltador} onChange={(v) => set("resaltador", v as ColorResaltador)} />
              <Swatches titulo="Color de la birome" opciones={BIROMES} valor={b.birome} onChange={(v) => set("birome", v as ColorBirome)} />
            </div>
            <DesignPreview diseno={b.diseno} resaltador={b.resaltador} birome={b.birome} materia={b.materia} nombre={b.nombre} fecha={b.fecha} />
          </div>
        )}

        {b.paso === 4 && c && (
          <div>
            <h2 className="text-lg font-semibold">Revisá y confirmá</h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-slate-500">Materia</dt><dd>{b.materia}</dd>
              <dt className="text-slate-500">Tipo</dt><dd>{TIPOS.find((t) => t.id === b.tipo)?.nombre}</dd>
              <dt className="text-slate-500">Extensión</dt><dd>{EXTENSIONES.find((e) => e.id === b.extension)?.nombre}</dd>
              <dt className="text-slate-500">Diseño</dt><dd>{DISENOS.find((d) => d.id === b.diseno)?.nombre}</dd>
              <dt className="text-slate-500">Colores</dt>
              <dd>Resaltador {RESALTADORES.find((r) => r.id === b.resaltador)?.nombre.toLowerCase()} · birome {BIROMES.find((x) => x.id === b.birome)?.nombre.toLowerCase()}</dd>
              <dt className="text-slate-500">Apuntes</dt><dd>{formatNumero(len)} caracteres</dd>
            </dl>
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Se reservan <strong>{c.maxCreditos} créditos</strong> · saldo después: <strong>{saldoActual - c.maxCreditos}</strong>
              <br />
              <span className="text-xs">Te cobramos entre {c.minCreditos} y {c.maxCreditos} según las páginas que salgan, y te devolvemos el resto.</span>
            </div>
            {saldo && !saldo.emailVerificado && <p className="mt-3 text-sm text-red-600">Verificá tu email para poder generar.</p>}
            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        )}
      </section>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => set("paso", Math.max(0, b.paso - 1))}
          disabled={b.paso === 0}
          className="rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 disabled:invisible"
        >
          ← Atrás
        </button>
        {b.paso < 4 ? (
          <button
            onClick={() => set("paso", b.paso + 1)}
            disabled={!validoPaso[b.paso]}
            className="rounded-lg bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={confirmar}
            disabled={enviando || !validoPaso.every(Boolean) || (saldo !== null && !saldo.emailVerificado)}
            className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
          >
            {enviando ? "Reservando…" : "Confirmar y generar"}
          </button>
        )}
      </div>
    </div>
  );
}

export function WizardStatusBar({ paso, validos, onIr }: { paso: number; validos: boolean[]; onIr: (p: number) => void }) {
  const pct = (paso / (PASOS.length - 1)) * 100;
  return (
    <nav aria-label="Pasos del wizard">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold">Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}</span>
        <span className="text-slate-500">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-3 flex justify-between">
        {PASOS.map((nombre, i) => {
          const alcanzable = i <= paso || validos.slice(0, i).every(Boolean);
          return (
            <li key={nombre}>
              <button
                onClick={() => onIr(i)}
                disabled={!alcanzable}
                aria-current={i === paso ? "step" : undefined}
                className="flex flex-col items-center gap-1 text-xs disabled:opacity-40"
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${i < paso ? "border-blue-600 bg-blue-600 text-white" : i === paso ? "border-blue-600 text-blue-700" : "border-slate-300 text-slate-500"}`}>
                  {i < paso ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{nombre}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Tarjeta({ activa, disabled, onClick, children }: { activa: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={activa}
      className={`flex flex-col gap-1 rounded-xl border-2 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${activa ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-400"}`}
    >
      {children}
    </button>
  );
}

function Swatches({ titulo, opciones, valor, onChange }: { titulo: string; opciones: { id: string; nombre: string; hex: string }[]; valor: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-medium">{titulo}</legend>
      <div className="mt-2 flex gap-2">
        {opciones.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            title={o.nombre}
            aria-label={o.nombre}
            aria-pressed={valor === o.id}
            className={`h-9 w-9 rounded-full border-2 ${valor === o.id ? "border-slate-900 ring-2 ring-offset-2 ring-slate-900" : "border-white shadow"}`}
            style={{ backgroundColor: o.hex }}
          />
        ))}
      </div>
    </fieldset>
  );
}
