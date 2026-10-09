import Link from "next/link";
import { AuthCard } from "@/components/auth/ui";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Entrar · Macheteo" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next?.startsWith("/") ? next : "/nuevo";
  return (
    <AuthCard titulo="Entrá a tu cuenta" pie={<>¿No tenés cuenta? <Link href="/registro" className="font-semibold text-blue-700">Registrate</Link></>}>
      <LoginForm next={safeNext} error={error} />
    </AuthCard>
  );
}
