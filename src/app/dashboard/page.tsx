import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";

export default async function Dashboard() {
  const profile = await requireProfile();
  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "tecnico") redirect("/tecnico");
  redirect("/cliente");
}
