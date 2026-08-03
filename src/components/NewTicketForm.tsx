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
            ? "Permiso de ubicación denegado. Puedes escribir la dirección manualmente."
            : "No se pudo obtener la ubicación.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  // Intenta ubicar automáticamente al abrir el formulario.
  useEffect(() => {
    locate();
  }, []);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Lechería / Sitio" name="site_name" placeholder="Ej: Lechería San Pedro" />
      <Field label="Título del problema" name="title" required placeholder="Ej: Falla en equipo de refrigeración" />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Descripción
        </span>
        <textarea
          name="description"
          rows={4}
          placeholder="Describe la emergencia con el mayor detalle posible…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Prioridad
        </span>
        <select
          name="priority"
          defaultValue="alta"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="emergencia">🚨 Emergencia</option>
        </select>
      </label>

      <Field
        label="Dirección / Referencia"
        name="location_address"
        placeholder="Referencia del lugar (opcional)"
      />

      {/* Geolocalización */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">📍 Ubicación</span>
          <button
            type="button"
            onClick={locate}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            {geoStatus === "locating" ? "Ubicando…" : "Actualizar"}
          </button>
        </div>
        {geoStatus === "ok" && coords && (
          <p className="mt-1 text-xs text-emerald-700">
            Ubicación capturada: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            {coords.acc ? ` (±${Math.round(coords.acc)} m)` : ""}
          </p>
        )}
        {geoStatus === "locating" && (
          <p className="mt-1 text-xs text-slate-500">Obteniendo tu ubicación…</p>
        )}
        {geoStatus === "error" && (
          <p className="mt-1 text-xs text-amber-700">{geoMsg}</p>
        )}
      </div>

      <input type="hidden" name="location_lat" value={coords?.lat ?? ""} />
      <input type="hidden" name="location_lng" value={coords?.lng ?? ""} />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
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
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
