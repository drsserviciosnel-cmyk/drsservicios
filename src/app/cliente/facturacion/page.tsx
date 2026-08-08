import { requireRole } from "@/lib/auth";
import { Shell } from "@/components/Shell";
import { FacturacionForm } from "@/components/FacturacionForm";

export default async function FacturacionPage() {
  const profile = await requireRole("cliente");
  const completo = !!(profile.rut && profile.razon_social);

  return (
    <Shell profile={profile}>
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Cliente</p>
        <h1 className="display mt-1 text-2xl text-ink">Datos de facturación</h1>
        <p className="mt-2 mb-6 text-sm text-ink-soft">
          Estos datos se usarán para emitir la factura o boleta electrónica cuando se
          cierre un trabajo.
        </p>

        {!completo && (
          <div className="mb-5 rounded-lg border border-signal/30 bg-signal-tint px-4 py-3 text-sm text-signal">
            Completa tus datos de facturación para poder emitir documentos.
          </div>
        )}

        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <FacturacionForm profile={profile} />
        </div>
      </div>
    </Shell>
  );
}
