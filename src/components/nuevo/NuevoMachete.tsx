"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckTerminos } from "@/components/auth/AceptarTerminos";
import { api, type ErrorCrear } from "@/lib/api";
import { BORRADOR_KEY, guardarPedido, limpiarBorrador } from "@/lib/borrador";
import {
  HOJAS, LARGOS, LIMITES, MACHETE_1_HOJA, TINTAS, TIPOS, fechaCorta, formatNumero, hojasDe, paginasDeGuia,
  type Hoja, type Largo, type Tinta, type TipoResumen,
} from "@/lib/catalog";
import { AvisoUso, bloqueado, cuandoVuelve, hojasRestantes, useUso } from "@/components/UsoProvider";
import { LineaDonar } from "@/components/donacion/Donacion";
import { Preview } from "./Preview";

interface Borrador {
  apuntes: string;
  instrucciones: string;
  tipo: TipoResumen | null;
  largo: Largo | null;
  hoja: Hoja;
  nombre: string;
  materia: string;
  fecha: string;
  tinta: Tinta;
}

const hoy = () => new Date().toISOString().slice(0, 10);
const nuevaClave = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()));
const vacio = (): Borrador => ({ apuntes: "", instrucciones: "", tipo: null, largo: null, hoja: "rayado", nombre: "", materia: "", fecha: hoy(), tinta: "azul" });

/** Descarta valores viejos del borrador (wizard anterior, IDs de hoja previos). */
function sanear(b: Borrador): Borrador {
  const ok = <T,>(v: T, lista: { id: T }[], def: T) => (lista.some((x) => x.id === v) ? v : def);
  return {
    ...b,
    tipo: b.tipo && TIPOS.some((t) => t.id === b.tipo) ? b.tipo : null,
    largo: b.largo && LARGOS.some((l) => l.id === b.largo) ? b.largo : null,
    hoja: ok(b.hoja, HOJAS, "rayado"),
    tinta: ok(b.tinta, TINTAS, "azul"),
    apuntes: typeof b.apuntes === "string" ? b.apuntes : "",
    instrucciones: typeof b.instrucciones === "string" ? b.instrucciones : "",
  };
}

