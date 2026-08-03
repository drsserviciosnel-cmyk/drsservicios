import type { TicketPriority, TicketStatus } from "./types";

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  emergencia: "Emergencia",
};

export const PRIORITY_COLOR: Record<TicketPriority, string> = {
  baja: "bg-slate-100 text-slate-700 border-slate-200",
  media: "bg-sky-100 text-sky-700 border-sky-200",
  alta: "bg-amber-100 text-amber-800 border-amber-200",
  emergencia: "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_LABEL: Record<TicketStatus, string> = {
  nuevo: "Nuevo",
  asignado: "Asignado",
  aceptado: "Aceptado",
  en_camino: "En camino",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

export const STATUS_COLOR: Record<TicketStatus, string> = {
  nuevo: "bg-violet-100 text-violet-700 border-violet-200",
  asignado: "bg-blue-100 text-blue-700 border-blue-200",
  aceptado: "bg-cyan-100 text-cyan-700 border-cyan-200",
  en_camino: "bg-indigo-100 text-indigo-700 border-indigo-200",
  en_proceso: "bg-amber-100 text-amber-800 border-amber-200",
  resuelto: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cerrado: "bg-slate-100 text-slate-600 border-slate-200",
  cancelado: "bg-rose-100 text-rose-700 border-rose-200",
};

export function fmtDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Diferencia legible entre dos instantes (para tiempos de respuesta). */
export function elapsed(from: string | null, to: string | null): string {
  if (!from || !to) return "—";
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (ms < 0) return "—";
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  if (h < 24) return `${h}h ${rem}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

/** Tiempo transcurrido desde una fecha hasta ahora. */
export function since(from: string | null): string {
  if (!from) return "—";
  return elapsed(from, new Date().toISOString());
}
