import { redirect } from "next/navigation";

// La landing llega más adelante (Growth/Diseño). Por ahora "/" lleva a la app; el middleware manda a /ingresar si no hay sesión.
export default function Home() {
  redirect("/nuevo");
}
