import Link from "next/link";
import { AuthCard } from "@/components/auth/ui";
import { AccesoGoogle } from "@/components/auth/AccesoGoogle";

export const metadata = { title: "Crear cuenta · Macheteo", alternates: { canonical: "/registro" }, openGraph: { url: "/registro" } };

export default function Page() {
  return (
    <AuthCard titulo="Creá tu cuenta" pie={<>¿Ya tenés cuenta? <Link href="/ingresar" className="font-semibold text-birome">Entrá</Link></>}>
      <p className="mb-5 text-base">Es gratis y entrás con tu cuenta de Google, sin otra contraseña.</p>
      <AccesoGoogle />
    </AuthCard>
  );
}
