"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type CostoExtension } from "@/lib/api";
import { useBalance } from "@/components/BalanceProvider";
import { BORRADOR_KEY, limpiarBorrador } from "@/lib/borrador";
import {
  BIROMES, DISENOS, EXTENSIONES, LIMITES, MACHETE_1_HOJA, RESALTADORES, TIPOS, formatNumero,
  type ColorBirome, type ColorResaltador, type Diseno, type Extension, type TipoResumen,
} from "@/lib/catalog";
import { DesignPreview } from "./DesignPreview";

export const PASOS = ["Apuntes", "Tipo", "Extensión", "Diseño", "Confirmar"] as const;
const TOTAL = PASOS.length;

interface Borrador {
  paso: number; // 0-based internamente; en la URL es ?paso=1..5
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
  idempotencyKey: string | null;
}

type ErrorConfirmar =
  | { tipo: "saldo_insuficiente"; necesitas: number; tenes: number }
  | { tipo: "limite_activos" }
  | { tipo: "email_no_verificado" }
  | { tipo: "generico"; mensaje: string };

const hoy = () => new Date().toISOString().slice(0, 10);
const nuevaClave = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()));
const nuevoBorrador = (): Borrador => ({
  paso: 0, apuntes: "", instrucciones: "", tipo: null, extension: null, diseno: "rayado",
  nombre: "", materia: "", fecha: hoy(), resaltador: "amarillo", birome: "azul", idempotencyKey: null,
});
const tieneContenido = (b: Borrador) => b.apuntes.length > 0 || b.tipo !== null || b.materia.length > 0;

function pasoDeUrl(): number | null {
  const n = Number(new URLSearchParams(window.location.search).get("paso"));
  return Number.isInteger(n) && n >= 1 && n <= TOTAL ? n - 1 : null;
}

