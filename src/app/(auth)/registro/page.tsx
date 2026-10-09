import Link from "next/link";
import { AuthCard } from "@/components/auth/ui";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Crear cuenta · Macheteo", alternates: { canonical: "/registro" }, openGraph: { url: "/registro" } };

export default function Page() {
  return (
    <AuthCard titulo="Creá tu cuenta" pie={<>¿Ya tenés cuenta? <Link href="/ingresar" className="font-semibold text-birome">Entrá</Link></>}>
      <SignupForm />
    </AuthCard>
  );
}
