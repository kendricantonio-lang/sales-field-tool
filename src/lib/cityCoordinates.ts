// Approximate city-center coordinates for the Store Map visual. This is a
// rough illustrative reference, not real geocoding — it's meant to show
// roughly where stores cluster, not pinpoint exact addresses.
//
// To support a new city, add it here (lowercase key). Stores whose city
// isn't listed are simply left off the map and called out in a note.
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'newport beach': { lat: 33.62, lng: -117.93 },
  'laguna beach': { lat: 33.54, lng: -117.78 },
  montecito: { lat: 34.44, lng: -119.63 },
  'marina del rey': { lat: 33.98, lng: -118.45 },
  'hermosa beach': { lat: 33.86, lng: -118.4 },
  'san diego': { lat: 32.72, lng: -117.16 },
  'mission viejo': { lat: 33.6, lng: -117.67 },
  'culver city': { lat: 34.02, lng: -118.4 },
  burbank: { lat: 34.18, lng: -118.31 },
  'thousand oaks': { lat: 34.17, lng: -118.84 },
  'rancho santa margarita': { lat: 33.64, lng: -117.6 },
  'west hills': { lat: 34.2, lng: -118.65 },
  'south pasadena': { lat: 34.12, lng: -118.15 },
  'los angeles': { lat: 34.05, lng: -118.24 },
  'santa monica': { lat: 34.02, lng: -118.49 },
  'rolling hills estates': { lat: 33.78, lng: -118.35 },
  'la jolla': { lat: 32.85, lng: -117.27 },
  irvine: { lat: 33.68, lng: -117.83 },
  'laguna niguel': { lat: 33.52, lng: -117.71 },
  carlsbad: { lat: 33.16, lng: -117.35 },
  'west hollywood': { lat: 34.09, lng: -118.36 },
  'seal beach': { lat: 33.74, lng: -118.1 },
  malibu: { lat: 34.04, lng: -118.68 },
  'sherman oaks': { lat: 34.15, lng: -118.45 },
  'beverly hills': { lat: 34.07, lng: -118.4 },
  'san clemente': { lat: 33.43, lng: -117.61 },
};

/** A few well-known anchor points shown as faint labels for orientation, even without a store there. */
export const REFERENCE_LABELS: { name: string; lat: number; lng: number }[] = [
  { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
  { name: 'San Diego', lat: 32.72, lng: -117.16 },
  { name: 'Santa Barbara', lat: 34.42, lng: -119.7 },
];

export function lookupCity(city: string): { lat: number; lng: number } | null {
  return CITY_COORDINATES[city.trim().toLowerCase()] ?? null;
}
