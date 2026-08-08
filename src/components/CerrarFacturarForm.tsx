"use client";

import { useActionState, useState } from "react";
import { cerrarYFacturar } from "@/lib/actions/facturas";
import { fmtCLP, calcIva } from "@/lib/format";

export function CerrarFacturarForm({ ticketId }: { ticketId: string }) {
  const [open, setOpen] = useState(false);
  const [neto, setNeto] = useState<number>(0);
  const [state, formAction, pending] = useActionState(
    cerrarYFacturar,
    undefined,
  );

  const { iva, total } = calcIva(neto || 0);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mono rounded-lg bg-petrol px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep"
      >
        Cerrar y facturar
      </button>
    );
  }

  return (
    <form action={formAction} className="w-full rounded-lg border border-line bg-milk p-3">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <p className="mono mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        Cierre y factura
      </p>

      <label className="block">
        <span className="mb-1 block text-xs text-ink-soft">Monto neto del trabajo (CLP)</span>
        <input
          name="monto_neto"
          type="number"
          min="1"
          required
          value={neto || ""}
          onChange={(e) => setNeto(parseInt(e.target.value || "0", 10))}
          placeholder="Ej: 120000"
          className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
        />
      </label>

      <div className="mono mt-3 space-y-1 border-t border-line pt-2 text-xs">
        <div className="flex justify-between text-ink-soft">
          <span>Neto</span><span>{fmtCLP(neto || 0)}</span>
        </div>
        <div className="flex justify-between text-ink-soft">
          <span>IVA 19%</span><span>{fmtCLP(iva)}</span>
        </div>
        <div className="flex justify-between font-semibold text-ink">
          <span>Total</span><span>{fmtCLP(total)}</span>
        </div>
      </div>

      {state?.error && (
        <p className="mt-2 text-sm text-alert">{state.error}</p>
      )}
      {state && "warn" in state && state.warn && (
        <p className="mt-2 rounded-md border border-signal/30 bg-signal-tint px-2 py-1.5 text-xs text-signal">
          {state.warn}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="mono flex-1 rounded-lg bg-petrol px-3 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep disabled:opacity-60"
        >
          {pending ? "Cerrando…" : "Cerrar y generar factura"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="mono rounded-lg border border-line-strong px-3 py-2 text-xs uppercase tracking-wide text-ink-soft transition hover:bg-paper disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
