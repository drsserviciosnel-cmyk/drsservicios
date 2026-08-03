import { register } from "@/lib/actions/auth";
import { RegisterForm } from "@/components/AuthForm";
import { AuthLayout } from "@/components/AuthLayout";

export default function RegistroPage() {
  return (
    <AuthLayout kicker="Nuevo cliente" heading="Crear cuenta">
      <RegisterForm action={register} />
    </AuthLayout>
  );
}
