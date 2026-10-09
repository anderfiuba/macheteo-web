import { AppNav } from "@/components/AppNav";
import { UsoProvider } from "@/components/UsoProvider";
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
    <UsoProvider>
      <div className="flex flex-1">
        <AppNav inicial={(email ?? "M").charAt(0).toUpperCase()} />
        <div className="flex min-w-0 flex-1 flex-col">
          {!isSupabaseConfigured && (
            <div className="bg-celeste px-4 py-1 text-center text-xs text-noche">Modo demo: sin Supabase configurado, datos simulados.</div>
          )}
          <VerifyBanner email={email} verificado={verificado} />
          <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 lg:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </UsoProvider>
  );
}
