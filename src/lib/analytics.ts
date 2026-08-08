import type { Ticket } from "@/lib/types";

const TZ = "America/Santiago";
const dayKey = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD

/** Cuenta tickets por día en los últimos `days` días (rellena ceros). */
export function ticketsPerDay(
  tickets: Ticket[],
  days = 30,
): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const t of tickets) {
    const k = dayKey(t.created_at);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const out: { label: string; value: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 864e5);
    const k = d.toLocaleDateString("en-CA", { timeZone: TZ });
    out.push({ label: k, value: counts.get(k) ?? 0 });
  }
  return out;
}

/** Promedio en minutos del tramo entre dos marcas de tiempo. */
export function avgMinutes(
  tickets: Ticket[],
  fromKey: keyof Ticket,
  toKey: keyof Ticket,
): number | null {
  const diffs: number[] = [];
  for (const t of tickets) {
    const a = t[fromKey] as string | null;
    const b = t[toKey] as string | null;
    if (a && b) {
      const ms = new Date(b).getTime() - new Date(a).getTime();
      if (ms >= 0) diffs.push(ms / 60000);
    }
  }
  if (diffs.length === 0) return null;
  return Math.round(diffs.reduce((s, x) => s + x, 0) / diffs.length);
}

/** Etiqueta corta "d/m" para el eje X (solo en ~5 posiciones). */
export function xTick(label: string, i: number, n: number): string | null {
  const every = Math.max(1, Math.round(n / 5));
  if (i !== 0 && i !== n - 1 && i % every !== 0) return null;
  const [, m, d] = label.split("-");
  return `${parseInt(d, 10)}/${parseInt(m, 10)}`;
}

/** Minutos → texto compacto "45m" / "3h 20m" / "2d". */
export function humanMin(min: number | null): string {
  if (min == null) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ${min % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}
