import { login } from "@/lib/actions/auth";
import { LoginForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <AuthShell title="Iniciar sesión" subtitle="DRS Servicios · Soporte técnico">
      <LoginForm action={login} />
    </AuthShell>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            DRS
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
