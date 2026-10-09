import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-borde bg-hoja pb-20 lg:pb-0">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-sm text-gastado lg:px-10">
        <Link href="/terminos" className="hover:underline">Términos</Link>
        <Link href="/privacidad" className="hover:underline">Privacidad</Link>
        <span>Macheteo es gratis · © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
