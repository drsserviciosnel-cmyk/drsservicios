import {
  PIPELINE,
  PIPELINE_SHORT,
  STATUS_LABEL,
  elapsed,
  since,
  fmtKm,
  fmtDuration,
  mapsRoute,
} from "@/lib/format";
import type { Ticket, TicketStatus } from "@/lib/types";

/** Distancia técnico→sitio y desglose de tiempos de respuesta. */
export function TicketMetrics({ t }: { t: Ticket }) {
  const hasRoute =
    t.tech_start_lat != null &&
    t.tech_start_lng != null &&
    t.location_lat != null &&
    t.location_lng != null;

  const respuesta = t.accepted_at ? elapsed(t.created_at, t.accepted_at) : null;
  const traslado = t.started_at
    ? elapsed(t.en_camino_at, t.started_at)
    : t.en_camino_at
      ? since(t.en_camino_at)
      : null;
  const total = t.resolved_at ? elapsed(t.created_at, t.resolved_at) : null;

  const chips: { label: string; value: string; tone?: string }[] = [];
  if (t.drive_eta_seconds != null) {
    chips.push({
      label: "ETA auto",
      value: `~${fmtDuration(t.drive_eta_seconds)}`,
      tone: "text-petrol",
    });
    if (t.drive_distance_km != null)
      chips.push({ label: "Manejo", value: fmtKm(t.drive_distance_km) });
  } else if (t.distance_km != null) {
    chips.push({ label: "Distancia", value: `~${fmtKm(t.distance_km)}` });
  }
  if (respuesta) chips.push({ label: "Respuesta", value: respuesta });
  if (traslado)
    chips.push({
      label: t.started_at ? "Traslado" : "En camino",
      value: traslado,
      tone: t.started_at ? undefined : "text-signal",
    });
  if (total) chips.push({ label: "Total", value: total, tone: "text-ok" });

  if (chips.length === 0 && !hasRoute) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <span
          key={c.label}
          className="mono inline-flex items-baseline gap-1 rounded-md border border-line bg-milk px-2 py-1 text-[0.7rem]"
        >
          <span className="uppercase tracking-wide text-ink-faint">
            {c.label}
          </span>
          <span className={`font-semibold ${c.tone ?? "text-ink"}`}>
            {c.value}
          </span>
        </span>
      ))}
      {hasRoute && (
        <a
          href={mapsRoute(
            t.tech_start_lat!,
            t.tech_start_lng!,
            t.location_lat!,
            t.location_lng!,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mono inline-flex items-center gap-1 rounded-md border border-petrol/25 bg-petrol-tint px-2 py-1 text-[0.7rem] font-medium uppercase tracking-wide text-petrol hover:bg-petrol/10"
        >
          ↳ Ruta
        </a>
      )}
    </div>
  );
}

/** Miniatura de la foto de evidencia + nota de cierre. */
export function EvidenceThumb({
  url,
  note,
}: {
  url: string;
  note?: string | null;
}) {
  return (
    <div className="mt-3 flex items-start gap-3 rounded-lg border border-line bg-milk p-2.5">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block flex-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Evidencia del trabajo"
          className="h-14 w-14 rounded-md object-cover ring-1 ring-line-strong"
        />
      </a>
      <div className="min-w-0">
        <p className="mono text-[0.62rem] uppercase tracking-wide text-ink-faint">
          Evidencia
        </p>
        {note ? (
          <p className="text-sm text-ink-soft">{note}</p>
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-petrol hover:underline"
          >
            Ver foto
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Firma visual: la "línea de respuesta" de un ticket.
 * Muestra el avance por las etapas nuevo → asignado → … → resuelto.
 */
export function TicketPipeline({
  status,
  labels = false,
}: {
  status: TicketStatus;
  labels?: boolean;
}) {
  if (status === "cancelado") {
    return (
      <div className="flex items-center gap-2">
        <span className="h-[9px] w-[9px] flex-none rounded-full bg-alert" />
        <span className="eyebrow !text-alert !tracking-[0.14em]">
          Cancelado
        </span>
      </div>
    );
  }

  const cerrado = status === "cerrado";
  const idx = cerrado ? PIPELINE.length : PIPELINE.indexOf(status);

  return (
    <div aria-label={`Etapa: ${STATUS_LABEL[status]}`}>
      <div className="pipe">
        {PIPELINE.map((stage, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <span
                className={`pipe-node ${done ? "done" : ""} ${
                  current ? "current" : ""
                }`}
              />
              {i < PIPELINE.length - 1 && (
                <span className={`pipe-seg ${done ? "done" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
      {labels && (
        <div className="mt-1.5 hidden justify-between sm:flex">
          {PIPELINE.map((stage, i) => (
            <span
              key={stage}
              className={`mono text-[0.6rem] uppercase tracking-wider ${
                i <= idx && !cerrado
                  ? "text-petrol"
                  : cerrado
                    ? "text-petrol"
                    : "text-ink-faint"
              }`}
            >
              {PIPELINE_SHORT[stage]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
