"use client";

import { useActionState, useEffect, useRef } from "react";
import { createInstalacion } from "@/lib/actions/instalaciones";

export function InstalacionForm() {
  const [state, formAction, pending] = useActionState(
    createInstalacion,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Limpia el formulario tras un registro exitoso.
  useEffect(() => {
    if (state && "ok" in state && state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <Field label="Nombre de la lechería" name="name" required placeholder="Ej: Lechería San Pedro" />
      <Field
        label="Dirección"
        name="address"
        required
        placeholder="Calle, número, comuna, región"
      />
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
          Referencia (opcional)
        </span>
        <textarea
          name="notes"
          rows={2}
          placeholder="Ej: entrada por el portón azul, 500 m tras el puente…"
          className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
        />
      </label>

      {state && "error" in state && state.error && (
        <p className="rounded-md border border-alert/30 bg-alert-tint px-3 py-2 text-sm text-alert">
          {state.error}
        </p>
      )}
      {state && "ok" in state && state.ok && (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            state.located
              ? "border-ok/30 bg-ok-tint text-ok"
              : "border-signal/30 bg-signal-tint text-signal"
          }`}
        >
          {state.located
            ? `Lechería registrada y ubicada: ${state.label}`
            : "Lechería registrada, pero no pudimos ubicar la dirección. Revisa que esté bien escrita o edítala luego."}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mono w-full rounded-lg bg-petrol py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {pending ? "Registrando…" : "Registrar lechería"}
      </button>
    </form>
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
