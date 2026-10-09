import Link from "next/link";
import { AuthCard } from "@/components/auth/ui";
import { RecoverForm } from "@/components/auth/RecoverForm";

export const metadata = { title: "Recuperar contraseña · Macheteo" };

export default function Page() {
  return (
    <AuthCard titulo="Recuperá tu contraseña" pie={<Link href="/ingresar" className="text-blue-700">Volver a entrar</Link>}>
      <RecoverForm />
    </AuthCard>
  );
}
