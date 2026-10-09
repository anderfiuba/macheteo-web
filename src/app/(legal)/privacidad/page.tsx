import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = { title: "Política de Privacidad · Macheteo", alternates: { canonical: "/privacidad" }, openGraph: { url: "/privacidad" } };

export default function Page() {
  return (
    <LegalPage
      titulo="Política de Privacidad"
      secciones={[
        { titulo: "Qué datos guardamos", texto: "Acá vamos a detallar qué datos tuyos guardamos (email, apuntes, resúmenes, preferencias) y para qué." },
        { titulo: "Tus apuntes", texto: "Acá va cuánto tiempo guardamos los apuntes que pegás y con quién se comparten para generar el resumen." },
        { titulo: "Tus derechos (Ley 25.326)", texto: "Acá vamos a explicar cómo ejercer tus derechos de acceso, rectificación, actualización y supresión." },
        { titulo: "Autoridad de control", texto: "Acá va la información de la Agencia de Acceso a la Información Pública (AAIP)." },
        { titulo: "Contacto", texto: "Acá va cómo escribirnos por temas de privacidad." },
      ]}
    />
  );
}
