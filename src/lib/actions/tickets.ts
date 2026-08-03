"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
  if (!title) return { error: "El título es obligatorio." };

  const lat = formData.get("location_lat");
  const lng = formData.get("location_lng");

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      client_id: userId,
      site_name: String(formData.get("site_name") || "").trim() || null,
      title,
      description: String(formData.get("description") || "").trim() || null,
      priority: (String(formData.get("priority") || "alta") as TicketPriority),
      location_lat: lat ? Number(lat) : null,
      location_lng: lng ? Number(lng) : null,
      location_address: String(formData.get("location_address") || "").trim() || null,
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
