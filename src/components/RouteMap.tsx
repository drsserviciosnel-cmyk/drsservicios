"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type Pt = { lat: number; lng: number };

export function RouteMap({
  plant,
  techStart,
  route,
}: {
  plant: Pt;
  techStart?: Pt | null;
  route?: [number, number][] | null;
}) {
  const el = useRef<HTMLDivElement>(null);
  const created = useRef(false);

  useEffect(() => {
    if (created.current || !el.current) return;
    created.current = true;
    let map: import("leaflet").Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      map = L.map(el.current!, {
        scrollWheelZoom: false,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const pts: [number, number][] = [[plant.lat, plant.lng]];

      // Ruta de manejo
      if (route && route.length > 1) {
        L.polyline(route, { color: "#b8720a", weight: 5, opacity: 0.85 }).addTo(map);
        pts.push(...route);
      } else if (techStart) {
        L.polyline(
          [
            [techStart.lat, techStart.lng],
            [plant.lat, plant.lng],
          ],
          { color: "#b8720a", weight: 3, opacity: 0.6, dashArray: "6 8" },
        ).addTo(map);
      }

      // Lechería (destino)
      L.circleMarker([plant.lat, plant.lng], {
        radius: 9,
        color: "#07403c",
        fillColor: "#0c5c57",
        fillOpacity: 1,
        weight: 3,
      })
        .addTo(map)
        .bindPopup("Lechería (destino)");

      // Salida del técnico
      if (techStart) {
        L.circleMarker([techStart.lat, techStart.lng], {
          radius: 8,
          color: "#b8720a",
          fillColor: "#ffffff",
          fillOpacity: 1,
          weight: 3,
        })
          .addTo(map)
          .bindPopup("Salida del técnico");
        pts.push([techStart.lat, techStart.lng]);
      }

      if (pts.length > 1) {
        map.fitBounds(pts, { padding: [30, 30] });
      } else {
        map.setView([plant.lat, plant.lng], 14);
      }
      // Recalcular tamaño tras el montaje
      setTimeout(() => map?.invalidateSize(), 60);
    })();

    return () => {
      if (map) {
        map.remove();
        map = null;
      }
      created.current = false;
    };
  }, [plant, techStart, route]);

  return (
    <div
      ref={el}
      className="h-72 w-full overflow-hidden rounded-xl border border-line"
      role="img"
      aria-label="Mapa de la ruta hacia la lechería"
    />
  );
}
