import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/Shell";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { fmtDate, since } from "@/lib/format";
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
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Mis tickets</h1>
        <Link
          href="/cliente/nuevo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuevo ticket
        </Link>
      </div>

      {list.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">#{t.folio}</p>
                  <h3 className="font-medium text-slate-900">{t.title}</h3>
                  {t.site_name && (
                    <p className="text-sm text-slate-500">{t.site_name}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                </div>
              </div>
              {t.description && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {t.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>Creado: {fmtDate(t.created_at)}</span>
                <span>Antigüedad: {since(t.created_at)}</span>
                {t.location_lat != null && (
                  <a
                    href={`https://www.google.com/maps?q=${t.location_lat},${t.location_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    📍 Ver ubicación
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

function Empty() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-slate-500">Aún no tienes tickets.</p>
      <Link
        href="/cliente/nuevo"
        className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Crear mi primer ticket
      </Link>
    </div>
  );
}
