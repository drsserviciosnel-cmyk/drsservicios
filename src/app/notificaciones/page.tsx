import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { markAllRead } from "@/lib/actions/notifications";
import { Shell } from "@/components/Shell";
import { since } from "@/lib/format";
import type { Notification } from "@/lib/types";

export default async function NotificacionesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const items = (data ?? []) as Notification[];
  const hasUnread = items.some((n) => !n.read);

  return (
    <Shell profile={profile}>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="eyebrow">Avisos</p>
          <h1 className="display mt-1 text-2xl text-ink">Notificaciones</h1>
        </div>
        {hasUnread && (
          <form action={markAllRead}>
            <button className="mono rounded-lg border border-line-strong px-3 py-2 text-xs uppercase tracking-wide text-ink-soft transition hover:bg-paper">
              Marcar todas leídas
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong bg-paper p-12 text-center text-ink-soft">
          No tienes notificaciones.
        </p>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper">
          {items.map((n) => {
            const row = (
              <div
                className={`flex items-start gap-3 px-4 py-3.5 transition ${
                  n.read ? "" : "bg-petrol-tint/40"
                } ${n.link ? "hover:bg-milk" : ""}`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 flex-none rounded-full ${
                    n.read ? "bg-line-strong" : "bg-signal"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{n.title}</p>
                  {n.body && <p className="text-sm text-ink-soft">{n.body}</p>}
                </div>
                <span className="mono flex-none text-[0.68rem] uppercase tracking-wide text-ink-faint">
                  {since(n.created_at)}
                </span>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block">
                {row}
              </Link>
            ) : (
              <div key={n.id}>{row}</div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
