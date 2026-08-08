import type { TicketStatus, TicketPriority } from "@/lib/types";

/* Paleta de gráficos (derivada de los tokens del sistema) */
export const CHART = {
  petrol: "#0c5c57",
  petrolSoft: "#3d817c",
  signal: "#b8720a",
  signalSoft: "#d98a12",
  alert: "#c0311e",
  ok: "#1f7a4d",
  nuevo: "#6b7772",
  cerrado: "#9aa39c",
  ink: "#14201c",
  inkFaint: "#8b978f",
  line: "#dfe3dd",
  lineStrong: "#cdd3cb",
};

export const STATUS_CHART: Record<TicketStatus, string> = {
  nuevo: CHART.nuevo,
  asignado: CHART.petrol,
  aceptado: CHART.petrolSoft,
  en_camino: CHART.signal,
  en_proceso: CHART.signalSoft,
  resuelto: CHART.ok,
  cerrado: CHART.cerrado,
  cancelado: CHART.alert,
};

export const PRIORITY_CHART: Record<TicketPriority, string> = {
  baja: CHART.nuevo,
  media: CHART.petrol,
  alta: CHART.signal,
  emergencia: CHART.alert,
};

/* ---------------- Tile de KPI ---------------- */
export function StatTile({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  tone?: "ink" | "alert" | "signal" | "ok";
}) {
  const color =
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
      <p className={`display mt-2 text-3xl tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

export function ChartCard({
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

/* ---------------- Barras horizontales etiquetadas ---------------- */
export function BarList({
  items,
  fmt = (n: number) => String(n),
}: {
  items: { label: string; value: number; color: string; hint?: string }[];
  fmt?: (n: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm text-ink-soft">{it.label}</span>
            <span className="mono text-sm font-semibold tabular-nums text-ink">
              {fmt(it.value)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-milk">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(2, (it.value / max) * 100)}%`,
                backgroundColor: it.color,
              }}
              title={it.hint ?? `${it.label}: ${fmt(it.value)}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Anillo (donut) con leyenda ---------------- */
export function Donut({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: { label: string; value: number; color: string }[];
  centerValue: string | number;
  centerLabel: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const R = 52;
  const C = 2 * Math.PI * R;
  const gap = 2; // separación entre segmentos (px de circunferencia)
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg
        viewBox="0 0 120 120"
        className="h-32 w-32 flex-none -rotate-90"
        role="img"
        aria-label={`${centerLabel}: ${centerValue}`}
      >
        <circle cx="60" cy="60" r={R} fill="none" stroke={CHART.line} strokeWidth="12" />
        {segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const frac = s.value / total;
            const len = Math.max(0, frac * C - gap);
            const dash = `${len} ${C - len}`;
            const el = (
              <circle
                key={s.label}
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="12"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              >
                <title>{`${s.label}: ${s.value}`}</title>
              </circle>
            );
            offset += frac * C;
            return el;
          })}
      </svg>
      <div className="min-w-0 flex-1">
        <div className="mb-2">
          <span className="display text-2xl text-ink">{centerValue}</span>{" "}
          <span className="text-xs text-ink-faint">{centerLabel}</span>
        </div>
        <ul className="space-y-1">
          {segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 flex-none rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-ink-soft">{s.label}</span>
                <span className="mono ml-auto font-medium tabular-nums text-ink">
                  {s.value}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Tendencia de área (serie temporal) ---------------- */
export function AreaTrend({
  data,
  fmtX,
}: {
  data: { label: string; value: number }[];
  fmtX?: (label: string, i: number, n: number) => string | null;
}) {
  const W = 640;
  const H = 170;
  const padT = 14;
  const padB = 26;
  const padX = 6;
  const innerW = W - padX * 2;
  const innerH = H - padT - padB;
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value));
  const x = (i: number) => padX + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v: number) => padT + innerH * (1 - v / max);

  const linePts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const areaPts = `${padX},${padT + innerH} ${linePts} ${padX + innerW},${padT + innerH}`;
  const grid = [0, 0.5, 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ aspectRatio: `${W} / ${H}` }}
      role="img"
      aria-label="Tickets creados por día"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CHART.petrol} stopOpacity="0.28" />
          <stop offset="100%" stopColor={CHART.petrol} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* grid */}
      {grid.map((g) => (
        <line
          key={g}
          x1={padX}
          x2={padX + innerW}
          y1={padT + innerH * g}
          y2={padT + innerH * g}
          stroke={CHART.line}
          strokeWidth="1"
        />
      ))}

      <polygon points={areaPts} fill="url(#areaFill)" />
      <polyline
        points={linePts}
        fill="none"
        stroke={CHART.petrol}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* endpoint */}
      {n > 0 && (
        <circle cx={x(n - 1)} cy={y(data[n - 1].value)} r="3.5" fill={CHART.petrol} />
      )}

      {/* hit areas + tooltips */}
      {data.map((d, i) => (
        <rect
          key={i}
          x={x(i) - innerW / (2 * Math.max(1, n))}
          y={padT}
          width={innerW / Math.max(1, n)}
          height={innerH}
          fill="transparent"
        >
          <title>{`${d.label}: ${d.value} ticket${d.value === 1 ? "" : "s"}`}</title>
        </rect>
      ))}

      {/* x labels (extremos anclados para no recortar) */}
      {data.map((d, i) => {
        const lbl = fmtX ? fmtX(d.label, i, n) : null;
        if (!lbl) return null;
        const anchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
        const tx = i === 0 ? padX : i === n - 1 ? padX + innerW : x(i);
        return (
          <text
            key={`x${i}`}
            x={tx}
            y={H - 8}
            textAnchor={anchor}
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill={CHART.inkFaint}
          >
            {lbl}
          </text>
        );
      })}
    </svg>
  );
}
