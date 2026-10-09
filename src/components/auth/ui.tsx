import Link from "next/link";

export function AuthCard({ titulo, children, pie }: { titulo: string; children: React.ReactNode; pie?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[repeating-linear-gradient(white,white_27px,#dbeafe_28px)] px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <Link href="/" className="font-hand text-3xl font-bold">Macheteo</Link>
        <h1 className="mt-2 text-xl font-semibold">{titulo}</h1>
        <div className="mt-4">{children}</div>
        {pie && <div className="mt-4 text-center text-sm text-slate-600">{pie}</div>}
      </div>
    </div>
  );
}

export function Campo(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | null }) {
  const { label, error, id, ...rest } = props;
  return (
    <label htmlFor={id} className="mb-3 block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        id={id}
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-slate-300"}`}
      />
      {error && <span id={`${id}-error`} className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Boton({ cargando, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { cargando?: boolean }) {
  return (
    <button
      {...rest}
      disabled={cargando || rest.disabled}
      className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {cargando ? "Un momento…" : children}
    </button>
  );
}

export function Aviso({ tipo = "info", children }: { tipo?: "info" | "error" | "ok"; children: React.ReactNode }) {
  const cls = { info: "bg-sky-50 text-sky-900", error: "bg-red-50 text-red-800", ok: "bg-green-50 text-green-800" }[tipo];
  return <div role={tipo === "error" ? "alert" : "status"} className={`mb-3 rounded-lg px-3 py-2 text-sm ${cls}`}>{children}</div>;
}

export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
