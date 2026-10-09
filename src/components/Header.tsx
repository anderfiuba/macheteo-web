import Link from "next/link";
import { BalanceBadge } from "./BalanceBadge";
import { UserMenu } from "./UserMenu";

/** AppHeader: logo texto, nav (desktop), badge saldo, menú usuario. */
export function Header({ email }: { email: string | null }) {
  const nav = "text-sm font-medium text-ink hover:underline";
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-2 lg:px-10">
        <div className="flex items-center gap-8">
          <Link href="/biblioteca" className="font-hand text-2xl text-ink">Macheteo</Link>
          <nav className="hidden gap-6 lg:flex">
            <Link href="/biblioteca" className={nav}>Biblioteca</Link>
            <Link href="/nuevo" className={nav}>Nuevo resumen</Link>
            <Link href="/creditos" className={nav}>Créditos</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <BalanceBadge />
          <Link href="/nuevo" className="hidden h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover lg:flex">
            + Nuevo resumen
          </Link>
          <UserMenu email={email} />
        </div>
      </div>
    </header>
  );
}
