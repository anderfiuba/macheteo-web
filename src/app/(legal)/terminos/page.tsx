import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = { title: "Términos y Condiciones · Macheteo" };

export default function Page() {
  return (
    <LegalPage
      titulo="Términos y Condiciones"
      secciones={[
        { titulo: "Qué es Macheteo", texto: "Acá vamos a explicar el servicio: pegás tus apuntes y generamos un resumen en PDF con ayuda de inteligencia artificial." },
        { titulo: "Uso de IA", texto: "Acá vamos a contarte qué proveedor de IA usamos y por qué tenés que revisar el resumen con tu material de cátedra." },
        { titulo: "Créditos", texto: "Acá va cómo funcionan los créditos, la reserva y el cobro por páginas, y su vencimiento a los 12 meses." },
        { titulo: "Pagos y devoluciones", texto: "Acá van las condiciones de compra con Mercado Pago, el botón de arrepentimiento y cómo pedir una devolución." },
        { titulo: "Tu cuenta", texto: "Acá van tus responsabilidades como usuario y cómo podés eliminar tu cuenta." },
        { titulo: "Contacto", texto: "Acá va cómo escribirnos." },
      ]}
    />
  );
}
