import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRouteGeometry } from "@/lib/geo/routes";
import { Shell } from "@/components/Shell";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import {
  TicketPipeline,
  StageTimeline,
  TicketMetrics,
  EvidenceThumb,
  FacturaResumen,
} from "@/components/ticket-ui";
import { RouteMap } from "@/components/RouteMap";
import { fmtKm, fmtDuration, mapsRoute } from "@/lib/format";
import type { Factura, TicketWithRelations } from "@/lib/types";

export default async function TicketDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("tickets")
    .select(
      `*, client:profiles!tickets_client_id_fkey(full_name,phone), technician:profiles!tickets_assigned_technician_id_fkey(full_name,phone)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const t = data as TicketWithRelations;

  const { data: facturaRaw } = await supabase
    .from("facturas")
    .select("*")
    .eq("ticket_id", id)
    .maybeSingle();
  const factura = facturaRaw as Factura | null;

  const hasPlant = t.location_lat != null && t.location_lng != null;
  const hasTech = t.tech_start_lat != null && t.tech_start_lng != null;
  let route: [number, number][] | null = null;
  if (hasPlant && hasTech) {
    route = await getRouteGeometry(
      { lat: t.tech_start_lat!, lng: t.tech_start_lng! },
      { lat: t.location_lat!, lng: t.location_lng! },
    );
  }

  const back =
    profile.role === "admin"
      ? "/admin"
      : profile.role === "tecnico"
        ? "/tecnico"
        : "/cliente";

  return (
    <Shell profile={profile}>
      <div className="mb-4">
        <Link href={back} className="mono text-xs uppercase tracking-wide text-petrol hover:underline">
          ← Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="mono text-xs text-ink-faint">
              #{String(t.folio).padStart(4, "0")}
            </span>
            <h1 className="display text-2xl text-ink">{t.title}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {t.site_name ?? "—"}
              {t.location_address ? ` · ${t.location_address}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={t.status} />
            <PriorityBadge priority={t.priority} />
          </div>
        </div>
        <div className="mt-5">
          <TicketPipeline status={t.status} labels />
        </div>
        <TicketMetrics t={t} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Ubicación y ruta */}
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <p className="eyebrow mb-1">Ubicación y ruta</p>
          <h2 className="display mb-3 text-lg text-ink">Georreferencia</h2>
          {hasPlant ? (
            <>
              <RouteMap
                plant={{ lat: t.location_lat!, lng: t.location_lng! }}
                techStart={hasTech ? { lat: t.tech_start_lat!, lng: t.tech_start_lng! } : null}
                route={route}
              />
              <div className="mono mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-petrol" /> Lechería
                </span>
                {hasTech && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-signal bg-white" />{" "}
                    Salida del técnico
                  </span>
                )}
                {t.drive_distance_km != null && (
                  <span className="text-ink-soft">
                    Ruta {fmtKm(t.drive_distance_km)}
                  </span>
                )}
                {t.drive_eta_seconds != null && (
                  <span className="text-petrol">
                    Llegada ~{fmtDuration(t.drive_eta_seconds)}
                  </span>
                )}
                {hasTech && (
                  <a
                    href={mapsRoute(
                      t.tech_start_lat!,
                      t.tech_start_lng!,
                      t.location_lat!,
                      t.location_lng!,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-petrol hover:underline"
                  >
                    ↳ Abrir en Google Maps
                  </a>
                )}
              </div>
              <p className="mt-3 rounded-lg border border-petrol/20 bg-petrol-tint px-3 py-2 text-xs text-petrol-deep">
                Ticket <b>georreferenciado</b>: la ubicación proviene de la dirección
                registrada de la lechería.{" "}
                {hasTech
                  ? "El técnico fue dirigido por ruta directa al sitio, cronometrando el traslado."
                  : "La ruta del técnico aparecerá cuando marque “Voy en camino”."}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              Este ticket no tiene ubicación registrada.
            </p>
          )}
        </div>

        {/* Tiempos de respuesta */}
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <p className="eyebrow mb-1">Tiempos de respuesta</p>
          <h2 className="display mb-4 text-lg text-ink">Línea de tiempo</h2>
          <StageTimeline t={t} />
        </div>
      </div>

      {/* Detalle del incidente */}
      <div className="mt-4 rounded-2xl border border-line bg-paper p-5 shadow-sm">
        <p className="eyebrow mb-3">Detalle del incidente</p>
        {t.description ? (
          <p className="text-sm text-ink">{t.description}</p>
        ) : (
          <p className="text-sm text-ink-faint">Sin descripción.</p>
        )}
        <div className="mt-4 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
          <Field label="Cliente" value={t.client?.full_name} sub={t.client?.phone} />
          <Field
            label="Técnico asignado"
            value={t.technician?.full_name ?? "Sin asignar"}
            sub={t.technician?.phone}
          />
        </div>
      </div>

      {t.evidence_url && (
        <div className="mt-4 rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <p className="eyebrow mb-1">Evidencia del trabajo</p>
          <EvidenceThumb url={t.evidence_url} note={t.resolution_note} />
        </div>
      )}

      {factura && (
        <div className="mt-4 rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <p className="eyebrow mb-1">Facturación</p>
          <FacturaResumen factura={factura} />
        </div>
      )}
    </Shell>
  );
}

function Field({
  label,
  value,
  sub,
}: {
  label: string;
  value?: string | null;
  sub?: string | null;
}) {
  return (
    <div>
      <p className="mono text-[0.65rem] uppercase tracking-wide text-ink-faint">
        {label}
      </p>
      <p className="font-medium text-ink">{value ?? "—"}</p>
      {sub && <p className="mono text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}
