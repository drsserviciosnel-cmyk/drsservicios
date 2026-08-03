import { register } from "@/lib/actions/auth";
import { RegisterForm } from "@/components/AuthForm";

export default function RegistroPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            DRS
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Crear cuenta</h1>
          <p className="text-sm text-slate-500">Registro de cliente</p>
        </div>
        <RegisterForm action={register} />
      </div>
    </main>
  );
}
