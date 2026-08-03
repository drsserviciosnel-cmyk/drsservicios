import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { advanceStatus } from "@/lib/actions/tickets";
import { Shell } from "@/components/Shell";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { TicketPipeline } from "@/components/ticket-ui";
import { fmtDate, since, STATUS_SPINE } from "@/lib/format";
import type { TicketStatus, TicketWithRelations } from "@/lib/types";

const NEXT: Partial<Record<TicketStatus, { to: TicketStatus; label: string }>> = {
  asignado: { to: "aceptado", label: "Aceptar ticket" },
  aceptado: { to: "en_camino", label: "Voy en camino" },
  en_camino: { to: "en_proceso", label: "Iniciar trabajo" },
  en_proceso: { to: "resuelto", label: "Marcar resuelto" },
};

export default async function TecnicoPage() {
  const profile = await requireRole("tecnico");
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(`*, client:profiles!tickets_client_id_fkey(id,full_name,phone)`)
    .order("created_at", { ascending: false });
  const tickets = (data ?? []) as TicketWithRelations[];

  const active = tickets.filter(
    (t) => !["resuelto", "cerrado", "cancelado"].includes(t.status),
  );
  const done = tickets.filter((t) => ["resuelto", "cerrado"].includes(t.status));

  return (
    <Shell profile={profile}>
      <div className="mb-6">
        <p className="eyebrow">Técnico</p>
        <h1 className="display mt-1 text-2xl text-ink">Mis asignaciones</h1>
      </div>

      {active.length === 0 && done.length === 0 && (
        <p className="rounded-xl border border-dashed border-line-strong bg-paper p-12 text-center text-ink-soft">
          No tienes tickets asignados por ahora.
        </p>
      )}

      <div className="space-y-3">
        {active.map((t) => {
          const next = NEXT[t.status];
          return (
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
                      {t.client?.full_name}
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

                <div className="mono mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-ink-faint">
                  <span>Creado {fmtDate(t.created_at)}</span>
                  <span>Espera {since(t.created_at)}</span>
                  {t.location_lat != null && (
                    <a
                      href={`https://www.google.com/maps?q=${t.location_lat},${t.location_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-petrol hover:underline"
                    >
                      ↳ Cómo llegar
                    </a>
                  )}
                </div>

                {next && (
                  <div className="mt-4 border-t border-line pt-4">
                    <form action={advanceStatus}>
                      <input type="hidden" name="ticket_id" value={t.id} />
                      <input type="hidden" name="to_status" value={next.to} />
                      <button className="mono w-full rounded-lg bg-petrol px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep sm:w-auto">
                        {next.label} →
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {done.length > 0 && (
        <>
          <p className="eyebrow mt-10 mb-3">Historial</p>
          <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper">
            {done.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="text-ink-soft">
                  <span className="mono text-ink-faint">
                    #{String(t.folio).padStart(4, "0")}
                  </span>{" "}
                  · {t.title}
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
