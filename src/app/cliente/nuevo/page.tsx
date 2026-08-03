import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Shell } from "@/components/Shell";
import { NewTicketForm } from "@/components/NewTicketForm";

export default async function NuevoTicket() {
  const profile = await requireRole("cliente");
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
          <p className="mt-2 mb-6 text-sm text-ink-soft">
            Capturamos tu ubicación para medir el tiempo de respuesta del técnico.
          </p>
          <NewTicketForm />
        </div>
      </div>
    </Shell>
  );
}
