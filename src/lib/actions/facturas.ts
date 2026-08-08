"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calcIva, fmtCLP } from "@/lib/format";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

/**
 * Admin: cierra el ticket con el monto neto del trabajo y genera el
 * borrador de factura (con snapshot de los datos fiscales del cliente).
 */
export async function cerrarYFacturar(_prev: unknown, formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const ticketId = String(formData.get("ticket_id"));
  const monto = parseInt(String(formData.get("monto_neto") || ""), 10);

  if (!monto || monto <= 0)
    return { error: "Ingresa un monto neto válido (mayor a 0)." };

  // 1) Cerrar el ticket con el monto
  await supabase
    .from("tickets")
    .update({
      monto_neto: monto,
      status: "cerrado",
      closed_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  await supabase.from("ticket_events").insert({
    ticket_id: ticketId,
    actor_id: userId,
    to_status: "cerrado",
    note: `Cerrado · neto ${fmtCLP(monto)}`,
  });

  // 2) Datos fiscales del cliente del ticket
  const { data: ticket } = await supabase
    .from("tickets")
    .select("client_id")
    .eq("id", ticketId)
    .single();
  const { data: cli } = await supabase
    .from("profiles")
    .select("rut, razon_social, giro, direccion_facturacion, comuna, tipo_documento")
    .eq("id", ticket!.client_id)
    .single();

  // 3) Crear borrador de factura (si no existe ya)
  const { data: existing } = await supabase
    .from("facturas")
    .select("id")
    .eq("ticket_id", ticketId)
    .limit(1);

  let warn: string | null = null;
  if (!existing || existing.length === 0) {
    const { iva, total } = calcIva(monto);
    await supabase.from("facturas").insert({
      ticket_id: ticketId,
      client_id: ticket!.client_id,
      tipo_documento: cli?.tipo_documento ?? "factura",
      monto_neto: monto,
      iva,
      total,
      estado: "borrador",
      rut: cli?.rut ?? null,
      razon_social: cli?.razon_social ?? null,
      giro: cli?.giro ?? null,
      direccion_facturacion: cli?.direccion_facturacion ?? null,
      comuna: cli?.comuna ?? null,
    });
    if (!cli?.rut)
      warn =
        "Borrador creado, pero el cliente aún no tiene datos de facturación (RUT). Debe completarlos antes de emitir al SII.";
  }

  revalidatePath("/admin");
  revalidatePath("/admin/facturas");
  revalidatePath("/cliente");
  return { ok: true, warn };
}
