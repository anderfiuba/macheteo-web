import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-hand text-[28px] leading-8 lg:text-4xl lg:leading-10">
        <span style={{ background: "linear-gradient(transparent 55%, var(--color-highlight) 55%)" }}>Macheteo</span>
      </h1>
      <p className="mt-4 max-w-md text-base text-ink-muted">
        Pegá tus apuntes y llevate un PDF que parece escrito a mano en tu cuaderno. Listo para imprimir y estudiar.
      </p>
      <div className="mt-8 flex w-full max-w-[440px] flex-col gap-3 sm:flex-row">
        <Link href="/registro" className="flex h-12 flex-1 items-center justify-center rounded-md bg-primary px-6 font-semibold text-white hover:bg-primary-hover">Crear cuenta gratis</Link>
        <Link href="/ingresar" className="flex h-12 flex-1 items-center justify-center rounded-md border-[1.5px] border-border-strong bg-surface px-6 font-semibold hover:bg-surface-alt">Ya tengo cuenta</Link>
      </div>
      <p className="mt-4 text-sm text-ink-muted">Te regalamos 2 créditos al verificar tu email.</p>
    </main>
  );
}
