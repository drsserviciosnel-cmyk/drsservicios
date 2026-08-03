import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Shell } from "@/components/Shell";
import { NewTicketForm } from "@/components/NewTicketForm";

export default async function NuevoTicket() {
  const profile = await requireRole("cliente");
  return (
    <Shell profile={profile}>
      <div className="mx-auto max-w-lg">
        <div className="mb-4">
          <Link href="/cliente" className="text-sm text-blue-600 hover:underline">
            ← Volver a mis tickets
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-xl font-semibold text-slate-900">
            Nuevo ticket de soporte
          </h1>
          <p className="mb-5 text-sm text-slate-500">
            Reporta tu emergencia. Capturamos tu ubicación para medir el tiempo de
            respuesta.
          </p>
          <NewTicketForm />
        </div>
      </div>
    </Shell>
  );
}
