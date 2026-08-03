export type UserRole = "cliente" | "admin" | "tecnico";

export type TicketPriority = "baja" | "media" | "alta" | "emergencia";

export type TicketStatus =
  | "nuevo"
  | "asignado"
  | "aceptado"
  | "en_camino"
  | "en_proceso"
  | "resuelto"
  | "cerrado"
  | "cancelado";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  folio: number;
  client_id: string;
  site_name: string | null;
  title: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  assigned_technician_id: string | null;
  created_at: string;
  assigned_at: string | null;
  accepted_at: string | null;
  en_camino_at: string | null;
  started_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
}

export interface TicketWithRelations extends Ticket {
  client?: Pick<Profile, "id" | "full_name" | "phone"> | null;
  technician?: Pick<Profile, "id" | "full_name" | "phone"> | null;
}
