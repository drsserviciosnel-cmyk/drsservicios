import "server-only";

export interface DriveRoute {
  seconds: number;
  km: number;
  provider: "google" | "osrm";
}

type Pt = { lat: number; lng: number };

async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms = 6000,
): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fn(ctrl.signal);
  } finally {
    clearTimeout(id);
  }
}

/** Google Routes API (Compute Routes) — requiere GOOGLE_MAPS_API_KEY. */
async function google(from: Pt, to: Pt): Promise<DriveRoute | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  try {
    return await withTimeout(async (signal) => {
      const res = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          signal,
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
          },
          body: JSON.stringify({
            origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
            destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE",
          }),
        },
      );
      if (!res.ok) return null;
      const data = await res.json();
      const route = data?.routes?.[0];
      if (!route) return null;
      const seconds = Number(String(route.duration ?? "").replace("s", ""));
      const meters = Number(route.distanceMeters ?? 0);
      if (!seconds) return null;
      return { seconds, km: meters / 1000, provider: "google" };
    });
  } catch {
    return null;
  }
}

/** OSRM público (sin key) — fallback para tener ETA real de inmediato. */
async function osrm(from: Pt, to: Pt): Promise<DriveRoute | null> {
  try {
    return await withTimeout(async (signal) => {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
      const res = await fetch(url, { signal });
      if (!res.ok) return null;
      const data = await res.json();
      const route = data?.routes?.[0];
      if (data?.code !== "Ok" || !route) return null;
      return {
        seconds: Math.round(route.duration),
        km: route.distance / 1000,
        provider: "osrm",
      };
    });
  } catch {
    return null;
  }
}

/**
 * Ruta de manejo real: intenta Google (si hay key), si no OSRM.
 * Devuelve null si ambos fallan (el llamador cae a distancia en línea recta).
 */
export async function getDrivingRoute(
  from: Pt,
  to: Pt,
): Promise<DriveRoute | null> {
  return (await google(from, to)) ?? (await osrm(from, to));
}
