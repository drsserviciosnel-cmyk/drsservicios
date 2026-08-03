import { PIPELINE, PIPELINE_SHORT, STATUS_LABEL } from "@/lib/format";
import type { TicketStatus } from "@/lib/types";

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