export function Wizard() {
  const router = useRouter();
  const { saldo, setSaldoLocal, refrescar } = useBalance();
  const [b, setB] = useState<Borrador | null>(null);
  const [recuperado, setRecuperado] = useState(false);
  const [costos, setCostos] = useState<CostoExtension[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<ErrorConfirmar | null>(null);

  const saldoActual = saldo?.saldo ?? 0;
  const verificado = saldo?.emailVerificado ?? true;
  const costoDe = useCallback((e: Extension | null) => costos.find((c) => c.extension === e), [costos]);

  // Carga inicial: borrador + paso de la URL
  useEffect(() => {
    let inicial = nuevoBorrador();
    try {
      const raw = localStorage.getItem(BORRADOR_KEY);
      if (raw) {
        inicial = { ...inicial, ...(JSON.parse(raw) as Partial<Borrador>) };
        if (tieneContenido(inicial)) setRecuperado(true);
      }
    } catch {}
    const p = pasoDeUrl();
    if (p !== null) inicial.paso = p;
    setB(inicial);
    api.getCostos().then(setCostos);
    const onPop = () => {
      const pp = pasoDeUrl();
      setB((prev) => (prev ? { ...prev, paso: pp ?? 0 } : prev));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (b) localStorage.setItem(BORRADOR_KEY, JSON.stringify(b));
  }, [b]);

  const set = <K extends keyof Borrador>(k: K, v: Borrador[K]) => setB((prev) => (prev ? { ...prev, [k]: v } : prev));

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
  }, [b, costoDe, saldoActual]);

  if (!b) return <WizardSkeleton />;

  function irA(p: number) {
    if (!b) return;
    if (p > b.paso && !validoPaso.slice(0, p).every(Boolean)) return;
    setError(null);
    setB((prev) => {
      if (!prev) return prev;
      const next: Borrador = { ...prev, paso: p };
      // Paso 3: preselecciona la extensión más larga que alcance (salvo elegida antes)
      if (p === 2 && !prev.extension && costos.length) {
        const alcanzables = EXTENSIONES.filter((e) => (costoDe(e.id)?.maxCreditos ?? Infinity) <= saldoActual);
        next.extension = prev.tipo === "machete" ? MACHETE_1_HOJA.extension : alcanzables.at(-1)?.id ?? null;
      }
      // Clave de idempotencia: se genera al entrar al paso 5 y se descarta al salir
      next.idempotencyKey = p === 4 ? prev.idempotencyKey ?? nuevaClave() : null;
      return next;
    });
    const url = new URL(window.location.href);
    url.searchParams.set("paso", String(p + 1));
    window.history.pushState(null, "", url);
    window.scrollTo({ top: 0 });
  }

  function descartar() {
    limpiarBorrador();
    setB(nuevoBorrador());
    setRecuperado(false);
    irA(0);
  }

  function elegirTipo(t: TipoResumen) {
    setB((prev) => {
      if (!prev) return prev;
      // PA-08 aprobado: Machete de 1 hoja fuerza extensión Machete (2 págs)
      if (t === "machete") return { ...prev, tipo: t, extension: MACHETE_1_HOJA.extension };
      return { ...prev, tipo: t, extension: prev.tipo === "machete" ? null : prev.extension };
    });
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    e.preventDefault(); // normaliza a texto plano
    const text = e.clipboardData.getData("text/plain").replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");
    const el = e.currentTarget;
    set("apuntes", el.value.slice(0, el.selectionStart) + text + el.value.slice(el.selectionEnd));
  }

  async function confirmar() {
    if (!b || !b.tipo || !b.extension || enviando) return;
    const key = b.idempotencyKey ?? nuevaClave();
    setEnviando(true);
    setError(null);
    let r;
    try {
      r = await api.crearResumen({
        apuntes: b.apuntes,
        instrucciones: b.instrucciones || undefined,
        tipo: b.tipo,
        extension: b.extension,
        diseno: b.diseno,
        opciones: { nombre: b.nombre, materia: b.materia.trim(), fecha: b.fecha, resaltador: b.resaltador, birome: b.birome },
        idempotencyKey: key,
      });
    } catch {
      setEnviando(false);
      setError({ tipo: "generico", mensaje: "No pudimos confirmar. Revisá tu conexión y reintentá." });
      return;
    }
    if (!r.ok) {
      setEnviando(false);
      if (r.error === "saldo_insuficiente") {
        await refrescar();
        setError({ tipo: "saldo_insuficiente", necesitas: costoDe(b.extension)?.maxCreditos ?? 0, tenes: saldoActual });
      } else if (r.error === "limite_activos") setError({ tipo: "limite_activos" });
      else if (r.error === "email_no_verificado") setError({ tipo: "email_no_verificado" });
      else setError({ tipo: "generico", mensaje: r.error === "validacion" ? "Revisá los datos: algo no pasó la validación." : "No pudimos confirmar. Reintentá." });
      return;
    }
    setSaldoLocal(r.saldo);
    limpiarBorrador();
    refrescar();
    router.push(`/resumenes/${r.resumenId}`);
  }

  const c = costoDe(b.extension);
  const len = b.apuntes.length;
  const tipoNombre = TIPOS.find((t) => t.id === b.tipo)?.nombre;
  const extNombre = b.tipo === "machete" ? `Machete · 1 hoja (${MACHETE_1_HOJA.paginas} págs)` : `${EXTENSIONES.find((e) => e.id === b.extension)?.nombre} · ${EXTENSIONES.find((e) => e.id === b.extension)?.paginas}`;
  const volverCompra = `/creditos?volver=${encodeURIComponent("/nuevo?paso=3")}`;

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
      <StepperSidebar paso={b.paso} validos={validoPaso} onIr={irA} />

      <div>
        <WizardStatusBar paso={b.paso} />

        {recuperado && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-info-bg px-3 py-2 text-sm text-info">
            <span>Seguís con el resumen que dejaste a medias.</span>
            <button onClick={descartar} className="min-h-11 px-2 font-semibold underline">Descartar</button>
          </div>
        )}

        <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6">
          <section>
            {b.paso === 0 && (
              <div>
                <h1 className="text-[22px] font-bold lg:text-2xl">Pegá tus apuntes</h1>
                <textarea
                  value={b.apuntes}
                  onChange={(e) => set("apuntes", e.target.value)}
                  onPaste={onPaste}
                  rows={12}
                  placeholder="Pegá acá tus apuntes, la desgrabación de la clase o el resumen de la cátedra…"
                  className={`mt-4 w-full rounded-md bg-surface p-3 text-base outline-none focus:ring-2 focus:ring-primary ${len > LIMITES.apuntesMax ? "border-2 border-danger" : "border-[1.5px] border-border-strong"}`}
                  aria-describedby="contador"
                />
                <div id="contador" className={`tnum mt-1 text-right text-xs font-medium ${len > LIMITES.apuntesMax ? "text-danger" : "text-ink-muted"}`}>
                  {formatNumero(len)} / {formatNumero(LIMITES.apuntesMax)}
                </div>
                {len > 0 && len < LIMITES.apuntesMin && (
                  <p className="text-sm text-warning">Necesitamos al menos {LIMITES.apuntesMin} caracteres para armar un buen resumen.</p>
                )}
                {len > LIMITES.apuntesMax && <p className="text-sm text-danger">⚠ Te pasaste del máximo. Recortá un poco o dividilo en dos resúmenes.</p>}
                <label className="mt-5 block">
                  <span className="text-base font-semibold">Instrucciones <span className="font-normal text-ink-muted">(opcional)</span></span>
                  <textarea
                    value={b.instrucciones}
                    onChange={(e) => set("instrucciones", e.target.value)}
                    maxLength={LIMITES.instruccionesMax}
                    rows={2}
                    placeholder="Ej.: enfocate en integrales dobles, el parcial es el martes"
                    className="mt-2 w-full rounded-md border-[1.5px] border-border-strong bg-surface p-3 text-base outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="tnum block text-right text-xs font-medium text-ink-muted">{formatNumero(b.instrucciones.length)} / {formatNumero(LIMITES.instruccionesMax)}</span>
                </label>
              </div>
            )}

            {b.paso === 1 && (
              <div>
                <h1 className="text-[22px] font-bold lg:text-2xl">¿Qué tipo de resumen querés?</h1>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {TIPOS.map((t) => (
                    <OptionCard key={t.id} activa={b.tipo === t.id} onClick={() => elegirTipo(t.id)}>
                      <span className="font-semibold">{t.nombre}</span>
                      <span className="text-sm text-ink-muted">{t.descripcion}</span>
                    </OptionCard>
                  ))}
                </div>
              </div>
            )}

            {b.paso === 2 && (
              <div>
                <h1 className="text-[22px] font-bold lg:text-2xl">¿Qué tan largo?</h1>
                {b.tipo === "machete" && (
                  <p className="mt-2 text-sm text-ink-muted">El <strong>Machete de 1 hoja</strong> es una hoja A4 de los dos lados: {MACHETE_1_HOJA.paginas} págs.</p>
                )}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {EXTENSIONES.map((e) => {
                    const ce = costoDe(e.id);
                    const forzado = b.tipo === "machete" && e.id !== MACHETE_1_HOJA.extension;
                    const falta = ce ? ce.maxCreditos - saldoActual : 0;
                    const motivo = !ce ? null : forzado ? "No disponible para \"Machete de 1 hoja\"" : falta > 0 ? `Te faltan ${falta} ${falta === 1 ? "crédito" : "créditos"}` : null;
                    const paginas = b.tipo === "machete" && e.id === "machete" ? "1 hoja · 2 págs" : e.paginas;
                    return (
                      <OptionCard key={e.id} activa={b.extension === e.id} disabled={!ce || !!motivo} onClick={() => set("extension", e.id)}>
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{e.nombre}</span>
                          {ce && <span className="tnum rounded-full border border-border-strong px-2 text-xs font-medium">hasta {ce.maxCreditos} cr.</span>}
                        </span>
                        <span className="tnum text-sm text-ink-muted">
                          {paginas} · {ce ? `hasta ${ce.maxCreditos} créditos (mín. ${ce.minCreditos})` : "…"}
                        </span>
                        {motivo && <span className="text-xs font-semibold text-ink-muted">{motivo}</span>}
                      </OptionCard>
                    );
                  })}
                </div>
                <p className="mt-4 rounded-md bg-surface-alt p-3 text-sm">Reservamos el máximo; te cobramos solo las páginas que salgan y te devolvemos el resto.</p>
                {!verificado ? (
                  <div className="mt-4 rounded-lg border-2 border-ink bg-surface p-4">
                    <p className="font-semibold">Verificá tu email y te regalamos 2 créditos.</p>
                    <p className="text-sm text-ink-muted">Alcanza para un Machete. Usá el botón “Reenviar” del aviso de arriba.</p>
                  </div>
                ) : (
                  b.tipo !== "machete" && EXTENSIONES.some((e) => (costoDe(e.id)?.maxCreditos ?? 0) > saldoActual) && (
                    <div className="mt-4 rounded-lg border-2 border-ink bg-surface p-4">
                      <p className="tnum text-sm">Tenés <strong>{saldoActual} créditos</strong>. Para extensiones más largas, cargá más.</p>
                      <Link href={volverCompra} className="mt-3 inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Comprar créditos</Link>
                      <p className="mt-2 text-xs text-ink-muted">No perdés lo que llevás armado.</p>
                    </div>
                  )
                )}
              </div>
            )}

            {b.paso === 3 && (
              <div>
                <h1 className="text-[22px] font-bold lg:text-2xl">Diseño y personalización</h1>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {DISENOS.map((d) => (
                    <OptionCard key={d.id} activa={b.diseno === d.id} disabled={!d.disponible} onClick={() => set("diseno", d.id)}>
                      <span className="text-sm font-semibold">{d.nombre}</span>
                    </OptionCard>
                  ))}
                </div>
                <h2 className="mt-6 text-lg font-semibold">Personalización</h2>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="Tu nombre" value={b.nombre} maxLength={60} onChange={(v) => set("nombre", v)} />
                  <Input
                    label="Materia *" value={b.materia} maxLength={LIMITES.materiaMax} placeholder="Ej.: Análisis II" onChange={(v) => set("materia", v)}
                    error={b.materia.length === 0 ? "Poné la materia: va en el encabezado del PDF." : null}
                  />
                  <Input label="Fecha" type="date" value={b.fecha} onChange={(v) => set("fecha", v)} />
                </div>
                <Swatches titulo="Color del resaltador" opciones={RESALTADORES} valor={b.resaltador} onChange={(v) => set("resaltador", v as ColorResaltador)} />
                <Swatches titulo="Color de la birome" opciones={BIROMES} valor={b.birome} onChange={(v) => set("birome", v as ColorBirome)} />
              </div>
            )}

            {b.paso === 4 && c && (
              <div>
                <h1 className="text-[22px] font-bold lg:text-2xl">Revisá antes de generar</h1>
                <dl className="mt-4 grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-2 rounded-lg border-[1.5px] border-border bg-surface p-4 text-sm shadow-1">
                  <Fila label="Tipo" valor={tipoNombre} onEditar={() => irA(1)} />
                  <Fila label="Extensión" valor={extNombre} onEditar={() => irA(2)} />
                  <Fila label="Diseño" valor={DISENOS.find((d) => d.id === b.diseno)?.nombre} onEditar={() => irA(3)} />
                  <Fila label="Colores" valor={`Resaltador ${RESALTADORES.find((r) => r.id === b.resaltador)?.nombre.toLowerCase()} · birome ${BIROMES.find((x) => x.id === b.birome)?.nombre.toLowerCase()}`} onEditar={() => irA(3)} />
                  <Fila label="Materia" valor={b.materia} onEditar={() => irA(3)} />
                  <Fila label="Apuntes" valor={`${formatNumero(len)} caracteres`} onEditar={() => irA(0)} />
                </dl>
                <div className="tnum mt-4 rounded-lg border-2 border-ink bg-surface p-4 text-sm">
                  <div className="flex justify-between"><span>Se reservan</span><strong>{c.maxCreditos} créditos</strong></div>
                  <div className="mt-1 flex justify-between">
                    <span>Saldo después</span>
                    <strong>{saldoActual >= c.maxCreditos ? `${saldoActual - c.maxCreditos} créditos` : "no alcanza"}</strong>
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">Te cobramos entre {c.minCreditos} y {c.maxCreditos} según las páginas que salgan; el resto vuelve a tu saldo.</p>
                </div>
                {error?.tipo === "saldo_insuficiente" && (
                  <div role="alert" className="mt-4 rounded-lg border-2 border-danger bg-danger-bg p-4 text-sm text-danger">
                    <p className="font-semibold">Tu saldo cambió: necesitás {error.necesitas} y tenés {saldoActual}.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={volverCompra} className="inline-flex h-11 items-center rounded-md bg-primary px-4 font-semibold text-white">Comprar créditos</Link>
                      <button onClick={() => irA(2)} className="h-11 rounded-md border-[1.5px] border-border-strong bg-surface px-4 font-semibold text-ink">Elegir otra extensión</button>
                    </div>
                  </div>
                )}
                {error?.tipo === "limite_activos" && (
                  <div role="alert" className="mt-4 rounded-lg border-2 border-warning bg-warning-bg p-4 text-sm text-warning">
                    <p className="font-semibold">Esperá a que termine uno.</p>
                    <p>Podés tener hasta 2 resúmenes generándose a la vez.</p>
                    <Link href="/biblioteca" className="mt-3 inline-flex h-11 items-center rounded-md border-[1.5px] border-border-strong bg-surface px-4 font-semibold text-ink">Ver mis resúmenes</Link>
                  </div>
                )}
                {(error?.tipo === "email_no_verificado" || !verificado) && (
                  <p role="alert" className="mt-4 text-sm text-warning">Verificá tu email para poder generar.</p>
                )}
                {error?.tipo === "generico" && <p role="alert" className="mt-4 text-sm text-danger">⚠ {error.mensaje}</p>}
                <p className="mt-4 text-xs text-ink-muted">El resumen lo genera una IA: revisalo con tu material de cátedra.</p>
              </div>
            )}

            <div className="mt-6 flex justify-between gap-3 border-t border-border pt-4">
              <button
                onClick={() => irA(Math.max(0, b.paso - 1))}
                disabled={b.paso === 0}
                className="h-12 rounded-md border-[1.5px] border-border-strong bg-surface px-5 font-semibold hover:bg-surface-alt disabled:invisible lg:h-11"
              >
                ← Atrás
              </button>
              {b.paso < TOTAL - 1 ? (
                <button
                  onClick={() => irA(b.paso + 1)}
                  disabled={!validoPaso[b.paso]}
                  className="h-12 flex-1 rounded-md bg-primary px-5 font-semibold text-white hover:bg-primary-hover disabled:opacity-50 sm:flex-none lg:h-11"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={confirmar}
                  disabled={enviando || !validoPaso.every(Boolean) || !verificado || error?.tipo === "saldo_insuficiente" || error?.tipo === "limite_activos"}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-5 font-semibold text-white hover:bg-primary-hover disabled:opacity-50 sm:flex-none lg:h-11"
                >
                  {enviando && <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  {enviando ? "Confirmando…" : "Confirmar y generar"}
                </button>
              )}
            </div>
          </section>

          {/* Panel lateral (desktop) */}
          <aside className="hidden lg:block">
            {b.paso === 2 && (
              <div className="rounded-lg border-[1.5px] border-border bg-surface p-4 text-sm shadow-1">
                <p className="font-semibold">¿Cómo cobramos?</p>
                <p className="mt-2">Reservamos el máximo; te cobramos solo las páginas que salgan y te devolvemos el resto.</p>
                <p className="mt-2 text-ink-muted">Ej.: Medio que sale en 6 págs → cobramos 6 y devolvemos 2.</p>
                <p className="tnum mt-2">Tu saldo: <strong>{saldoActual} créditos</strong></p>
              </div>
            )}
            {b.paso === 3 && <DesignPreview diseno={b.diseno} resaltador={b.resaltador} birome={b.birome} materia={b.materia} nombre={b.nombre} fecha={b.fecha} />}
            {b.paso === 4 && (
              <div className="rounded-lg border-[1.5px] border-border bg-surface p-4 text-sm shadow-1">
                <p className="font-semibold">Qué pasa después</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Tu resumen entra en cola.</li>
                  <li>Lo escribimos y armamos el PDF (≈ 2-3 min).</li>
                  <li>Te avisamos por mail y queda en tu biblioteca.</li>
                </ol>
              </div>
            )}
          </aside>
          {b.paso === 3 && (
            <div className="mt-6 max-w-[260px] lg:hidden">
              <DesignPreview diseno={b.diseno} resaltador={b.resaltador} birome={b.birome} materia={b.materia} nombre={b.nombre} fecha={b.fecha} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Indicador "Paso N de 5" + barra segmentada */
export function WizardStatusBar({ paso }: { paso: number }) {
  return (
    <nav aria-label="Progreso del wizard">
      <p className="text-sm">
        <span className="text-ink-muted">Paso {paso + 1} de {TOTAL} · </span>
        <span className="font-semibold">{PASOS[paso]}</span>
      </p>
      <div className="mt-2 grid grid-cols-5 gap-1" role="progressbar" aria-valuenow={paso + 1} aria-valuemin={1} aria-valuemax={TOTAL} aria-valuetext={`Paso ${paso + 1} de ${TOTAL}: ${PASOS[paso]}`}>
        {PASOS.map((p, i) => (
          <span key={p} className={`h-1.5 rounded-full transition-colors duration-200 ${i <= paso ? "bg-ink" : "bg-border"}`} />
        ))}
      </div>
    </nav>
  );
}

function StepperSidebar({ paso, validos, onIr }: { paso: number; validos: boolean[]; onIr: (p: number) => void }) {
  return (
    <aside className="hidden lg:block">
      <p className="font-semibold">Nuevo resumen</p>
      <ol className="mt-4 space-y-1">
        {PASOS.map((nombre, i) => {
          const alcanzable = i <= paso || validos.slice(0, i).every(Boolean);
          return (
            <li key={nombre}>
              <button
                onClick={() => onIr(i)}
                disabled={!alcanzable}
                aria-current={i === paso ? "step" : undefined}
                className={`flex min-h-11 w-full items-center gap-3 rounded-md px-2 text-left text-sm disabled:opacity-50 ${i === paso ? "font-semibold" : ""}`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] text-xs ${i < paso ? "border-ink bg-ink text-white" : i === paso ? "border-ink" : "border-border-strong text-ink-muted"}`}>
                  {i < paso ? "✓" : i + 1}
                </span>
                {nombre}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-xs text-ink-muted">Tu borrador se guarda solo en este dispositivo.</p>
    </aside>
  );
}

function WizardSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="h-4 w-40 rounded bg-surface-alt" />
      <div className="h-2 rounded bg-surface-alt" />
      <div className="h-64 rounded-lg bg-surface-alt" />
    </div>
  );
}

function OptionCard({ activa, disabled, onClick, children }: { activa: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={activa}
      className={`flex min-h-11 flex-col gap-1 rounded-md bg-surface p-4 text-left transition duration-[120ms] disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-50 ${activa ? "border-2 border-primary bg-primary-soft" : "border-[1.5px] border-border-strong hover:border-ink"}`}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, error, ...rest }: { label: string; value: string; onChange: (v: string) => void; error?: string | null; maxLength?: number; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-base font-semibold">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`mt-2 h-12 w-full rounded-md bg-surface px-3 text-base outline-none focus:ring-2 focus:ring-primary ${error ? "border-2 border-danger" : "border-[1.5px] border-border-strong"}`}
      />
      {error && <span className="mt-1 block text-sm text-danger">⚠ {error}</span>}
    </label>
  );
}

function Fila({ label, valor, onEditar }: { label: string; valor?: string; onEditar: () => void }) {
  return (
    <>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-semibold">{valor}</dd>
      <dd><button onClick={onEditar} className="text-xs text-primary underline">editar</button></dd>
    </>
  );
}

function Swatches({ titulo, opciones, valor, onChange }: { titulo: string; opciones: { id: string; nombre: string; hex: string }[]; valor: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="mt-5">
      <legend className="text-base font-semibold">{titulo}</legend>
      <div className="mt-2 flex flex-wrap gap-3">
        {opciones.map((o) => (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} aria-pressed={valor === o.id} className="flex min-w-11 flex-col items-center gap-1">
            <span
              className={`h-8 w-8 rounded-full border border-border-strong ${valor === o.id ? "ring-[3px] ring-ink ring-offset-2" : ""}`}
              style={{ backgroundColor: o.hex }}
            />
            <span className="text-xs font-medium">{o.nombre}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
