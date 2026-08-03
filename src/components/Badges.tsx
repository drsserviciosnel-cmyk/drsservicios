import {
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/format";
import type { TicketPriority, TicketStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`mono inline-flex items-center rounded-md border px-2 py-0.5 text-[0.7rem] font-medium uppercase tracking-wide ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const emergency = priority === "emergencia";
  return (
    <span
      className={`mono inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.7rem] font-medium uppercase tracking-wide ${PRIORITY_COLOR[priority]}`}
    >
      {emergency && (
        <span className="pulse-alert inline-block h-1.5 w-1.5 rounded-full bg-alert" />
      )}
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