/** NR-01..07 · S08 · "Nuevo machete" en una sola pantalla, con preview en vivo "Así va a salir". */
export function NuevoMachete() {
  const router = useRouter();
  const { uso, enCurso, refrescar } = useUso();
  const [materias, setMaterias] = useState<string[]>([]);
  const [iniciado, setIniciado] = useState(false);
  const [b, setB] = useState<Borrador | null>(null);
  const [verIndicaciones, setVerIndicaciones] = useState(false);
  const [verOpcionesMobile, setVerOpcionesMobile] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<{ code: ErrorCrear; vuelve?: string | null; motivo?: string | null } | null>(null);
  const [clave, setClave] = useState<string>("");
  const [tocado, setTocado] = useState(false);

  useEffect(() => {
    let inicial = vacio();
    let tieneBorrador = false;
    try {
      const raw = localStorage.getItem(BORRADOR_KEY);
      if (raw) {
        inicial = sanear({ ...inicial, ...(JSON.parse(raw) as Partial<Borrador>) });
        tieneBorrador = true;
      }
    } catch {}
    setClave(nuevaClave());
    api.getMaterias().then(setMaterias, () => {});
    if (tieneBorrador) {
      setB(inicial);
      if (inicial.instrucciones) setVerIndicaciones(true);
      return;
    }
    // Defaults desde el Perfil (DO-04 → NR-06)
    api.getPerfil().then(
      (p) => setB({ ...inicial, nombre: p.nombreEnHojas, hoja: p.hojaDefault, tinta: p.tintaDefault }),
      () => setB(inicial),
    );
  }, []);

  useEffect(() => {
    if (b) localStorage.setItem(BORRADOR_KEY, JSON.stringify(b));
  }, [b]);

  const set = <K extends keyof Borrador>(k: K, v: Borrador[K]) => {
    setB((prev) => (prev ? { ...prev, [k]: v } : prev));
    setError(null);
    setClave(nuevaClave()); // cambia el pedido → nueva clave de idempotencia
  };

  const len = b?.apuntes.length ?? 0;
  const quedanHojas = uso ? hojasRestantes(uso) : Infinity;
  const bloqueadoPorUso = !!uso && bloqueado(uso);

  const errores = useMemo(() => {
    if (!b) return {};
    const e: Partial<Record<"apuntes" | "tipo" | "largo" | "materia", string>> = {};
    if (len > LIMITES.apuntesMax) e.apuntes = `El texto tiene ${formatNumero(len)} caracteres y el máximo es ${formatNumero(LIMITES.apuntesMax)}. Sacá una parte y probá de nuevo.`;
    else if (len < LIMITES.apuntesMin) e.apuntes = `Pegá al menos ${LIMITES.apuntesMin} caracteres para que el machete tenga de dónde salir.`;
    if (!b.tipo) e.tipo = "Elegí un tipo de resumen.";
    if (!b.largo) e.largo = "Elegí el largo.";
    else if (hojasDe(b.largo) > quedanHojas) e.largo = `Te quedan ${quedanHojas} hojas hoy: este largo no entra. Elegí uno más corto; mañana se renueva.`;
    if (!b.materia.trim()) e.materia = "Poné la materia: va arriba de cada hoja.";
    return e;
  }, [b, len, quedanHojas]);

  if (!b) return <div className="h-96 animate-pulse rounded-xl bg-celeste" aria-busy="true" aria-label="Cargando" />;

  const valido = Object.keys(errores).length === 0;

  function elegirTipo(t: TipoResumen) {
    setB((prev) => prev && { ...prev, tipo: t, largo: t === "machete" ? MACHETE_1_HOJA.largo : prev.tipo === "machete" ? null : prev.largo });
    setError(null);
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    e.preventDefault(); // normaliza a texto plano
    const text = e.clipboardData.getData("text/plain").replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");
    const el = e.currentTarget;
    const nuevo = el.value.slice(0, el.selectionStart) + text + el.value.slice(el.selectionEnd);
    set("apuntes", nuevo);
    if (!iniciado && text.trim()) {
      setIniciado(true);
      api.registrarEvento("machete_iniciado", { caracteres: nuevo.length }); // plan-beta §9: primer pegado
    }
  }

  async function armar() {
    setTocado(true);
    if (b && !b.materia.trim()) setVerOpcionesMobile(true); // en mobile la materia está en el sheet "Cambiar"
    if (!b || !valido || !b.tipo || !b.largo || enviando || bloqueadoPorUso) return;
    setEnviando(true);
    setError(null);
    try {
      const r = await api.crearResumen({
        apuntes: b.apuntes,
        instrucciones: b.instrucciones.trim() || undefined,
        tipo: b.tipo,
        largo: b.largo,
        hoja: b.hoja,
        tinta: b.tinta,
        opciones: { nombre_en_hojas: b.nombre.trim(), materia: b.materia.trim(), fecha: b.fecha },
        idempotencyKey: clave,
      });
      if (!r.ok) {
        setEnviando(false);
        setError({ code: r.error, vuelve: r.vueltaAt, motivo: r.motivo });
        if (r.error === "limite_diario" || r.error === "limite_activos" || r.error === "limite_errores")
          api.registrarEvento("limite_alcanzado", { tipo: r.error === "limite_activos" ? "simultaneos" : r.error === "limite_errores" ? "errores" : r.motivo && r.motivo !== "hojas" ? `dia_${r.motivo}` : "dia" });
        refrescar();
        return;
      }
      guardarPedido(r.resumenId, b); // N-19: para "Editar y reintentar"
      limpiarBorrador();
      refrescar();
      router.push(`/resumenes/${r.resumenId}`);
    } catch {
      setEnviando(false);
      setError({ code: "desconocido" });
    }
  }

  const msgError: Record<ErrorCrear, string> = {
    limite_diario: error?.motivo === "ip" || error?.motivo === "ip_desconocida"
      ? "Desde esta conexión ya se armaron muchos machetes hoy. Probá más tarde o desde otra red."
      : `Llegaste al límite de hoy. ${cuandoVuelve(error?.vuelve ?? null)} podés armar otro.`,
    limite_activos: "Ya tenés un machete armándose. Esperá que termine para armar otro.",
    limite_errores: "Llegaste al máximo de intentos fallidos de hoy. Mañana podés volver a probar.",
    limite_global: `Hoy se armaron tantos machetes que Macheteo llegó a su límite del día. ${cuandoVuelve(error?.vuelve ?? null)} podés volver a armar; tus apuntes quedan guardados.`,
    email_no_verificado: "Verificá tu email para armar tu machete. Te mandamos el link cuando te registraste.",
    terminos_no_aceptados: "Para armar tu machete tenés que aceptar los Términos y la Política de Privacidad.",
    cuenta_inexistente: "Tu cuenta ya no existe. Cerrá sesión y volvé a registrarte.",
    no_autenticado: "Tu sesión venció. Volvé a entrar: tu texto queda guardado acá.",
    validacion: "Revisá el formulario: algo no pasó la validación.",
    no_configurado: "Armar machetes no está disponible en este momento. Tu texto queda guardado; probá más tarde.",
    desconocido: "No pudimos arrancar tu machete. Revisá tu conexión y probá de nuevo.",
  };
  const label = "mb-2 block text-sm font-semibold";
  const resumenMobile = `Hoja ${HOJAS.find((h) => h.id === b.hoja)?.nombre.toLowerCase()}, tinta ${TINTAS.find((t) => t.id === b.tinta)?.nombre.toLowerCase()} · ${[b.nombre || "Tu nombre", b.materia || "Materia", fechaCorta(b.fecha)].join(", ")}`;

  return (
    <div className="lg:grid lg:grid-cols-[1fr_330px] lg:gap-8">
      <div>
        <h1 className="text-[28px] leading-[34px] lg:text-[36px] lg:leading-[42px]">Nuevo machete</h1>
        <AvisoUso uso={uso} enCurso={enCurso} className="mt-3" />

        {/* Guía o apunte */}
        <label htmlFor="apuntes" className={`${label} mt-6`}>Tu guía o apunte</label>
        <textarea
          id="apuntes"
          value={b.apuntes}
          onChange={(e) => set("apuntes", e.target.value)}
          onPaste={onPaste}
          rows={8}
          placeholder="Pegá acá el texto de la guía o del apunte."
          aria-invalid={tocado && !!errores.apuntes}
          aria-describedby="apuntes-ayuda"
          className={`w-full rounded-md border bg-hoja p-4 text-base outline-none focus:border-birome focus:ring-4 focus:ring-celeste ${len > LIMITES.apuntesMax ? "border-tachon" : "border-borde"}`}
        />
        <div id="apuntes-ayuda" className="mt-1 flex justify-between text-xs">
          <span className="text-gastado">{len > 0 ? `Unas ${paginasDeGuia(len)} ${paginasDeGuia(len) === 1 ? "página" : "páginas"} de guía` : "Entran hasta 40.000 caracteres, unas 10 páginas."}</span>
          <span className={`tnum font-semibold ${len > LIMITES.apuntesMax ? "text-tachon" : "text-noche"}`}>{formatNumero(len)} / {formatNumero(LIMITES.apuntesMax)}</span>
        </div>
        {(len > LIMITES.apuntesMax || (tocado && errores.apuntes)) && <p role="alert" className="mt-1 text-sm font-semibold text-tachon">ⓘ {errores.apuntes}</p>}

        {/* Indicaciones (colapsable, PA-21) */}
        {verIndicaciones ? (
          <div className="mt-3">
            <label htmlFor="indicaciones" className={label}>Indicaciones <span className="font-normal text-gastado">(opcional)</span></label>
            <textarea
              id="indicaciones" rows={2} maxLength={LIMITES.instruccionesMax} value={b.instrucciones}
              onChange={(e) => set("instrucciones", e.target.value)}
              placeholder="Ej.: enfocate en integrales dobles, el parcial es el martes"
              className="w-full rounded-lg border border-borde bg-hoja p-3 text-base outline-none focus:border-birome focus:ring-4 focus:ring-celeste"
            />
            <p className="tnum text-right text-xs text-gastado">{formatNumero(b.instrucciones.length)} / {formatNumero(LIMITES.instruccionesMax)}</p>
          </div>
        ) : (
          <button type="button" onClick={() => setVerIndicaciones(true)} className="link-garabato mt-3 text-sm">+ Agregar indicaciones</button>
        )}

        {/* Tipo */}
        <fieldset className="mt-6">
          <legend className={label}>Tipo de resumen</legend>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {TIPOS.map((t) => (
              <button
                key={t.id} type="button" aria-pressed={b.tipo === t.id} onClick={() => elegirTipo(t.id)} title={t.descripcion}
                className={`flex min-h-14 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${b.tipo === t.id ? "border-birome bg-birome text-white" : "border-borde bg-hoja hover:border-birome"}`}
              >
                <span aria-hidden>{t.icono}</span>{t.nombre}
              </button>
            ))}
          </div>
          {tocado && errores.tipo && <p className="mt-1 text-sm text-tachon">ⓘ {errores.tipo}</p>}
        </fieldset>

        {/* Largo + Hoja */}
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
          <fieldset>
            <legend className={label}>Largo</legend>
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-celeste p-1">
              {LARGOS.map((l) => {
                const forzado = b.tipo === "machete" && l.id !== MACHETE_1_HOJA.largo;
                const sinCupo = l.hojas > quedanHojas;
                return (
                  <button
                    key={l.id} type="button" disabled={forzado || sinCupo} aria-pressed={b.largo === l.id} onClick={() => set("largo", l.id)}
                    title={forzado ? "El Machete de 1 hoja es una hoja doble faz: 2 hojas." : sinCupo ? `No entra en tus ${quedanHojas} hojas de hoy. Mañana se renueva.` : undefined}
                    aria-describedby={sinCupo ? "largo-cupo" : undefined}
                    className={`flex flex-col items-start rounded-md px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${b.largo === l.id ? "bg-birome text-white" : "hover:bg-hoja"}`}
                  >
                    <span className="font-serif text-2xl leading-none">{l.hojas}</span>
                    <span className="text-xs">{l.nombre}</span>
                    {sinCupo && !forzado && <span className="text-[11px] leading-tight">Mañana</span>}
                  </button>
                );
              })}
            </div>
            {Number.isFinite(quedanHojas) && (
              <p id="largo-cupo" className="tnum mt-1 text-xs">
                Te quedan <strong>{quedanHojas} {quedanHojas === 1 ? "hoja" : "hojas"}</strong> hoy.
                {LARGOS.some((l) => l.hojas > quedanHojas) && " Los largos que no entran quedan apagados. Mañana se renueva."}
              </p>
            )}
            <p className="mt-1 text-xs text-gastado">
              {b.tipo === "machete"
                ? "El Machete de 1 hoja es una hoja doble faz: 2 hojas."
                : "El número grande es el máximo de hojas. Si el tema da para menos, el machete sale más corto."}
            </p>
            {errores.largo && (b.largo || tocado) && <p className="mt-1 text-sm text-tachon">ⓘ {errores.largo}</p>}
          </fieldset>

          <div className="hidden md:block">
            <SelectorHoja valor={b.hoja} onChange={(h) => set("hoja", h)} />
          </div>
        </div>

        {/* Mobile (S08): resumen de hoja/tinta/datos + "Cambiar" abre el sheet "Así va a salir" */}
        <div className={`mt-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm md:hidden ${tocado && errores.materia ? "border-tachon" : "border-borde"}`}>
          <span>
            <strong className="block">{resumenMobile.split(" · ")[0]}</strong>
            <span className="text-gastado">{resumenMobile.split(" · ")[1]}</span>
            {tocado && errores.materia && <span className="block text-tachon">ⓘ {errores.materia}</span>}
          </span>
          <button type="button" onClick={() => setVerOpcionesMobile(true)} className="link-garabato shrink-0">Cambiar</button>
        </div>

        {/* Desktop: nombre, materia, fecha */}
        <div className="mt-6 hidden gap-4 md:grid md:grid-cols-[1fr_1fr_120px]">
          <Campo id="nombre" label="Tu nombre" value={b.nombre} maxLength={LIMITES.nombreMax} placeholder="Va arriba de cada hoja" onChange={(v) => set("nombre", v)} />
          <Campo id="materia" label="Materia" value={b.materia} maxLength={LIMITES.materiaMax} placeholder="Ej.: Análisis I" onChange={(v) => set("materia", v)} error={tocado ? errores.materia : undefined} list="mis-materias" />
          <Campo id="fecha" label="Fecha" type="date" value={b.fecha} onChange={(v) => set("fecha", v)} />
        </div>

        <datalist id="mis-materias">{materias.map((m) => <option key={m} value={m} />)}</datalist>

        {verOpcionesMobile && (
          <div role="dialog" aria-modal="true" aria-label="Así va a salir" className="fixed inset-0 z-40 flex items-end bg-[var(--overlay)] md:hidden" onClick={() => setVerOpcionesMobile(false)}>
            <div className="max-h-[90vh] w-full space-y-5 overflow-y-auto rounded-t-xl bg-hoja p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div aria-hidden className="mx-auto h-1 w-10 rounded-full bg-borde" />
              <h2 className="text-[18px] leading-6">Así va a salir</h2>
              <SelectorHoja valor={b.hoja} onChange={(h) => set("hoja", h)} />
              <SelectorTinta valor={b.tinta} onChange={(t) => set("tinta", t)} />
              <div className="grid grid-cols-[1fr_110px] gap-3">
                <Campo id="m-nombre" label="Tu nombre" value={b.nombre} maxLength={LIMITES.nombreMax} onChange={(v) => set("nombre", v)} />
                <Campo id="m-fecha" label="Fecha" type="date" value={b.fecha} onChange={(v) => set("fecha", v)} />
              </div>
              <Campo id="m-materia" label="Materia" value={b.materia} maxLength={LIMITES.materiaMax} placeholder="Ej.: Análisis I" onChange={(v) => set("materia", v)} error={tocado ? errores.materia : undefined} list="mis-materias" />
              <button type="button" onClick={() => setVerOpcionesMobile(false)} className="h-[52px] w-full rounded-md bg-birome font-semibold text-white hover:bg-noche">Listo</button>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="sticky bottom-14 z-10 -mx-4 mt-8 border-t border-borde bg-hoja/95 px-4 py-4 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
          {error && error.code === "terminos_no_aceptados" ? (
            <AceptarEnLinea onAceptado={() => { setError(null); void armar(); }} mensaje={msgError.terminos_no_aceptados} />
          ) : error && <p role="alert" className="mb-3 rounded-lg bg-tachon-bg px-4 py-2 text-sm font-semibold text-tachon">ⓘ {msgError[error.code]}</p>}
          <div className="flex flex-col-reverse items-stretch gap-3 lg:flex-row lg:items-center lg:justify-between">
            <LineaDonar className="lg:text-left" />
            <button
              type="button" onClick={armar} disabled={enviando || bloqueadoPorUso || len === 0}
              className="flex h-[52px] items-center justify-center gap-2 rounded-md bg-birome px-8 text-base font-semibold text-white transition hover:bg-noche disabled:bg-celeste disabled:text-deshabilitado lg:h-14"
            >
              {enviando && <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {len === 0 ? "Sin texto todavía" : enviando ? "Arrancando…" : "Armar mi machete"}
            </button>
          </div>
        </div>
      </div>

      {/* Panel derecho: Así va a salir */}
      <aside className="hidden lg:block">
        <div className="sticky top-8 rounded-lg bg-celeste p-5">
          <h2 className="text-2xl">Así va a salir</h2>
          <div className="mt-4">
            <Preview hoja={b.hoja} tinta={b.tinta} tipo={b.tipo} largo={b.largo} nombre={b.nombre} materia={b.materia} fecha={b.fecha} apuntes={b.apuntes} />
          </div>
          <div className="mt-4 rounded-lg bg-hoja p-3">
            <SelectorTinta valor={b.tinta} onChange={(t) => set("tinta", t)} />
          </div>
          <p className="mt-3 text-xs text-gastado">
            Arriba de cada hoja va tu nombre, la materia y la fecha. Al final, un aviso para que lo revises con el material de tu cátedra.
          </p>
        </div>
      </aside>
    </div>
  );
}

function SelectorHoja({ valor, onChange }: { valor: Hoja; onChange: (h: Hoja) => void }) {
  const fondo: Record<Hoja, string> = {
    rayado: "repeating-linear-gradient(#fff, #fff 5px, #D5DBFA 6px)",
    cuadriculado: "linear-gradient(#D5DBFA 1px, transparent 1px) 0 0/6px 6px, linear-gradient(90deg, #D5DBFA 1px, #fff 1px) 0 0/6px 6px",
    punteado: "radial-gradient(#A9B3F0 0.8px, #fff 0.9px) 0 0/6px 6px",
  };
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-semibold">Hoja</legend>
      <div className="flex gap-2">
        {HOJAS.map((h) => (
          <button
            key={h.id} type="button" aria-pressed={valor === h.id} onClick={() => onChange(h.id)}
            className={`flex w-[88px] flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium ${valor === h.id ? "border-2 border-birome text-birome ring-4 ring-celeste" : "border border-borde hover:border-birome"}`}
          >
            <span aria-hidden className="h-9 w-7 rounded-[3px] border border-borde" style={{ background: fondo[h.id] }} />
            {h.nombre}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function SelectorTinta({ valor, onChange }: { valor: Tinta; onChange: (t: Tinta) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Tinta del PDF</legend>
      <div className="flex items-center gap-3">
        {TINTAS.map((t) => (
          <button key={t.id} type="button" onClick={() => onChange(t.id)} aria-pressed={valor === t.id} aria-label={t.nombre} title={t.nombre}
            className={`h-7 w-7 rounded-full ${valor === t.id ? "ring-[3px] ring-birome ring-offset-2" : ""}`} style={{ backgroundColor: t.hex }} />
        ))}
        <span className="ml-auto text-sm text-gastado">{TINTAS.find((t) => t.id === valor)?.nombre}</span>
      </div>
    </fieldset>
  );
}

function Campo({ id, label, value, onChange, error, ...rest }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; maxLength?: number; placeholder?: string; type?: string; list?: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        id={id} {...rest} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error}
        className={`h-12 w-full rounded-md border bg-hoja px-3 text-base outline-none focus:border-birome focus:ring-4 focus:ring-celeste ${error ? "border-tachon" : "border-borde"}`}
      />
      {error && <span className="mt-1 block text-sm text-tachon">ⓘ {error}</span>}
    </label>
  );
}

/** terminos_no_aceptados en S08: aceptar ahí mismo y volver a armar con el mismo pedido (misma idempotency key). */
function AceptarEnLinea({ mensaje, onAceptado }: { mensaje: string; onAceptado: () => void }) {
  const [acepto, setAcepto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);
  async function aceptar() {
    if (!acepto) return setFallo("Marcá la casilla para continuar.");
    setCargando(true);
    setFallo(null);
    const ok = await api.aceptarTerminos();
    setCargando(false);
    if (ok) onAceptado();
    else setFallo("No pudimos guardar tu aceptación. Probá de nuevo.");
  }
  return (
    <div role="alert" className="mb-3 space-y-3 rounded-lg border border-tachon bg-tachon-bg px-4 py-3 text-sm">
      <p className="font-semibold text-tachon">ⓘ {mensaje}</p>
      <CheckTerminos checked={acepto} onChange={(v) => { setAcepto(v); if (v) setFallo(null); }} error={fallo} />
      <button type="button" onClick={aceptar} disabled={cargando} className="h-11 w-full rounded-md bg-birome px-4 font-semibold text-white hover:bg-noche disabled:opacity-60 md:w-auto">
        {cargando ? "Guardando…" : "Aceptar y armar mi machete"}
      </button>
    </div>
  );
}
