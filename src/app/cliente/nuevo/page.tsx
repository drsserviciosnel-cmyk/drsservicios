import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/Shell";
import { NewTicketForm } from "@/components/NewTicketForm";
import type { Instalacion } from "@/lib/types";

export default async function NuevoTicket() {
  const profile = await requireRole("cliente");
  const supabase = await createClient();
  const { data } = await supabase
    .from("instalaciones")
    .select("*")
    .order("name");
  const instalaciones = (data ?? []) as Instalacion[];

  return (
    <Shell profile={profile}>
      <div className="mx-auto max-w-lg">
        <Link
          href="/cliente"
          className="mono text-xs uppercase tracking-wide text-petrol hover:underline"
        >
          ← Mis tickets
        </Link>
        <div className="mt-3 rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <p className="eyebrow">Reporte de emergencia</p>
          <h1 className="display mt-1 text-2xl text-ink">Nuevo ticket</h1>

          {instalaciones.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-line-strong bg-milk p-6 text-center">
              <p className="text-sm text-ink-soft">
                Primero registra la <b>lechería</b> donde ocurre el problema, con su
                dirección. Así el técnico va al lugar correcto.
              </p>
              <Link
                href="/cliente/instalaciones"
                className="mono mt-4 inline-block rounded-lg bg-petrol px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep"
              >
                Registrar lechería
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-2 mb-6 text-sm text-ink-soft">
                Elige la instalación afectada y describe la emergencia.{" "}
                <Link
                  href="/cliente/instalaciones"
                  className="text-petrol hover:underline"
                >
                  Gestionar lecherías
                </Link>
              </p>
              <NewTicketForm instalaciones={instalaciones} />
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
