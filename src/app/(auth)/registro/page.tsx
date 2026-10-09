import Link from "next/link";
import { AuthCard } from "@/components/auth/ui";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Crear cuenta · Macheteo" };

export default function Page() {
  return (
    <AuthCard titulo="Creá tu cuenta" pie={<>¿Ya tenés cuenta? <Link href="/ingresar" className="font-semibold text-primary">Entrá</Link></>}>
      <SignupForm />
    </AuthCard>
  );
}
