import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { assignTicket, advanceStatus } from "@/lib/actions/tickets";
import { Shell } from "@/components/Shell";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { fmtDate, elapsed, since } from "@/lib/format";
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
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Panel de tickets</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={tickets.length} />
        <Stat label="Abiertos" value={open} />
        <Stat label="Emergencias" value={emergencias} tone="red" />
        <Stat
          label="Asignación prom."
          value={avgAssign != null ? `${avgAssign} min` : "—"}
        />
      </div>

      {tickets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No hay tickets todavía.
        </p>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">#{t.folio}</p>
                  <h3 className="font-medium text-slate-900">{t.title}</h3>
                  <p className="text-sm text-slate-500">
                    {t.site_name ? `${t.site_name} · ` : ""}
                    Cliente: {t.client?.full_name ?? "—"}
                    {t.client?.phone ? ` (${t.client.phone})` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                </div>
              </div>

              {t.description && (
                <p className="mt-2 text-sm text-slate-600">{t.description}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                <span>Creado: {fmtDate(t.created_at)}</span>
                <span>Espera: {since(t.created_at)}</span>
                {t.assigned_at && (
                  <span>Asignado en: {elapsed(t.created_at, t.assigned_at)}</span>
                )}
                {t.resolved_at && (
                  <span className="text-emerald-700">
                    Resuelto en: {elapsed(t.created_at, t.resolved_at)}
                  </span>
                )}
                {t.location_lat != null && (
                  <a
                    href={`https://www.google.com/maps?q=${t.location_lat},${t.location_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    📍 Ubicación
                  </a>
                )}
              </div>

              {/* Asignación */}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="text-sm text-slate-600">
                  Técnico:{" "}
                  <strong className="text-slate-900">
                    {t.technician?.full_name ?? "sin asignar"}
                  </strong>
                </span>
                {!["resuelto", "cerrado", "cancelado"].includes(t.status) && (
                  <form action={assignTicket} className="flex items-center gap-2">
                    <input type="hidden" name="ticket_id" value={t.id} />
                    <select
                      name="technician_id"
                      defaultValue={t.assigned_technician_id ?? ""}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
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
                    <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                      Asignar
                    </button>
                  </form>
                )}
                {t.status === "resuelto" && (
                  <form action={advanceStatus}>
                    <input type="hidden" name="ticket_id" value={t.id} />
                    <input type="hidden" name="to_status" value="cerrado" />
                    <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
                      Cerrar ticket
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

function Stat({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  tone?: "slate" | "red";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          tone === "red" ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
