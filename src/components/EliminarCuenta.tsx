"use client";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { api } from "@/lib/api";
import { limpiarDatosLocales } from "@/lib/borrador";
import { PALABRA_CONFIRMACION_BAJA } from "@/lib/config";

export const AVISO_BAJA_KEY = "macheteo:aviso-baja";

const ERRORES: Record<string, string> = {
  confirmacion_invalida: `Escribí ${PALABRA_CONFIRMACION_BAJA} en mayúsculas para confirmar.`,
  no_autenticado: "Tu sesión venció. Ingresá de nuevo para eliminar tu cuenta.",
  no_configurado: "Eliminar la cuenta no está disponible en este momento. Probá más tarde.",
  error: "No pudimos eliminar tu cuenta. Probá de nuevo en unos minutos.",
};

/** CU-06 · Eliminar cuenta: diálogo con confirmación escribiendo "ELIMINAR" (BAJ-06). Al terminar: fuera de la sesión → landing con aviso. */
export function EliminarCuenta() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abrirRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const coincide = texto.trim() === PALABRA_CONFIRMACION_BAJA;

  useEffect(() => {
    if (!abierto) return;
    const boton = abrirRef.current;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !enviando && cerrar();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      boton?.focus();
    };
  }, [abierto, enviando]);

  function cerrar() {
    setAbierto(false);
    setTexto("");
    setError(null);
  }

  async function eliminar(e: React.FormEvent) {
    e.preventDefault();
    if (!coincide || enviando) return;
    setEnviando(true);
    setError(null);
    const r = await api.eliminarCuenta(texto);
    if (!r.ok) {
      setEnviando(false);
      setError(ERRORES[r.error] ?? ERRORES.error);
      return;
    }
    limpiarDatosLocales();
    try {
      sessionStorage.setItem(AVISO_BAJA_KEY, "1");
    } catch {}
    // Navegación completa: descarta el estado en memoria de la sesión borrada.
    window.location.assign("/");
    router.refresh();
  }

  return (
    <>
      <button ref={abrirRef} type="button" onClick={() => setAbierto(true)} className="block text-sm font-semibold text-tachon hover:underline">
        Eliminar cuenta
      </button>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] p-0 md:items-center md:p-4" onClick={() => !enviando && cerrar()}>
          <form
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            aria-describedby={`${id}-d`}
            onSubmit={eliminar}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-2xl bg-hoja p-6 shadow-lg md:rounded-2xl"
          >
            <h2 id={`${id}-t`} className="text-2xl">¿Eliminar tu cuenta?</h2>
            <div id={`${id}-d`} className="mt-3 space-y-2 text-sm leading-relaxed">
              <p><strong>Se borran tu cuenta y todos tus machetes.</strong> También tus PDF, tus apuntes guardados y tus preferencias.</p>
              <p>Si tenés un machete armándose, se cancela. <strong>No se puede deshacer.</strong></p>
            </div>
            <label htmlFor={`${id}-i`} className="mt-5 block text-sm font-semibold">
              Para confirmar, escribí <span className="font-mono tracking-wide">{PALABRA_CONFIRMACION_BAJA}</span>
            </label>
            <input
              ref={inputRef}
              id={`${id}-i`}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={enviando}
              className="mt-2 h-12 w-full rounded-md border border-borde-fuerte px-3 text-base outline-none focus:border-tachon"
            />
            {error && <p role="alert" className="mt-2 text-sm text-tachon">ⓘ {error}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
              <button type="button" onClick={cerrar} disabled={enviando} className="h-12 rounded-md border border-borde-fuerte px-5 font-semibold text-birome">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!coincide || enviando}
                className="h-12 rounded-md bg-tachon px-5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-deshabilitado"
              >
                {enviando ? "Eliminando…" : "Eliminar mi cuenta"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/** Aviso en la landing después de una baja (lee y borra el flag de sessionStorage). */
export function AvisoBaja() {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(AVISO_BAJA_KEY)) {
        sessionStorage.removeItem(AVISO_BAJA_KEY);
        setVer(true);
      }
    } catch {}
  }, []);
  if (!ver) return null;
  return (
    <div role="status" className="bg-noche px-5 py-3 text-center text-sm text-white">
      Listo: eliminamos tu cuenta y todos tus machetes. Gracias por haber usado Macheteo.
      <button type="button" onClick={() => setVer(false)} aria-label="Cerrar aviso" className="ml-3 font-semibold underline">Cerrar</button>
    </div>
  );
}
