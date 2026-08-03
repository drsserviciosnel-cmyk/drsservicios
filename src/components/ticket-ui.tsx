import { PIPELINE, PIPELINE_SHORT, STATUS_LABEL } from "@/lib/format";
import type { TicketStatus } from "@/lib/types";

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
