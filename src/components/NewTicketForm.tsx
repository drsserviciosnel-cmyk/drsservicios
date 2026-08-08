"use client";

import { useActionState } from "react";
import { createTicket } from "@/lib/actions/tickets";
import type { Instalacion } from "@/lib/types";

export function NewTicketForm({
  instalaciones,
}: {
  instalaciones: Instalacion[];
}) {
  const [state, formAction, pending] = useActionState(createTicket, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
          Lechería / Instalación
        </span>
        <select
          name="site_id"
          required
          defaultValue={instalaciones.length === 1 ? instalaciones[0].id : ""}
          className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
        >
          <option value="" disabled>
            Elige la instalación…
          </option>
          {instalaciones.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} — {i.address}
              {i.lat == null ? " (sin ubicación)" : ""}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-ink-faint">
          El ticket usa la dirección registrada de la instalación, no tu ubicación
          actual.
        </span>
      </label>

      <Field
        label="Título del problema"
        name="title"
        required
        placeholder="Ej: Falla en equipo de refrigeración"
      />

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
          Descripción
        </span>
        <textarea
          name="description"
          rows={4}
          placeholder="Describe la emergencia con el mayor detalle posible…"
          className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
          Prioridad
        </span>
        <select
          name="priority"
          defaultValue="alta"
          className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="emergencia">Emergencia</option>
        </select>
      </label>

      {state?.error && (
        <p className="rounded-md border border-alert/30 bg-alert-tint px-3 py-2 text-sm text-alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mono w-full rounded-lg bg-petrol py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep disabled:opacity-60"
      >
        {pending ? "Creando ticket…" : "Crear ticket de soporte"}
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
