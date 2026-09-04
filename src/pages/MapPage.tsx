import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStores, type StoreRecord } from '../lib/db';
import { lookupCity, REFERENCE_LABELS } from '../lib/cityCoordinates';
import { pinStoreActive } from '../lib/activeStore';

// Rough bounding box covering every city currently in CITY_COORDINATES, with
// a little padding. Fixed (not auto-fit) so the map doesn't jump around as
// stores are added — see cityCoordinates.ts to extend coverage.
const LAT_MIN = 32.45;
const LAT_MAX = 34.75;
const LNG_MIN = -119.95;
const LNG_MAX = -116.85;

const VIEW_W = 600;
const VIEW_H = 700;
const PADDING = 40;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = PADDING + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (VIEW_W - 2 * PADDING);
  const y = PADDING + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (VIEW_H - 2 * PADDING);
  return { x, y };
}

interface Plotted {
  store: StoreRecord;
  x: number;
  y: number;
}

export function MapPage() {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listStores()
      .then(setStores)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stores'))
      .finally(() => setLoading(false));
  }, []);

  const cityGroups = new Map<string, StoreRecord[]>();
  for (const store of stores) {
    const city = (store.data.city ?? '').trim().toLowerCase();
    if (!cityGroups.has(city)) cityGroups.set(city, []);
    cityGroups.get(city)!.push(store);
  }

  const plotted: Plotted[] = [];
  const unplacedCount = { current: 0 };

  for (const [city, group] of cityGroups) {
    const coords = lookupCity(city);
    if (!coords) {
      unplacedCount.current += group.length;
      continue;
    }
    const base = project(coords.lat, coords.lng);
    const radius = group.length > 1 ? 13 : 0;
    group.forEach((store, i) => {
      const angle = (i / group.length) * 2 * Math.PI;
      plotted.push({
        store,
        x: base.x + Math.cos(angle) * radius,
        y: base.y + Math.sin(angle) * radius,
      });
    });
  }

  const selected = plotted.find((p) => p.store.id === selectedId) ?? null;

  function handleViewInStores(id: string) {
    pinStoreActive(id);
    navigate('/stores');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Store Map</h2>
      </div>

      <p className="muted map-disclaimer">
        A rough visual of where stores are, not a precise or interactive map — tap a pin for details.
      </p>

      {error && <p className="form-error">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && stores.length === 0 && <p>No stores yet.</p>}

      {!loading && stores.length > 0 && (
        <div className="map-wrap" onClick={() => setSelectedId(null)}>
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="map-svg" role="img" aria-label="Approximate store locations">
            <rect x={0} y={0} width={VIEW_W} height={VIEW_H} className="map-bg" />

            {REFERENCE_LABELS.map((ref) => {
              const { x, y } = project(ref.lat, ref.lng);
              return (
                <text key={ref.name} x={x} y={y - 16} className="map-ref-label">
                  {ref.name}
                </text>
              );
            })}

            {plotted.map(({ store, x, y }) => (
              <circle
                key={store.id}
                cx={x}
                cy={y}
                r={store.id === selectedId ? 10 : 7}
                className={`map-pin${store.id === selectedId ? ' selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(store.id);
                }}
              />
            ))}
          </svg>

          {selected && (
            <div
              className="map-popup"
              style={{
                left: `${(selected.x / VIEW_W) * 100}%`,
                top: `${(selected.y / VIEW_H) * 100}%`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <strong>Store #{selected.store.data.storeNumber}</strong>
              {selected.store.data.address && <div>{selected.store.data.address}</div>}
              {selected.store.data.city && <div>{selected.store.data.city}</div>}
              <button onClick={() => handleViewInStores(selected.store.id)}>View in Stores →</button>
            </div>
          )}
        </div>
      )}

      {unplacedCount.current > 0 && (
        <p className="muted map-note">
          {unplacedCount.current} store{unplacedCount.current === 1 ? '' : 's'} not shown — their city isn't in the
          map's reference list yet.
        </p>
      )}
    </div>
  );
}
