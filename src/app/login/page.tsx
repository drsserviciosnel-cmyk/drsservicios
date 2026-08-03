import { login } from "@/lib/actions/auth";
import { LoginForm } from "@/components/AuthForm";
import { AuthLayout } from "@/components/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout kicker="Acceso" heading="Iniciar sesión">
      <LoginForm action={login} />
    </AuthLayout>
  );
}
