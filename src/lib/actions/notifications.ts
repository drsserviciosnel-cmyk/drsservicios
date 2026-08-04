"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function client() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return supabase;
}

/** Marca todas las notificaciones del usuario como leídas. */
export async function markAllRead() {
  const supabase = await client();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);
  revalidatePath("/notificaciones");
  revalidatePath("/", "layout");
}
