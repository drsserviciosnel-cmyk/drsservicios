"use client";

import { useState, useTransition } from "react";
import { departToTicket } from "@/lib/actions/tickets";

export function DepartForm({ ticketId }: { ticketId: string }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const busy = locating || pending;

  function depart(withLocation: boolean) {
    setError(null);
    const submit = (lat?: number, lng?: number) => {
      const fd = new FormData();
      fd.set("ticket_id", ticketId);
      if (lat != null && lng != null) {
        fd.set("tech_lat", String(lat));
        fd.set("tech_lng", String(lng));
      }
      startTransition(() => departToTicket(fd));
    };

    if (!withLocation || !("geolocation" in navigator)) {
      submit();
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        submit(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        setError(
          "No pudimos tomar tu ubicación. Puedes continuar sin distancia.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  return (
    <div>
      <button
        onClick={() => depart(true)}
        disabled={busy}
        className="mono w-full rounded-lg bg-petrol px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep disabled:opacity-60 sm:w-auto"
      >
        {locating
          ? "Tomando ubicación…"
          : pending
            ? "Registrando…"
            : "Voy en camino →"}
      </button>
      {error && (
        <div className="mt-2 text-sm text-signal">
          {error}{" "}
          <button
            onClick={() => depart(false)}
            className="font-medium text-petrol underline"
          >
            Continuar sin ubicación
          </button>
        </div>
      )}
    </div>
  );
}
