import { redirect } from "next/navigation";
import { AuthCard, safeVolver } from "@/components/auth/ui";
import { AceptarTerminosForm } from "@/components/auth/AceptarTerminos";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Bienvenida · Macheteo", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Aceptación de T&C para cuentas que no pasaron por el checkbox del registro (Google, cuentas viejas). */
export default async function Page({ searchParams }: { searchParams: Promise<{ volver?: string }> }) {
  const volver = safeVolver((await searchParams).volver);
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/ingresar");
    const { data: perfil } = await supabase.from("perfiles").select("acepto_terminos_at, nombre").eq("id", user.id).maybeSingle();
    if (perfil?.acepto_terminos_at) redirect(volver);
  }
  return (
    <AuthCard titulo="¡Te damos la bienvenida!">
      <p className="mb-5 text-base">Antes de armar tu primer machete, necesitamos que aceptes los Términos y la Política de Privacidad.</p>
      <AceptarTerminosForm volver={volver} />
    </AuthCard>
  );
}
