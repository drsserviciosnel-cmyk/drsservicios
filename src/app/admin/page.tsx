import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { assignTicket } from "@/lib/actions/tickets";
import { Shell } from "@/components/Shell";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import {
  TicketPipeline,
  EvidenceThumb,
  TicketMetrics,
  FacturaResumen,
} from "@/components/ticket-ui";
import { CerrarFacturarForm } from "@/components/CerrarFacturarForm";
import {
  AreaTrend,
  BarList,
  STATUS_CHART,
  PRIORITY_CHART,
  CHART,
} from "@/components/charts";
import {
  fmtDate,
  elapsed,
  since,
  STATUS_SPINE,
  STATUS_LABEL,
  PRIORITY_LABEL,
} from "@/lib/format";
import { ticketsPerDay, avgMinutes, xTick, humanMin } from "@/lib/analytics";
import type {
  Factura,
  Profile,
  TicketPriority,
  TicketStatus,
  TicketWithRelations,
} from "@/lib/types";

export default async function AdminPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const { data: ticketsRaw } = await supabase
    .from("tickets")
    .select(
      `*, client:profiles!tickets_client_id_fkey(id,full_name,phone), technician:profiles!tickets_assigned_technician_id_fkey(id,full_name,phone)`,
    )
    .order("created_at", { ascending: false });

  const { data: techsRaw } = await supabase
    .from("profiles")
    .select("id,full_name,phone,role,created_at")
    .eq("role", "tecnico")
    .order("full_name");

  const { data: facturasRaw } = await supabase
    .from("facturas")
    .select("*");

  const tickets = (ticketsRaw ?? []) as TicketWithRelations[];
  const techs = (techsRaw ?? []) as Profile[];
  const facturasPorTicket = new Map<string, Factura>();
  for (const f of (facturasRaw ?? []) as Factura[])
    facturasPorTicket.set(f.ticket_id, f);

  const open = tickets.filter(
    (t) => !["resuelto", "cerrado", "cancelado"].includes(t.status),
  ).length;
  const emergencias = tickets.filter(
    (t) => t.priority === "emergencia" && t.status !== "cerrado",
  ).length;
  const resueltos = tickets.filter((t) =>
    ["resuelto", "cerrado"].includes(t.status),
  ).length;

  const statusOrder: TicketStatus[] = [
    "nuevo", "asignado", "aceptado", "en_camino",
    "en_proceso", "resuelto", "cerrado", "cancelado",
  ];
  const statusItems = statusOrder
    .map((s) => ({
      label: STATUS_LABEL[s],
      value: tickets.filter((t) => t.status === s).length,
      color: STATUS_CHART[s],
    }))
    .filter((i) => i.value > 0);

  const prioOrder: TicketPriority[] = ["emergencia", "alta", "media", "baja"];
  const prioItems = prioOrder
    .map((p) => ({
      label: PRIORITY_LABEL[p],
      value: tickets.filter((t) => t.priority === p).length,
      color: PRIORITY_CHART[p],
    }))
    .filter((i) => i.value > 0);

  const techItems = techs
    .map((tk) => ({
      label: tk.full_name ?? "—",
      value: tickets.filter((t) => t.assigned_technician_id === tk.id).length,
      color: CHART.petrol,
    }))
    .filter((i) => i.value > 0)
    .sort((a, b) => b.value - a.value);

  const perDay = ticketsPerDay(tickets, 30);
  const tRespuesta = avgMinutes(tickets, "created_at", "accepted_at");
  const tTraslado = avgMinutes(tickets, "en_camino_at", "started_at");
  const tResolucion = avgMinutes(tickets, "created_at", "resolved_at");

  return (
    <Shell profile={profile}>
      <div className="mb-6">
        <p className="eyebrow">Despacho</p>
        <h1 className="display mt-1 text-2xl text-ink">Tablero de tickets</h1>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={tickets.length} />
        <Stat label="Abiertos" value={open} tone="signal" />
        <Stat label="Emergencias" value={emergencias} tone="alert" />
        <Stat label="Resueltos" value={resueltos} tone="ok" />
      </div>

      {/* Tendencia (protagonista) */}
      <div className="mb-4 rounded-2xl border border-line bg-paper p-5 shadow-sm">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <p className="eyebrow">Volumen de tickets</p>
            <h2 className="display text-lg text-ink">Últimos 30 días</h2>
          </div>
          <span className="mono text-xs text-ink-faint">
            {tickets.length} en total
          </span>
        </div>
        <AreaTrend data={perDay} fmtX={xTick} />
      </div>

      {/* Distribuciones */}
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <ChartCard title="Por estado">
          <BarList items={statusItems} />
        </ChartCard>
        <ChartCard title="Por prioridad">
          <BarList items={prioItems} />
        </ChartCard>
        <ChartCard title="Tickets por técnico">
          {techItems.length > 0 ? (
            <BarList items={techItems} />
          ) : (
            <p className="text-sm text-ink-faint">Sin asignaciones aún.</p>
          )}
        </ChartCard>
      </div>

      {/* Tiempos promedio */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <Stat label="Resp. promedio" value={humanMin(tRespuesta)} tone="ink" />
        <Stat label="Traslado prom." value={humanMin(tTraslado)} tone="signal" />
        <Stat label="Resolución prom." value={humanMin(tResolucion)} tone="ok" />
      </div>

      {tickets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong bg-paper p-12 text-center text-ink-soft">
          No hay tickets todavía.
        </p>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <article
              key={t.id}
              className="relative overflow-hidden rounded-xl border border-line bg-paper shadow-sm"
            >
              <span
                className={`absolute left-0 top-0 h-full w-1 ${STATUS_SPINE[t.status]}`}
              />
              <div className="p-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/ticket/${t.id}`} className="group block">
                    <span className="mono text-xs text-ink-faint">
                      #{String(t.folio).padStart(4, "0")}
                    </span>
                    <h3 className="font-semibold text-ink group-hover:text-petrol group-hover:underline">
                      {t.title}
                    </h3>
                    <p className="text-sm text-ink-soft">
                      {t.site_name ? `${t.site_name} · ` : ""}
                      {t.client?.full_name ?? "—"}
                      {t.client?.phone ? ` · ${t.client.phone}` : ""}
                    </p>
                  </Link>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                </div>

                {t.description && (
                  <p className="mt-2 text-sm text-ink-soft">{t.description}</p>
                )}

                <div className="mt-4">
                  <TicketPipeline status={t.status} labels />
                </div>

                <TicketMetrics t={t} />

                <div className="mono mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-faint">
                  <span>Creado {fmtDate(t.created_at)}</span>
                  <span>Espera {since(t.created_at)}</span>
                  {t.assigned_at && (
                    <span>Asignado en {elapsed(t.created_at, t.assigned_at)}</span>
                  )}
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

                {t.evidence_url && (
                  <EvidenceThumb url={t.evidence_url} note={t.resolution_note} />
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <span className="mono text-xs uppercase tracking-wide text-ink-faint">
                    Técnico:
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {t.technician?.full_name ?? "sin asignar"}
                  </span>
                  <span className="grow" />
                  {!["resuelto", "cerrado", "cancelado"].includes(t.status) && (
                    <form action={assignTicket} className="flex items-center gap-2">
                      <input type="hidden" name="ticket_id" value={t.id} />
                      <select
                        name="technician_id"
                        defaultValue={t.assigned_technician_id ?? ""}
                        className="rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-sm text-ink outline-none focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
                      >
                        <option value="" disabled>
                          Elegir técnico…
                        </option>
                        {techs.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.full_name}
                          </option>
                        ))}
                      </select>
                      <button className="mono rounded-lg bg-petrol px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep">
                        {t.assigned_technician_id ? "Reasignar" : "Asignar"}
                      </button>
                    </form>
                  )}
                  {t.status === "resuelto" && (
                    <CerrarFacturarForm ticketId={t.id} />
                  )}
                </div>

                {facturasPorTicket.has(t.id) && (
                  <FacturaResumen factura={facturasPorTicket.get(t.id)!} />
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}

function Stat({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  tone?: "ink" | "alert" | "signal" | "ok";
}) {
  const valueColor =
    tone === "alert"
      ? "text-alert"
      : tone === "signal"
        ? "text-signal"
        : tone === "ok"
          ? "text-ok"
          : "text-ink";
  return (
    <div className="rounded-xl border border-line bg-paper p-4 shadow-sm">
      <p className="eyebrow">{label}</p>
      <p className={`display mt-2 text-3xl tabular-nums ${valueColor}`}>{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
      <p className="eyebrow mb-3">{title}</p>
      {children}
    </div>
  );
}
