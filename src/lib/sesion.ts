"use client";
import type { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { limpiarDatosLocales } from "@/lib/borrador";

export async function cerrarSesion(router: ReturnType<typeof useRouter>) {
  limpiarDatosLocales();
  if (isSupabaseConfigured) await createClient().auth.signOut();
  router.push("/");
  router.refresh();
}
