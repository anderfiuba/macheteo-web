"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { limpiarBorrador } from "@/lib/borrador";

export function UserMenu({ email }: { email: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();

  async function cerrarSesion() {
    limpiarBorrador();
    if (isSupabaseConfigured) await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white"
        aria-label="Menú de usuario"
        aria-expanded={abierto}
      >
        {(email ?? "?").charAt(0).toUpperCase()}
      </button>
      {abierto && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border bg-white p-2 shadow-lg">
          <p className="truncate px-2 py-1 text-xs text-slate-500">{email ?? "Modo demo"}</p>
          <a href="/biblioteca" className="block rounded px-2 py-1.5 text-sm hover:bg-slate-100">Mis resúmenes</a>
          <a href="/creditos" className="block rounded px-2 py-1.5 text-sm hover:bg-slate-100">Comprar créditos</a>
          <button onClick={cerrarSesion} className="block w-full rounded px-2 py-1.5 text-left text-sm text-red-700 hover:bg-red-50">
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
