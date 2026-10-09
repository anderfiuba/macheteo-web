import Link from "next/link";
import { AuthCard, Aviso, safeVolver } from "@/components/auth/ui";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Entrar · Macheteo", alternates: { canonical: "/ingresar" }, openGraph: { url: "/ingresar" } };

export default async function Page({ searchParams }: { searchParams: Promise<{ volver?: string; estado?: string }> }) {
  const { volver, estado } = await searchParams;
  return (
    <AuthCard titulo="Entrá a tu cuenta" pie={<>¿No tenés cuenta? <Link href="/registro" className="font-semibold text-birome">Registrate</Link></>}>
      {estado === "contrasena_actualizada" && <Aviso tipo="ok">Listo, actualizamos tu contraseña. Entrá con la nueva.</Aviso>}
      {volver && <Aviso tipo="info">Tu sesión venció. Entrá de nuevo y seguís donde estabas.</Aviso>}
      <LoginForm volver={safeVolver(volver)} />
    </AuthCard>
  );
}
