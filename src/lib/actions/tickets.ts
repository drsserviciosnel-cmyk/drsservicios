"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { haversineKm } from "@/lib/format";
import { getDrivingRoute } from "@/lib/geo/routes";
import type { TicketPriority, TicketStatus } from "@/lib/types";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

/** Cliente crea una orden de trabajo. */
export async function createTicket(_prev: unknown, formData: FormData) {
  const { supabase, userId } = await currentUserId();

  const title = String(formData.get("title") || "").trim();
  const siteId = String(formData.get("site_id") || "");
  if (!siteId) return { error: "Selecciona la instalación (lechería)." };
  if (!title) return { error: "El título es obligatorio." };

  // La ubicación proviene de la instalación registrada, no del dispositivo del cliente.
  const { data: inst } = await supabase
    .from("instalaciones")
    .select("id, name, address, lat, lng")
    .eq("id", siteId)
    .single();
  if (!inst) return { error: "Instalación no válida." };

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      client_id: userId,
      site_id: inst.id,
      site_name: inst.name,
      title,
      description: String(formData.get("description") || "").trim() || null,
      priority: (String(formData.get("priority") || "alta") as TicketPriority),
      location_lat: inst.lat,
      location_lng: inst.lng,
      location_address: inst.address,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("ticket_events").insert({
    ticket_id: data.id,
    actor_id: userId,
    from_status: null,
    to_status: "nuevo",
    note: "Ticket creado por el cliente",
  });

  revalidatePath("/cliente");
  revalidatePath("/admin");
  redirect("/cliente");
}

/** Admin asigna un ticket a un técnico. */
export async function assignTicket(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const ticketId = String(formData.get("ticket_id"));
  const technicianId = String(formData.get("technician_id"));
  if (!technicianId) return;

  await supabase
    .from("tickets")
    .update({
      assigned_technician_id: technicianId,
      status: "asignado",
      assigned_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  await supabase.from("ticket_events").insert({
    ticket_id: ticketId,
    actor_id: userId,
    to_status: "asignado",
    note: "Asignado por administrador",
  });

  revalidatePath("/admin");
  revalidatePath("/tecnico");
}

const STAMP: Partial<Record<TicketStatus, string>> = {
  aceptado: "accepted_at",
  en_camino: "en_camino_at",
  en_proceso: "started_at",
  resuelto: "resolved_at",
  cerrado: "closed_at",
};

/** Técnico/Admin avanza el estado del ticket. */
export async function advanceStatus(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const ticketId = String(formData.get("ticket_id"));
  const to = String(formData.get("to_status")) as TicketStatus;
  const note = String(formData.get("note") || "").trim() || null;

  const patch: Record<string, unknown> = { status: to };
  const stampCol = STAMP[to];
  if (stampCol) patch[stampCol] = new Date().toISOString();

  await supabase.from("tickets").update(patch).eq("id", ticketId);
  await supabase.from("ticket_events").insert({
    ticket_id: ticketId,
    actor_id: userId,
    to_status: to,
    note,
  });

  revalidatePath("/tecnico");
  revalidatePath("/admin");
}

/**
 * Técnico marca "voy en camino": guarda su ubicación de partida y calcula
 * la distancia en línea recta al sitio del ticket.
 */
export async function departToTicket(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const ticketId = String(formData.get("ticket_id"));
  const techLat = formData.get("tech_lat");
  const techLng = formData.get("tech_lng");

  const { data: ticket } = await supabase
    .from("tickets")
    .select("location_lat, location_lng")
    .eq("id", ticketId)
    .single();

  let distance: number | null = null;
  let driveEta: number | null = null;
  let driveKm: number | null = null;
  let provider: string | null = null;
  const tLat = techLat ? Number(techLat) : null;
  const tLng = techLng ? Number(techLng) : null;

  if (
    tLat != null &&
    tLng != null &&
    ticket?.location_lat != null &&
    ticket?.location_lng != null
  ) {
    distance =
      Math.round(
        haversineKm(tLat, tLng, ticket.location_lat, ticket.location_lng) * 10,
      ) / 10;

    // Ruta de manejo real (Google Routes API, o OSRM como fallback)
    const route = await getDrivingRoute(
      { lat: tLat, lng: tLng },
      { lat: ticket.location_lat, lng: ticket.location_lng },
    );
    if (route) {
      driveEta = route.seconds;
      driveKm = Math.round(route.km * 10) / 10;
      provider = route.provider;
    }
  }

  await supabase
    .from("tickets")
    .update({
      status: "en_camino",
      en_camino_at: new Date().toISOString(),
      tech_start_lat: tLat,
      tech_start_lng: tLng,
      distance_km: distance,
      drive_eta_seconds: driveEta,
      drive_distance_km: driveKm,
      route_provider: provider,
    })
    .eq("id", ticketId);

  const etaMin = driveEta != null ? Math.round(driveEta / 60) : null;
  await supabase.from("ticket_events").insert({
    ticket_id: ticketId,
    actor_id: userId,
    to_status: "en_camino",
    note:
      etaMin != null
        ? `En camino · ETA ~${etaMin} min (${driveKm} km)`
        : distance != null
          ? `En camino · ~${distance} km al sitio`
          : "En camino",
  });

  revalidatePath("/tecnico");
  revalidatePath("/admin");
}

/** Técnico resuelve el ticket adjuntando foto de evidencia. */
export async function resolveTicket(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const ticketId = String(formData.get("ticket_id"));
  const evidenceUrl = String(formData.get("evidence_url") || "").trim() || null;
  const note = String(formData.get("resolution_note") || "").trim() || null;

  await supabase
    .from("tickets")
    .update({
      status: "resuelto",
      resolved_at: new Date().toISOString(),
      evidence_url: evidenceUrl,
      resolution_note: note,
    })
    .eq("id", ticketId);

  await supabase.from("ticket_events").insert({
    ticket_id: ticketId,
    actor_id: userId,
    to_status: "resuelto",
    note: note ?? "Resuelto con evidencia",
  });

  revalidatePath("/tecnico");
  revalidatePath("/admin");
  revalidatePath("/cliente");
}

/** Admin cambia el rol de un usuario (cliente <-> tecnico <-> admin). */
export async function setRole(formData: FormData) {
  const { supabase } = await currentUserId();
  const profileId = String(formData.get("profile_id"));
  const role = String(formData.get("role"));
  await supabase.from("profiles").update({ role }).eq("id", profileId);
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}
