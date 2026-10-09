import Link from "next/link";

export function EmptyState({ titulo, texto, cta }: { titulo: string; texto?: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-lg border-[1.5px] border-dashed border-border-strong bg-surface p-8 text-center">
      <p className="font-hand text-2xl">{titulo}</p>
      {texto && <p className="mt-2 text-ink-muted">{texto}</p>}
      {cta && (
        <Link href={cta.href} className="mt-5 inline-flex h-12 items-center rounded-md bg-primary px-5 font-semibold text-white hover:bg-primary-hover">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
