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
      {state?.error && <ErrorMsg>{state.error}</ErrorMsg>}
      <SubmitButton pending={pending} idle="Entrar al despacho" busy="Entrando…" />
      <p className="text-center text-sm text-ink-soft">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-petrol hover:underline">
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
      <Field label="Teléfono" name="phone" type="tel" placeholder="+56 9 …" />
      <Field label="Correo" name="email" type="email" autoComplete="email" required />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />
      {state?.error && <ErrorMsg>{state.error}</ErrorMsg>}
      <SubmitButton pending={pending} idle="Crear cuenta" busy="Creando…" />
      <p className="text-center text-sm text-ink-soft">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-petrol hover:underline">
          Ingresa
        </Link>
      </p>
    </form>
  );
}

function SubmitButton({
  pending,
  idle,
  busy,
}: {
  pending: boolean;
  idle: string;
  busy: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mono w-full rounded-lg bg-petrol py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep disabled:opacity-60"
    >
      {pending ? busy : idle}
    </button>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-alert/30 bg-alert-tint px-3 py-2 text-sm text-alert">
      {children}
    </p>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
      />
    </label>
  );
}
