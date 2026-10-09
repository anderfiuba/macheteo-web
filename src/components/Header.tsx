import Link from "next/link";
import { BalanceBadge } from "./BalanceBadge";
import { UserMenu } from "./UserMenu";

export function Header({ email }: { email: string | null }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/nuevo" className="font-hand text-2xl font-bold text-slate-900">Macheteo</Link>
        <nav className="flex items-center gap-3">
          <Link href="/nuevo" className="hidden text-sm font-medium text-slate-700 hover:underline sm:inline">Nuevo resumen</Link>
          <BalanceBadge />
          <UserMenu email={email} />
        </nav>
      </div>
    </header>
  );
}
