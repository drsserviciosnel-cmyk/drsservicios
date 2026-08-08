import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/Shell";
import { fmtDate, fmtCLP } from "@/lib/format";
import type { Factura } from "@/lib/types";

type FacturaRow = Factura & {
  ticket?: { folio: number; title: string } | null;
  cliente?: { full_name: string | null } | null;
};

export default async function FacturasPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("facturas")
    .select(
      `*, ticket:tickets!facturas_ticket_id_fkey(folio,title), cliente:profiles!facturas_client_id_fkey(full_name)`,
    )
    .order("created_at", { ascending: false });
  const facturas = (data ?? []) as FacturaRow[];

  const borradores = facturas.filter((f) => f.estado === "borrador").length;
  const emitidas = facturas.filter((f) => f.estado === "emitida");
  const totalEmitido = emitidas.reduce((s, f) => s + f.total, 0);

  return (
    <Shell profile={profile}>
      <div className="mb-6">
        <p className="eyebrow">Despacho</p>
        <h1 className="display mt-1 text-2xl text-ink">Facturas</h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Documentos" value={facturas.length} />
        <Stat label="Borradores" value={borradores} tone="signal" />
        <Stat label="Total emitido" value={fmtCLP(totalEmitido)} tone="ok" />
      </div>

      {facturas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong bg-paper p-12 text-center text-ink-soft">
          Aún no hay facturas. Se generan al cerrar un ticket con su monto.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-paper shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-milk">
              <tr className="mono text-left text-[0.66rem] uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 text-right font-medium">Neto</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {facturas.map((f) => (
                <tr key={f.id}>
                  <td className="mono px-4 py-3 text-ink-soft">
                    #{String(f.ticket?.folio ?? 0).padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {f.razon_social ?? f.cliente?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {f.tipo_documento === "boleta" ? "Boleta" : "Factura"}
                    {f.folio ? ` · ${f.folio}` : ""}
                  </td>
                  <td className="mono px-4 py-3 text-right text-ink-soft">
                    {fmtCLP(f.monto_neto)}
                  </td>
                  <td className="mono px-4 py-3 text-right font-semibold text-ink">
                    {fmtCLP(f.total)}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={f.estado} tieneRut={!!f.rut} />
                  </td>
                  <td className="mono px-4 py-3 text-xs text-ink-faint">
                    {fmtDate(f.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}

function EstadoBadge({ estado, tieneRut }: { estado: string; tieneRut: boolean }) {
  const map: Record<string, string> = {
    borrador: "bg-milk text-ink-soft border-line-strong",
    emitida: "bg-ok-tint text-ok border-ok/30",
    anulada: "bg-alert-tint text-alert border-alert/30",
    error: "bg-alert-tint text-alert border-alert/30",
  };
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span
        className={`mono w-fit rounded-md border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide ${map[estado] ?? map.borrador}`}
      >
        {estado === "borrador" ? "Borrador" : estado}
      </span>
      {estado === "borrador" && !tieneRut && (
        <span className="text-[0.6rem] text-signal">falta RUT</span>
      )}
    </span>
  );
}

function Stat({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  tone?: "ink" | "signal" | "ok";
}) {
  const color =
    tone === "signal" ? "text-signal" : tone === "ok" ? "text-ok" : "text-ink";
  return (
    <div className="rounded-xl border border-line bg-paper p-4 shadow-sm">
      <p className="eyebrow">{label}</p>
      <p className={`display mt-2 text-2xl tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
