import Link from "next/link";
import { AuthCard, Aviso, safeVolver } from "@/components/auth/ui";
import { AccesoGoogle } from "@/components/auth/AccesoGoogle";

export const metadata = { title: "Entrar · Macheteo", alternates: { canonical: "/ingresar" }, openGraph: { url: "/ingresar" } };

export default async function Page({ searchParams }: { searchParams: Promise<{ volver?: string; estado?: string }> }) {
  const { volver, estado } = await searchParams;
  return (
    <AuthCard titulo="Entrá a tu cuenta" pie={<>¿Es tu primera vez? <Link href="/registro" className="font-semibold text-birome">Creá tu cuenta</Link></>}>
      {estado === "error" && <Aviso tipo="warning">No pudimos completar el ingreso. Probá de nuevo.</Aviso>}
      {volver && estado !== "error" && <Aviso tipo="info">Tu sesión venció. Entrá de nuevo y seguís donde estabas.</Aviso>}
      <AccesoGoogle volver={safeVolver(volver)} />
    </AuthCard>
  );
}
