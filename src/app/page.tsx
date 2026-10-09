import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[repeating-linear-gradient(white,white_31px,#dbeafe_32px)] px-6 text-center">
      <h1 className="font-hand text-6xl font-bold">Macheteo</h1>
      <p className="mt-4 max-w-md text-lg text-slate-700">
        Pegá tus apuntes y llevate un PDF que parece escrito a mano en tu cuaderno. Listo para imprimir y estudiar.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/registro" className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white">Crear cuenta gratis</Link>
        <Link href="/ingresar" className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold">Ya tengo cuenta</Link>
      </div>
      <p className="mt-4 text-sm text-slate-500">Te regalamos 2 créditos al verificar tu email.</p>
      <footer className="absolute bottom-4 flex gap-4 text-xs text-slate-500">
        <Link href="/terminos">Términos</Link>
        <Link href="/privacidad">Privacidad</Link>
      </footer>
    </main>
  );
}
