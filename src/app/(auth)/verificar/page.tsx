import Link from "next/link";
import { AuthCard, Aviso } from "@/components/auth/ui";
import { ResendEmail } from "@/components/auth/ResendEmail";

export const metadata = { title: "Revisá tu email · Macheteo" };

/** S03 · Revisá tu email / link vencido (CU-03) */
export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string; estado?: string }> }) {
  const { email, estado } = await searchParams;
  const vencido = estado === "vencido";
  return (
    <AuthCard
      titulo={vencido ? "El link venció" : "Revisá tu email"}
      pie={<Link href="/ingresar" className="text-birome">Ir a entrar</Link>}
    >
      {vencido ? (
        <Aviso tipo="warning">El link de verificación venció o ya se usó. Pedí uno nuevo.</Aviso>
      ) : (
        <p className="mb-5 text-base">
          Si el email es válido, te mandamos un link para verificar tu cuenta{email ? <> a <strong>{email}</strong></> : null}. Cuando la verifiques, ya podés armar tu primer machete. Es gratis.
        </p>
      )}
      <ResendEmail emailInicial={vencido ? undefined : email} />
    </AuthCard>
  );
}
