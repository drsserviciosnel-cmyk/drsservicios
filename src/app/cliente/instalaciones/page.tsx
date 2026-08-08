import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteInstalacion } from "@/lib/actions/instalaciones";
import { Shell } from "@/components/Shell";
import { InstalacionForm } from "@/components/InstalacionForm";
import type { Instalacion } from "@/lib/types";

export default async function InstalacionesPage() {
  const profile = await requireRole("cliente");
  const supabase = await createClient();
  const { data } = await supabase
    .from("instalaciones")
    .select("*")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as Instalacion[];

  return (
    <Shell profile={profile}>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="eyebrow">Cliente</p>
          <h1 className="display mt-1 text-2xl text-ink">Mis lecherías</h1>
        </div>
        <Link href="/cliente/nuevo" className="mono text-xs uppercase tracking-wide text-petrol hover:underline">
          Crear ticket →
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
        {/* Formulario */}
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <p className="eyebrow">Registrar</p>
          <h2 className="display mt-1 mb-1 text-lg text-ink">Nueva lechería</h2>
          <p className="mb-4 text-sm text-ink-soft">
            La dirección se convierte en coordenadas para calcular la distancia y el
            tiempo del técnico.
          </p>
          <InstalacionForm />
        </div>

        {/* Lista */}
        <div>
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong bg-paper p-10 text-center text-ink-soft">
              Aún no registras ninguna lechería.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((i) => (
                <article
                  key={i.id}
                  className="rounded-xl border border-line bg-paper p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-ink">{i.name}</h3>
                      <p className="text-sm text-ink-soft">{i.address}</p>
                      {i.notes && (
                        <p className="mt-1 text-xs text-ink-faint">{i.notes}</p>
                      )}
                    </div>
                    <form action={deleteInstalacion}>
                      <input type="hidden" name="id" value={i.id} />
                      <button
                        className="mono rounded-md border border-line-strong px-2 py-1 text-[0.68rem] uppercase tracking-wide text-ink-soft transition hover:bg-milk"
                        aria-label={`Eliminar ${i.name}`}
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                  <div className="mono mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3 text-xs">
                    {i.lat != null ? (
                      <>
                        <span className="text-ok">● Ubicada</span>
                        <a
                          href={`https://www.google.com/maps?q=${i.lat},${i.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-petrol hover:underline"
                        >
                          ↳ Ver en mapa
                        </a>
                      </>
                    ) : (
                      <span className="text-signal">
                        ⚠ Sin ubicación — revisa la dirección
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
