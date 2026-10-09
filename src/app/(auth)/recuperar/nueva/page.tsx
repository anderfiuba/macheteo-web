import { redirect } from "next/navigation";

// Ingreso solo con Google: no hay contraseñas que recuperar.
export default function Page() {
  redirect("/ingresar");
}
