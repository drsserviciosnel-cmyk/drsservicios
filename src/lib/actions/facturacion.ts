"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validarRut, formatRut } from "@/lib/rut";

/** Guarda los datos de facturación del cliente (perfil). */
export async function updateFacturacion(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rutRaw = String(formData.get("rut") || "").trim();
  const razon = String(formData.get("razon_social") || "").trim();
  const giro = String(formData.get("giro") || "").trim();
  const direccion = String(formData.get("direccion_facturacion") || "").trim();
  const comuna = String(formData.get("comuna") || "").trim();
  const tipo = String(formData.get("tipo_documento") || "factura");
  const email = String(formData.get("email_facturacion") || "").trim();

  if (!rutRaw || !razon)
    return { error: "El RUT y la razón social son obligatorios." };
  if (!validarRut(rutRaw))
    return { error: "El RUT no es válido (revisa el dígito verificador)." };

  const { error } = await supabase
    .from("profiles")
    .update({
      rut: formatRut(rutRaw),
      razon_social: razon,
      giro: giro || null,
      direccion_facturacion: direccion || null,
      comuna: comuna || null,
      tipo_documento: tipo === "boleta" ? "boleta" : "factura",
      email_facturacion: email || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/cliente/facturacion");
  return { ok: true };
}
