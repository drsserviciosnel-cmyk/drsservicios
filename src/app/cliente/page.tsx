import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/Shell";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import {
  TicketPipeline,
  EvidenceThumb,
  TicketMetrics,
  FacturaResumen,
} from "@/components/ticket-ui";
import {
  StatTile,
  ChartCard,
  Donut,
  AreaTrend,
  CHART,
} from "@/components/charts";
import { fmtDate, since, STATUS_SPINE } from "@/lib/format";
import { avgMinutes, humanMin, ticketsPerDay, xTick } from "@/lib/analytics";
import type { Factura, Ticket } from "@/lib/types";

export default async function ClientePage() {
  const profile = await requireRole("cliente");
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: facturasRaw } = await supabase.from("facturas").select("*");

  const list = (tickets ?? []) as Ticket[];
  const facturasPorTicket = new Map<string, Factura>();
  for (const f of (facturasRaw ?? []) as Factura[])
    facturasPorTicket.set(f.ticket_id, f);

  // Resumen
  const abiertos = list.filter(
    (t) => !["resuelto", "cerrado", "cancelado"].includes(t.status),
  ).length;
  const resueltos = list.filter((t) =>
    ["resuelto", "cerrado"].includes(t.status),
  ).length;
  const tRespuesta = avgMinutes(list, "created_at", "accepted_at");

  const enCurso = list.filter((t) =>
    ["nuevo", "asignado", "aceptado", "en_camino", "en_proceso"].includes(t.status),
  ).length;
  const cerrados = list.filter((t) => t.status === "cerrado").length;
  const cancelados = list.filter((t) => t.status === "cancelado").length;
  const soloResueltos = list.filter((t) => t.status === "resuelto").length;
  const donut = [
    { label: "En curso", value: enCurso, color: CHART.petrol },
    { label: "Resueltos", value: soloResueltos, color: CHART.ok },
    { label: "Cerrados", value: cerrados, color: CHART.cerrado },
    { label: "Cancelados", value: cancelados, color: CHART.alert },
  ];
  const perDay = ticketsPerDay(list, 30);

  return (
    <Shell profile={profile}>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="eyebrow">Cliente</p>
          <h1 className="display mt-1 text-2xl text-ink">Mis tickets</h1>
        </div>
        <Link
          href="/cliente/nuevo"
          className="mono rounded-lg bg-petrol px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep"
        >
          + Nuevo ticket
        </Link>
      </div>

      {list.length > 0 && (
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Mis tickets" value={list.length} />
            <StatTile label="Abiertos" value={abiertos} tone="signal" />
            <StatTile label="Resueltos" value={resueltos} tone="ok" />
            <StatTile label="Resp. promedio" value={humanMin(tRespuesta)} />
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
            <ChartCard title="Estado de mis tickets">
              <Donut segments={donut} centerValue={list.length} centerLabel="tickets" />
            </ChartCard>
            <ChartCard title="Mi actividad · últimos 30 días">
              <AreaTrend data={perDay} fmtX={xTick} />
            </ChartCard>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <Empty />
      ) : (
        <h2 className="eyebrow mb-3">Detalle</h2>
      )}
      {list.length > 0 && (
        <div className="space-y-3">
          {list.map((t) => (
            <article
              key={t.id}
              className="relative overflow-hidden rounded-xl border border-line bg-paper shadow-sm"
            >
              <span
                className={`absolute left-0 top-0 h-full w-1 ${STATUS_SPINE[t.status]}`}
              />
              <div className="p-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="mono text-xs text-ink-faint">
                      #{String(t.folio).padStart(4, "0")}
                    </span>
                    <h3 className="font-semibold text-ink">{t.title}</h3>
                    {t.site_name && (
                      <p className="text-sm text-ink-soft">{t.site_name}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                </div>

                {t.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                    {t.description}
                  </p>
                )}

                <div className="mt-4">
                  <TicketPipeline status={t.status} labels />
                </div>

                <TicketMetrics t={t} />

                {t.evidence_url && (
                  <EvidenceThumb url={t.evidence_url} note={t.resolution_note} />
                )}

                {facturasPorTicket.has(t.id) && (
                  <FacturaResumen factura={facturasPorTicket.get(t.id)!} />
                )}

                <div className="mono mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-3 text-xs text-ink-faint">
                  <span>Creado {fmtDate(t.created_at)}</span>
                  <span>Antigüedad {since(t.created_at)}</span>
                  {t.location_lat != null && (
                    <a
                      href={`https://www.google.com/maps?q=${t.location_lat},${t.location_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-petrol hover:underline"
                    >
                      ↳ Ubicación
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}

function Empty() {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-paper p-12 text-center">
      <p className="text-ink-soft">Aún no has reportado ninguna emergencia.</p>
      <Link
        href="/cliente/nuevo"
        className="mono mt-4 inline-block rounded-lg bg-petrol px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep"
      >
        Crear mi primer ticket
      </Link>
    </div>
  );
}
