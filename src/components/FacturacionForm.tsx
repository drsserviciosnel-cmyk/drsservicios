"use client";

import { useActionState } from "react";
import { updateFacturacion } from "@/lib/actions/facturacion";
import type { Profile } from "@/lib/types";

export function FacturacionForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    updateFacturacion,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="RUT"
          name="rut"
          required
          defaultValue={profile.rut ?? ""}
          placeholder="12.345.678-9"
        />
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
            Tipo de documento
          </span>
          <select
            name="tipo_documento"
            defaultValue={profile.tipo_documento ?? "factura"}
            className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
          >
            <option value="factura">Factura electrónica</option>
            <option value="boleta">Boleta electrónica</option>
          </select>
        </label>
      </div>

      <Field
        label="Razón social"
        name="razon_social"
        required
        defaultValue={profile.razon_social ?? ""}
        placeholder="Agrícola Los Alerces SpA"
      />
      <Field
        label="Giro"
        name="giro"
        defaultValue={profile.giro ?? ""}
        placeholder="Producción de leche"
      />

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <Field
          label="Dirección de facturación"
          name="direccion_facturacion"
          defaultValue={profile.direccion_facturacion ?? ""}
          placeholder="Calle y número"
        />
        <Field
          label="Comuna"
          name="comuna"
          defaultValue={profile.comuna ?? ""}
          placeholder="Osorno"
        />
      </div>

      <Field
        label="Correo para recibir la factura"
        name="email_facturacion"
        type="email"
        defaultValue={profile.email_facturacion ?? ""}
        placeholder="pagos@empresa.cl"
      />

      {state?.error && (
        <p className="rounded-md border border-alert/30 bg-alert-tint px-3 py-2 text-sm text-alert">
          {state.error}
        </p>
      )}
      {state && "ok" in state && state.ok && (
        <p className="rounded-md border border-ok/30 bg-ok-tint px-3 py-2 text-sm text-ok">
          Datos de facturación guardados.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mono w-full rounded-lg bg-petrol py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {pending ? "Guardando…" : "Guardar datos"}
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
