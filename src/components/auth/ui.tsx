import Link from "next/link";

export function AuthCard({ titulo, children, pie }: { titulo: string; children: React.ReactNode; pie?: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-[440px] rounded-lg border-[1.5px] border-border bg-surface p-6 shadow-1">
        <Link href="/" className="font-hand text-3xl text-ink">Macheteo</Link>
        <h1 className="mt-3 text-[22px] leading-7 font-bold lg:text-2xl lg:leading-8">{titulo}</h1>
        <div className="mt-5">{children}</div>
        {pie && <div className="mt-5 text-center text-sm text-ink-muted">{pie}</div>}
      </div>
    </div>
  );
}

export function Campo(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | null }) {
  const { label, error, id, ...rest } = props;
  return (
    <label htmlFor={id} className="mb-5 block">
      <span className="text-base font-semibold">{label}</span>
      <input
        id={id}
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 h-12 w-full rounded-md bg-surface px-3 text-base outline-none focus:ring-2 focus:ring-primary ${error ? "border-2 border-danger" : "border-[1.5px] border-border-strong"}`}
      />
      {error && <InlineError id={`${id}-error`}>{error}</InlineError>}
    </label>
  );
}

export function InlineError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <span id={id} className="mt-1 flex items-center gap-1 text-sm text-danger">
      <span aria-hidden>⚠</span>
      {children}
    </span>
  );
}

export function Boton({ cargando, children, variante = "primario", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { cargando?: boolean; variante?: "primario" | "secundario" }) {
  const cls = variante === "primario"
    ? "bg-primary text-white hover:bg-primary-hover"
    : "border-[1.5px] border-border-strong bg-surface text-ink hover:bg-surface-alt";
  return (
    <button
      {...rest}
      disabled={cargando || rest.disabled}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-md px-4 font-semibold transition duration-[120ms] disabled:opacity-50 lg:h-11 ${cls}`}
    >
      {cargando && <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

export function Aviso({ tipo = "info", children }: { tipo?: "info" | "error" | "ok" | "warning"; children: React.ReactNode }) {
  const cls = {
    info: "bg-info-bg text-info",
    error: "bg-danger-bg text-danger",
    ok: "bg-success-bg text-success",
    warning: "bg-warning-bg text-warning",
  }[tipo];
  return <div role={tipo === "error" ? "alert" : "status"} className={`mb-4 rounded-md px-3 py-2 text-sm ${cls}`}>{children}</div>;
}

export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const safeVolver = (v?: string | null, fallback = "/biblioteca") =>
  v && v.startsWith("/") && !v.startsWith("//") ? v : fallback;
