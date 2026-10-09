import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = { title: "Términos y Condiciones · Macheteo" };

export default function Page() {
  return (
    <LegalPage
      titulo="Términos y Condiciones"
      secciones={[
        { titulo: "Qué es Macheteo", texto: "Acá vamos a explicar el servicio gratuito: pegás tu guía y armamos un resumen en PDF con ayuda de inteligencia artificial." },
        { titulo: "Uso de IA", texto: "Acá vamos a contarte qué proveedor de IA usamos y por qué tenés que revisar el resumen con el material de tu cátedra." },
        { titulo: "Límites de uso", texto: "Acá van los límites diarios para que el servicio gratis siga funcionando, y que pueden cambiar." },
        { titulo: "Donaciones voluntarias", texto: "Acá va que las donaciones son opcionales, no son una compra, no dan derechos extra, no se reintegran y van a la cuenta de Mercado Pago del titular." },
        { titulo: "Tu cuenta", texto: "Acá van tus responsabilidades como usuario y cómo podés eliminar tu cuenta." },
        { titulo: "Contacto", texto: "Acá va cómo escribirnos." },
      ]}
    />
  );
}
