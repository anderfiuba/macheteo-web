"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, esErrorContenido, MSG_SERVICIO_NO_DISPONIBLE, SERVICIO_NO_DISPONIBLE, type EstadoResumen, type EstadoResumenDTO } from "@/lib/api";
import { BORRADOR_KEY, pedidoABorrador } from "@/lib/borrador";
import { LARGOS, TIPOS } from "@/lib/catalog";
import { LineaDonar } from "@/components/donacion/Donacion";
import { intentosRestantes, useUso } from "./UsoProvider";

// GE-03: 4 pasos de la referencia. Mapeo: en_cola/generando → 1-2, armando → 3, listo → 4.
const PASOS = ["Leímos tu guía", "Escribimos el contenido", "Diseñando las hojas", "Listo para descargar"];
const pasoActual = (e: EstadoResumen) => ({ en_cola: 0, generando: 1, armando: 2, listo: 3, error: -1 })[e];

export function ResumenProgress({ id }: { id: string }) {
  const [r, setR] = useState<EstadoResumenDTO | null | undefined>(undefined);
  const [offline, setOffline] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());
  const { uso, refrescar } = useUso();
  const [accion, setAccion] = useState<"editar" | "reintentar" | null>(null);
  const [errAccion, setErrAccion] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let activo = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const data = await api.getEstadoResumen(id);
        if (!activo) return;
        setOffline(false);
        setR(data);
        setAhora(Date.now());
        if (data && (data.estado === "listo" || data.estado === "error")) {
          refrescar(); // actualiza el cupo del día (los error no cuentan)
          return;
        }
      } catch {
        if (activo) setOffline(true);
      }
      timer = setTimeout(tick, 3000); // polling cada 3 s (TODO: Supabase Realtime)
    };
    tick();
    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [id, refrescar]);

  if (r === undefined) return <div className="mx-auto h-72 max-w-[640px] animate-pulse rounded-xl bg-celeste" aria-busy="true" aria-label="Cargando" />;
  if (r === null) {
    return (
      <div className="mx-auto max-w-[640px] rounded-xl border border-borde p-6 text-center">
        <p>No encontramos ese machete.</p>
        <Link href="/biblioteca" className="link-garabato mt-3 inline-block">Ir a la biblioteca</Link>
      </div>
    );
  }

  async function descargar() {
    const url = await api.getUrlDescarga(id);
    api.registrarEvento("pdf_descargado", { resumen_id: id, es_redescarga: false });
    if (url) window.location.href = url;
    else alert("No pudimos descargar. Probá de nuevo. (En modo demo no hay PDF.)");
  }

  const paso = pasoActual(r.estado);
  const largo = LARGOS.find((l) => l.id === r.largo);
  const tipo = TIPOS.find((t) => t.id === r.tipo)?.nombre;
  const enColaLargo = r.estado === "en_cola" && ahora - new Date(r.createdAt).getTime() > 30_000;
  // Si la cola no avanza (p. ej. worker caído), no seguir prometiendo "en breve".
  const demorado = r.estado === "en_cola" && ahora - new Date(r.createdAt).getTime() > 5 * 60_000;
  const enCurso = r.estado !== "listo" && r.estado !== "error";
  // N-19: errores de contenido (error_origen=usuario: tope_costo, timeouts) cuentan como intento; los de plataforma no.
  const errContenido = r.estado === "error" && esErrorContenido(r);
  // Intentos que quedan hoy = errores_usuario_limite − errores_usuario_hoy (obtener_uso). 3/día confirmado.
  const intentos = uso ? intentosRestantes(uso) : (r.intentosRestantesHoy ?? 0);

  /** N-19: precarga el formulario con los apuntes guardados server-side (PA-13, ≤ 7 días); fallback: copia local. */
  async function editarYReintentar() {
    setAccion("editar");
    setErrAccion(null);
    const p = await api.getPedido(id);
    if (p) localStorage.setItem(BORRADOR_KEY, JSON.stringify(p));
    else if (!pedidoABorrador(id)) {
      setAccion(null);
      setErrAccion("No encontramos tus apuntes de este machete. Volvé a pegarlos en Nuevo.");
      return;
    }
    router.push("/nuevo");
  }

  /** Error de plataforma: mismo pedido, job nuevo (reintentar_resumen vía /api/machetes). No cuenta para el límite. */
  async function reintentar() {
    setAccion("reintentar");
    setErrAccion(null);
    const res = await api.reintentarResumen(id, crypto.randomUUID());
    if (res.ok) {
      refrescar();
      router.push(`/resumenes/${res.resumenId}`);
      return;
    }
    setAccion(null);
    if (res.error === "limite_activos") setErrAccion("Ya tenés un machete armándose. Esperá que termine para reintentar.");
    else if (res.error === "limite_global") setErrAccion("Hoy Macheteo llegó a su límite del día. Mañana desde las 00:00 podés reintentar.");
    else if (res.error === "limite_diario") setErrAccion("Llegaste al límite de hoy. Mañana podés volver a probar.");
    else if (res.error === "servicio_no_disponible") setErrAccion(MSG_SERVICIO_NO_DISPONIBLE);
    else if (res.error === "limite_errores") setErrAccion("Llegaste al máximo de intentos fallidos de hoy. Mañana podés volver a probar.");
    else setErrAccion("No pudimos reintentar. Probá de nuevo en unos minutos.");
  }

  return (
    <div className="mx-auto max-w-[640px] space-y-6">
      <h1 className="text-[28px] leading-[34px] lg:text-[36px] lg:leading-[42px]">{enCurso ? "Armando tu machete" : r.estado === "listo" ? "Tu machete" : "Algo falló"}</h1>

      <section className="rounded-xl border border-borde p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span aria-hidden className={`font-serif text-3xl text-birome ${enCurso ? "animate-spin [animation-duration:3s]" : ""}`}>{enCurso ? "@" : r.estado === "listo" ? "✓" : "!"}</span>
            <div>
              <p className="font-serif text-2xl text-birome">{r.materia || "Tu machete"}</p>
              <p className="text-sm text-gastado">{r.tipo === "machete" ? "1 hoja doble faz (hasta 2 páginas)" : largo ? `Hasta ${largo.hojas} hojas` : ""}{tipo ? ` · ${tipo}` : ""}</p>
            </div>
          </div>
          {largo && <span className="rounded-full bg-celeste px-3 py-1 text-xs font-semibold text-birome">{largo.nombre}</span>}
        </div>

        {r.estado !== "error" && (
          <>
            <div className="mt-5 h-1.5 rounded-full bg-celeste" role="progressbar" aria-valuenow={r.progreso} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del machete">
              <div className={`h-1.5 rounded-full bg-birome transition-all duration-500 ${offline ? "opacity-40" : ""}`} style={{ width: `${Math.max(4, r.progreso)}%` }} />
            </div>
            <ol className="mt-4 grid grid-cols-4 gap-2 text-xs">
              {PASOS.map((p, i) => (
                <li key={p} className={i === paso ? "font-semibold text-noche" : i < paso ? "text-noche" : "text-gastado"} aria-current={i === paso ? "step" : undefined}>
                  <span className="font-serif text-lg">{i + 1}{i < paso || r.estado === "listo" ? " ✓" : ""}</span>
                  <br />{p}
                </li>
              ))}
            </ol>
          </>
        )}

        <div aria-live="polite" className="mt-5">
          {enCurso && (
            <p className="text-sm text-gastado">
              {offline
                ? "Perdimos la conexión, reintentando…"
                : demorado
                  ? "Está tardando más de lo normal. Tu machete sigue en la fila: podés cerrar la app y te avisamos por mail cuando esté."
                  : enColaLargo
                    ? "Hay varios machetes en fila. El tuyo arranca en breve. "
                    : ""}
              {!demorado && "Suele tardar un par de minutos. Podés cerrar la app: te avisamos por mail cuando esté."}
            </p>
          )}
          {r.estado === "listo" && (
            <div className="rounded-lg bg-celeste px-4 py-3 text-sm">
              <p className="font-semibold">✓ Tu machete está listo: {r.paginas} {r.paginas === 1 ? "página" : "páginas"}.</p>
              <button onClick={descargar} className="link-garabato mt-1">Descargar PDF</button>
            </div>
          )}
          {errContenido && (
            <div className="rounded-lg border border-tachon/40 px-4 py-3 text-sm">
              {intentos > 0 ? (
                <p className="text-tachon">ⓘ Tu apunte es muy largo o complejo para este largo. Probá con menos texto o elegí un largo mayor. Te quedan {intentos} {intentos === 1 ? "intento" : "intentos"} hoy.</p>
              ) : (
                <p className="text-tachon">ⓘ Llegaste al máximo de intentos fallidos de hoy. Mañana podés volver a probar.</p>
              )}
            </div>
          )}
          {r.estado === "error" && !errContenido && (
            <div className="rounded-lg border border-tachon/40 px-4 py-3 text-sm">
              {r.errorCodigo === SERVICIO_NO_DISPONIBLE ? (
                <p className="font-semibold text-tachon">ⓘ {MSG_SERVICIO_NO_DISPONIBLE}</p>
              ) : (
                <>
                  <p className="font-semibold text-tachon">ⓘ No pudimos armar tu machete.</p>
                  <p>Algo falló de nuestro lado. Probá de nuevo en unos minutos.</p>
                  <p className="mt-1 text-xs text-gastado">No cuenta para tu límite de hoy.{r.errorCodigo ? ` Código para soporte: ${r.errorCodigo}.` : ""}</p>
                </>
              )}
            </div>
          )}
        </div>

        {errAccion && <p role="alert" className="mt-4 text-sm font-semibold text-tachon">ⓘ {errAccion}</p>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {r.estado === "listo" && <button onClick={descargar} className="h-12 flex-1 rounded-md bg-birome font-semibold text-white hover:bg-noche">⬇ Descargar PDF</button>}
          {errContenido && intentos > 0 && (
            <button onClick={editarYReintentar} disabled={!!accion} className="h-12 flex-1 rounded-md bg-birome font-semibold text-white hover:bg-noche disabled:opacity-60">
              {accion === "editar" ? "Cargando tus apuntes…" : "Editar y reintentar"}
            </button>
          )}
          {r.estado === "error" && !errContenido && (
            <button onClick={reintentar} disabled={!!accion} className="h-12 flex-1 rounded-md bg-birome font-semibold text-white hover:bg-noche disabled:opacity-60">
              {accion === "reintentar" ? "Reintentando…" : "Reintentar"}
            </button>
          )}
          {r.estado === "listo" && <Link href="/nuevo" className="flex h-12 flex-1 items-center justify-center rounded-md border-[1.5px] border-birome font-semibold text-birome hover:bg-celeste">Armar otro</Link>}
          <Link href="/biblioteca" className="flex h-12 flex-1 items-center justify-center rounded-md border border-borde font-semibold hover:bg-celeste">Ir a la biblioteca</Link>
        </div>
      </section>

      {/* DO-03 / S18: mientras se arma, línea que abre la tarjeta "Bancá a Macheteo" (sheet/modal). Nunca bloquea. */}
      <div className="rounded-lg bg-celeste px-4 py-3">
        {r.estado !== "error" && <LineaDonar variante={r.estado === "listo" ? "listo" : "esperando"} />}
      </div>
    </div>
  );
}
