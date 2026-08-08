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

export type TipoDocumento = "factura" | "boleta";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  rut: string | null;
  razon_social: string | null;
  giro: string | null;
  direccion_facturacion: string | null;
  comuna: string | null;
  tipo_documento: TipoDocumento | null;
  email_facturacion: string | null;
  created_at: string;
}

export interface Instalacion {
  id: string;
  client_id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  folio: number;
  client_id: string;
  site_id: string | null;
  site_name: string | null;
  title: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  assigned_technician_id: string | null;
  evidence_url: string | null;
  resolution_note: string | null;
  tech_start_lat: number | null;
  tech_start_lng: number | null;
  distance_km: number | null;
  drive_eta_seconds: number | null;
  drive_distance_km: number | null;
  route_provider: string | null;
  created_at: string;
  assigned_at: string | null;
  accepted_at: string | null;
  en_camino_at: string | null;
  started_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  ticket_id: string | null;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface TicketWithRelations extends Ticket {
  client?: Pick<Profile, "id" | "full_name" | "phone"> | null;
  technician?: Pick<Profile, "id" | "full_name" | "phone"> | null;
}
