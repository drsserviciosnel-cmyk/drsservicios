"use client";

import Link from "next/link";
import { useActionState } from "react";

type Action = (
  prev: unknown,
  formData: FormData,
) => Promise<{ error?: string } | undefined>;

export function LoginForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Correo" name="email" type="email" autoComplete="email" required />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
      <p className="text-center text-sm text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-blue-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Nombre completo" name="full_name" type="text" required />
      <Field label="Teléfono" name="phone" type="tel" />
      <Field label="Correo" name="email" type="email" autoComplete="email" required />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Ingresa
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
