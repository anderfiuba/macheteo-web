import { BalanceProvider } from "@/components/BalanceProvider";
import { Header } from "@/components/Header";
import { VerifyBanner } from "@/components/VerifyBanner";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let email: string | null = null;
  let verificado = true;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
    verificado = Boolean(data.user?.email_confirmed_at);
  }
  return (
    <BalanceProvider>
      {!isSupabaseConfigured && (
        <div className="bg-yellow-100 px-4 py-1 text-center text-xs text-yellow-900">
          Modo demo: sin Supabase configurado, datos simulados.
        </div>
      )}
      <Header email={email} />
      <VerifyBanner email={email} verificado={verificado} />
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </BalanceProvider>
  );
}
