import Link from "next/link";
import { GoogleButton } from "./GoogleButton";

/** Ingreso y registro solo con Google. La aceptación formal de T&C se guarda en /bienvenida (RPC aceptar_terminos). */
export function AccesoGoogle({ volver = "/nuevo" }: { volver?: string }) {
  return (
    <div className="space-y-4">
      <GoogleButton volver={volver} />
      <p className="text-center text-sm text-gastado">
        Al continuar, aceptás los <Link href="/terminos" className="text-birome underline">Términos y Condiciones</Link> y la{" "}
        <Link href="/privacidad" className="text-birome underline">Política de Privacidad</Link>.
      </p>
    </div>
  );
}
