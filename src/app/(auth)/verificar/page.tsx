import { redirect } from "next/navigation";

// Ingreso solo con Google: no hay verificación por email. /auth/callback manda acá los links vencidos o con error.
export default async function Page({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  redirect(estado ? "/ingresar?estado=error" : "/ingresar");
}
