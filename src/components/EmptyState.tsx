import Link from "next/link";

export function EmptyState({ titulo, texto, cta }: { titulo: string; texto?: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-xl border border-dashed border-borde-fuerte bg-hoja p-8 text-center">
      <p className="font-serif text-2xl text-birome">{titulo}</p>
      {texto && <p className="mt-2 text-gastado">{texto}</p>}
      {cta && (
        <Link href={cta.href} className="mt-5 inline-flex h-12 items-center rounded-xl bg-birome px-6 font-semibold text-white hover:bg-noche">{cta.label}</Link>
      )}
    </div>
  );
}
