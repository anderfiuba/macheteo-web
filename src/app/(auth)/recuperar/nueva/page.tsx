import { AuthCard } from "@/components/auth/ui";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export const metadata = { title: "Nueva contraseña · Macheteo" };

export default function Page() {
  return (
    <AuthCard titulo="Creá una contraseña nueva">
      <UpdatePasswordForm />
    </AuthCard>
  );
}
