"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { geocode } from "@/lib/geo/geocode";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

/** Registra una lechería/instalación y geocodifica su dirección. */
export async function createInstalacion(_prev: unknown, formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!name || !address)
    return { error: "El nombre y la dirección son obligatorios." };

  const geo = await geocode(address);

  const { error } = await supabase.from("instalaciones").insert({
    client_id: userId,
    name,
    address,
    notes,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/cliente/instalaciones");
  revalidatePath("/cliente/nuevo");
  return {
    ok: true,
    located: !!geo,
    label: geo?.label ?? null,
  };
}

/** Elimina una instalación. */
export async function deleteInstalacion(formData: FormData) {
  const { supabase } = await currentUserId();
  const id = String(formData.get("id"));
  await supabase.from("instalaciones").delete().eq("id", id);
  revalidatePath("/cliente/instalaciones");
  revalidatePath("/cliente/nuevo");
}
