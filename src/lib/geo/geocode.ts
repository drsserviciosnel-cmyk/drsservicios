import "server-only";

export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
}

/**
 * Convierte una dirección en coordenadas usando el geocoder de OpenRouteService
 * (Pelias). Usa la misma ORS_API_KEY. Sesga a Chile. Devuelve null si falla.
 */
export async function geocode(address: string): Promise<GeocodeResult | null> {
  const key = process.env.ORS_API_KEY;
  if (!key || !address.trim()) return null;

  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 6000);
  try {
    const url =
      "https://api.openrouteservice.org/geocode/search?" +
      new URLSearchParams({
        text: address,
        "boundary.country": "CL",
        size: "1",
      });
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Authorization: key },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const f = data?.features?.[0];
    const coords = f?.geometry?.coordinates;
    if (!coords || coords.length < 2) return null;
    return {
      lng: coords[0],
      lat: coords[1],
      label: f?.properties?.label ?? address,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}
