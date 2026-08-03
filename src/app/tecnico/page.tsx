import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { advanceStatus } from "@/lib/actions/tickets";
import { Shell } from "@/components/Shell";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { fmtDate, since } from "@/lib/format";
import type { TicketStatus, TicketWithRelations } from "@/lib/types";

const NEXT: Partial<Record<TicketStatus, { to: TicketStatus; label: string }>> = {
  asignado: { to: "aceptado", label: "Aceptar" },
  aceptado: { to: "en_camino", label: "Voy en camino" },
  en_camino: { to: "en_proceso", label: "Iniciar trabajo" },
  en_proceso: { to: "resuelto", label: "Marcar resuelto" },
};

export default async function TecnicoPage() {
  const profile = await requireRole("tecnico");
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(
      `*, client:profiles!tickets_client_id_fkey(id,full_name,phone)`,
    )
    .order("created_at", { ascending: false });
  const tickets = (data ?? []) as TicketWithRelations[];

  const active = tickets.filter(
    (t) => !["resuelto", "cerrado", "cancelado"].includes(t.status),
  );
  const done = tickets.filter((t) =>
    ["resuelto", "cerrado"].includes(t.status),
  );

  return (
    <Shell profile={profile}>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Mis asignaciones</h1>

      {active.length === 0 && done.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No tienes tickets asignados por ahora.
        </p>
      )}

      <div className="space-y-3">
        {active.map((t) => {
          const next = NEXT[t.status];
          return (
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
                    {t.client?.full_name}
                    {t.client?.phone ? ` · ${t.client.phone}` : ""}
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

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
                <span>Creado: {fmtDate(t.created_at)}</span>
                <span>Espera: {since(t.created_at)}</span>
                {t.location_lat != null && (
                  <a
                    href={`https://www.google.com/maps?q=${t.location_lat},${t.location_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    📍 Cómo llegar
                  </a>
                )}
              </div>

              {next && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <form action={advanceStatus}>
                    <input type="hidden" name="ticket_id" value={t.id} />
                    <input type="hidden" name="to_status" value={next.to} />
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      {next.label}
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase text-slate-400">
            Historial
          </h2>
          <div className="space-y-2">
            {done.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <span className="text-slate-700">
                  #{t.folio} · {t.title}
                </span>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}
