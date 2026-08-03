import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/Shell";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { TicketPipeline } from "@/components/ticket-ui";
import { fmtDate, since, STATUS_SPINE } from "@/lib/format";
import type { Ticket } from "@/lib/types";

export default async function ClientePage() {
  const profile = await requireRole("cliente");
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (tickets ?? []) as Ticket[];

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

      {list.length === 0 ? (
        <Empty />
      ) : (
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
