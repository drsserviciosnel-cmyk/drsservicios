import type { TicketPriority, TicketStatus } from "./types";

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  emergencia: "Emergencia",
};

export const PRIORITY_COLOR: Record<TicketPriority, string> = {
  baja: "bg-milk text-ink-soft border-line-strong",
  media: "bg-petrol-tint text-petrol border-petrol/25",
  alta: "bg-signal-tint text-signal border-signal/30",
  emergencia: "bg-alert-tint text-alert border-alert/40",
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
  nuevo: "bg-milk text-ink-soft border-line-strong",
  asignado: "bg-petrol-tint text-petrol border-petrol/25",
  aceptado: "bg-petrol-tint text-petrol border-petrol/25",
  en_camino: "bg-signal-tint text-signal border-signal/30",
  en_proceso: "bg-signal-tint text-signal border-signal/30",
  resuelto: "bg-ok-tint text-ok border-ok/30",
  cerrado: "bg-milk text-ink-faint border-line",
  cancelado: "bg-alert-tint text-alert border-alert/30",
};

/** Color de la espina lateral de la tarjeta según estado. */
export const STATUS_SPINE: Record<TicketStatus, string> = {
  nuevo: "bg-ink-faint",
  asignado: "bg-petrol",
  aceptado: "bg-petrol",
  en_camino: "bg-signal",
  en_proceso: "bg-signal",
  resuelto: "bg-ok",
  cerrado: "bg-line-strong",
  cancelado: "bg-alert",
};

/** Orden del pipeline de respuesta (firma visual). */
export const PIPELINE: TicketStatus[] = [
  "nuevo",
  "asignado",
  "aceptado",
  "en_camino",
  "en_proceso",
  "resuelto",
];

export const PIPELINE_SHORT: Record<TicketStatus, string> = {
  nuevo: "Nuevo",
  asignado: "Asig.",
  aceptado: "Acep.",
  en_camino: "Camino",
  en_proceso: "Proceso",
  resuelto: "Listo",
  cerrado: "Cerrado",
  cancelado: "Cancel.",
};

export function fmtDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-CL", {
    timeZone: "America/Santiago",
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

/** Distancia en línea recta (Haversine) entre dos puntos, en km. */
export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function fmtKm(km: number | null): string {
  if (km == null) return "—";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/** Monto en pesos chilenos → "$1.234.567". */
export function fmtCLP(n: number | null): string {
  if (n == null) return "—";
  return "$" + Math.round(n).toLocaleString("es-CL");
}

/** IVA (19%) y total a partir del neto. */
export function calcIva(neto: number): { iva: number; total: number } {
  const iva = Math.round(neto * 0.19);
  return { iva, total: neto + iva };
}

/** Duración en segundos → "X min" / "Xh Ym". */
export function fmtDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m`;
}

/** Link de ruta en Google Maps entre origen (técnico) y destino (sitio). */
export function mapsRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=driving`;
}
