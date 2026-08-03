"use client";

import { useActionState, useEffect, useState } from "react";
import { createTicket } from "@/lib/actions/tickets";

type Coords = { lat: number; lng: number; acc?: number };

export function NewTicketForm() {
  const [state, formAction, pending] = useActionState(createTicket, undefined);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "locating" | "ok" | "error"
  >("idle");
  const [geoMsg, setGeoMsg] = useState("");

  function locate() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("error");
      setGeoMsg("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy,
        });
        setGeoStatus("ok");
      },
      (err) => {
        setGeoStatus("error");
        setGeoMsg(
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado. Escribe la referencia manualmente."
            : "No se pudo obtener la ubicación.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  useEffect(() => {
    locate();
  }, []);

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Lechería / Sitio"
        name="site_name"
        placeholder="Ej: Lechería San Pedro"
      />
      <Field
        label="Título del problema"
        name="title"
        required
        placeholder="Ej: Falla en equipo de refrigeración"
      />

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
          Descripción
        </span>
        <textarea
          name="description"
          rows={4}
          placeholder="Describe la emergencia con el mayor detalle posible…"
          className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
          Prioridad
        </span>
        <select
          name="priority"
          defaultValue="alta"
          className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="emergencia">Emergencia</option>
        </select>
      </label>

      <Field
        label="Dirección / Referencia"
        name="location_address"
        placeholder="Referencia del lugar (opcional)"
      />

      {/* Geolocalización */}
      <div className="rounded-lg border border-line bg-milk p-3">
        <div className="flex items-center justify-between">
          <span className="mono text-xs font-medium uppercase tracking-wide text-ink-soft">
            Ubicación
          </span>
          <button
            type="button"
            onClick={locate}
            className="mono rounded-md border border-line-strong bg-paper px-2.5 py-1 text-[0.68rem] uppercase tracking-wide text-ink-soft transition hover:bg-milk"
          >
            {geoStatus === "locating" ? "Ubicando…" : "Actualizar"}
          </button>
        </div>
        {geoStatus === "ok" && coords && (
          <p className="mono mt-2 text-xs text-ok">
            ● {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            {coords.acc ? `  ±${Math.round(coords.acc)}m` : ""}
          </p>
        )}
        {geoStatus === "locating" && (
          <p className="mono mt-2 text-xs text-ink-faint">Obteniendo ubicación…</p>
        )}
        {geoStatus === "error" && (
          <p className="mt-2 text-xs text-signal">{geoMsg}</p>
        )}
      </div>

      <input type="hidden" name="location_lat" value={coords?.lat ?? ""} />
      <input type="hidden" name="location_lng" value={coords?.lng ?? ""} />

      {state?.error && (
        <p className="rounded-md border border-alert/30 bg-alert-tint px-3 py-2 text-sm text-alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mono w-full rounded-lg bg-petrol py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep disabled:opacity-60"
      >
        {pending ? "Creando ticket…" : "Crear ticket de soporte"}
      </button>
    </form>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
      />
    </label>
  );
}
