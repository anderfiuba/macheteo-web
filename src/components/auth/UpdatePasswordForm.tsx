"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Aviso, Boton, Campo } from "./ui";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [errores, setErrores] = useState<{ p1?: string; p2?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errores = {};
    if (p1.length < 8) errs.p1 = "La contraseña tiene que tener al menos 8 caracteres.";
    if (p1 !== p2) errs.p2 = "Las contraseñas no coinciden.";
    setErrores(errs);
    if (Object.keys(errs).length) return;
    setCargando(true);
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: p1 });
      if (error) {
        setCargando(false);
        return setError("El link venció o ya se usó. Pedí uno nuevo desde “¿Te olvidaste la contraseña?”.");
      }
      await supabase.auth.signOut({ scope: "others" }); // cierra las otras sesiones (CU-04)
    }
    router.push("/ingresar?estado=contrasena_actualizada");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && <Aviso tipo="error">{error}</Aviso>}
      <Campo id="p1" label="Contraseña nueva" type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} error={errores.p1} />
      <Campo id="p2" label="Repetila" type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} error={errores.p2} />
      <Boton type="submit" cargando={cargando}>Guardar contraseña</Boton>
    </form>
  );
}
