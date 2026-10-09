"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { limpiarBorrador } from "@/lib/borrador";

export async function cerrarSesion(router: ReturnType<typeof useRouter>) {
  limpiarBorrador();
  if (isSupabaseConfigured) await createClient().auth.signOut();
  router.push("/");
  router.refresh();
}

export function UserMenu({ email }: { email: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();
  const item = "flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-surface-alt";
  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-alt text-sm font-bold text-ink"
        aria-label="Menú de usuario"
        aria-expanded={abierto}
      >
        {(email ?? "?").charAt(0).toUpperCase()}
      </button>
      {abierto && (
        <div className="absolute right-0 z-20 mt-2 w-60 rounded-lg border border-border bg-surface p-2 shadow-2">
          <p className="truncate px-3 py-1 text-xs text-ink-muted">{email ?? "Modo demo"}</p>
          <Link href="/biblioteca" className={item}>Mi biblioteca</Link>
          <Link href="/creditos" className={item}>Comprar créditos</Link>
          <Link href="/cuenta" className={item}>Mi cuenta</Link>
          <button onClick={() => cerrarSesion(router)} className={`${item} w-full text-left text-danger hover:bg-danger-bg`}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
