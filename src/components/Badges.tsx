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
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLOR[priority]}`}
    >
      {priority === "emergencia" && "🚨 "}
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
