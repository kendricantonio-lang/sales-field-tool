// Free geocoding via OpenStreetMap's Nominatim service — no API key, but a
// strict usage policy (nominatim.org/release-docs/latest/api/Usage_Policy/):
// max ~1 request/second, no bulk/systematic querying. Fine for geocoding a
// few dozen store addresses one at a time as they're added or on-demand via
// the "Locate Stores" button — never call this in a tight loop without the
// delay in GEOCODE_DELAY_MS below.

export interface GeoResult {
  lat: number;
  lng: number;
}

export const GEOCODE_DELAY_MS = 1100;

export async function geocodeAddress(address: string, city: string): Promise<GeoResult | null> {
  const query = [address, city, 'CA'].filter((part) => part && part.trim()).join(', ');
  if (!query) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) return null;
    const { lat, lon } = results[0];
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lon);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return null;
    return { lat: parsedLat, lng: parsedLng };
  } catch {
    return null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
