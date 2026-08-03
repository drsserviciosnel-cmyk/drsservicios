import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { assignTicket, advanceStatus } from "@/lib/actions/tickets";
import { Shell } from "@/components/Shell";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { TicketPipeline } from "@/components/ticket-ui";
import { fmtDate, elapsed, since, STATUS_SPINE } from "@/lib/format";
import type { Profile, TicketWithRelations } from "@/lib/types";

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

  const tickets = (ticketsRaw ?? []) as TicketWithRelations[];
  const techs = (techsRaw ?? []) as Profile[];

  const open = tickets.filter(
    (t) => !["resuelto", "cerrado", "cancelado"].includes(t.status),
  ).length;
  const emergencias = tickets.filter(
    (t) => t.priority === "emergencia" && t.status !== "cerrado",
  ).length;
  const assignTimes = tickets
    .filter((t) => t.assigned_at)
    .map((t) => new Date(t.assigned_at!).getTime() - new Date(t.created_at).getTime());
  const avgAssign =
    assignTimes.length > 0
      ? Math.round(assignTimes.reduce((a, b) => a + b, 0) / assignTimes.length / 60000)
      : null;

  return (
    <Shell profile={profile}>
      <div className="mb-6">
        <p className="eyebrow">Despacho</p>
        <h1 className="display mt-1 text-2xl text-ink">Tablero de tickets</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={tickets.length} />
        <Stat label="Abiertos" value={open} />
        <Stat label="Emergencias" value={emergencias} tone="alert" />
        <Stat
          label="Asignación prom."
          value={avgAssign != null ? `${avgAssign}m` : "—"}
          tone="signal"
        />
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
                  <div>
                    <span className="mono text-xs text-ink-faint">
                      #{String(t.folio).padStart(4, "0")}
                    </span>
                    <h3 className="font-semibold text-ink">{t.title}</h3>
                    <p className="text-sm text-ink-soft">
                      {t.site_name ? `${t.site_name} · ` : ""}
                      {t.client?.full_name ?? "—"}
                      {t.client?.phone ? ` · ${t.client.phone}` : ""}
                    </p>
                  </div>
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

                <div className="mono mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-faint">
                  <span>Creado {fmtDate(t.created_at)}</span>
                  <span>Espera {since(t.created_at)}</span>
                  {t.assigned_at && (
                    <span>Asignado en {elapsed(t.created_at, t.assigned_at)}</span>
                  )}
                  {t.resolved_at && (
                    <span className="text-ok">
                      Resuelto en {elapsed(t.created_at, t.resolved_at)}
                    </span>
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
                    <form action={advanceStatus}>
                      <input type="hidden" name="ticket_id" value={t.id} />
                      <input type="hidden" name="to_status" value="cerrado" />
                      <button className="mono rounded-lg border border-line-strong px-3 py-1.5 text-xs uppercase tracking-wide text-ink-soft transition hover:bg-milk">
                        Cerrar ticket
                      </button>
                    </form>
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

function Stat({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  tone?: "ink" | "alert" | "signal";
}) {
  const valueColor =
    tone === "alert" ? "text-alert" : tone === "signal" ? "text-signal" : "text-ink";
  return (
    <div className="rounded-xl border border-line bg-paper p-4 shadow-sm">
      <p className="eyebrow">{label}</p>
      <p className={`display mt-2 text-3xl tabular-nums ${valueColor}`}>{value}</p>
    </div>
  );
}
