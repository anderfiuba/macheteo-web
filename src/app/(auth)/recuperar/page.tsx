import Link from "next/link";
import { AuthCard } from "@/components/auth/ui";
import { RecoverForm } from "@/components/auth/RecoverForm";

export const metadata = { title: "Recuperar contraseña · Macheteo" };

export default async function Page({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  return (
    <AuthCard titulo="Recuperá tu contraseña" pie={<Link href="/ingresar" className="text-birome">Volver a entrar</Link>}>
      <RecoverForm vencido={estado === "vencido"} />
    </AuthCard>
  );
}
