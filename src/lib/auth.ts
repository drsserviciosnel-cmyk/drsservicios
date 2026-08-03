import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

/** Devuelve el perfil autenticado o redirige a /login. */
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  return profile as Profile;
}

/** Exige un rol específico; si no coincide, manda al dashboard. */
export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== role) redirect("/dashboard");
  return profile;
}
