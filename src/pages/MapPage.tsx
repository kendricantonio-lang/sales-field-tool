import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { listStores, updateStore, type StoreRecord } from '../lib/db';
import { geocodeAddress, sleep, GEOCODE_DELAY_MS } from '../lib/geocode';
import { pinStoreActive } from '../lib/activeStore';

// Leaflet's default marker icon references relative image paths that break
// under Vite's bundling — point it at the actual imported asset URLs instead.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LA_CENTER: L.LatLngTuple = [34.05, -118.24];

function hasCoords(store: StoreRecord): boolean {
  return !!(store.data.lat && store.data.lng && !Number.isNaN(Number(store.data.lat)) && !Number.isNaN(Number(store.data.lng)));
}

export function MapPage() {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const navigate = useNavigate();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      setStores(await listStores());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  }

  // Initialize the map once.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { center: LA_CENTER, zoom: 9, fadeAnimation: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    map.on('click', () => setSelectedId(null));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Keep markers in sync with the store list.
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const placed = stores.filter(hasCoords);

    for (const store of placed) {
      const marker = L.marker([Number(store.data.lat), Number(store.data.lng)]);
      marker.on('click', () => setSelectedId(store.id));
      marker.addTo(layer);
    }

    if (placed.length > 0) {
      const bounds = L.latLngBounds(placed.map((s) => [Number(s.data.lat), Number(s.data.lng)] as L.LatLngTuple));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }, [stores]);

  const unplacedStores = stores.filter((s) => !hasCoords(s) && (s.data.address || s.data.city));
  const selectedStore = stores.find((s) => s.id === selectedId) ?? null;

  function handleViewInStores(id: string) {
    pinStoreActive(id);
    navigate('/stores');
  }

  async function handleLocateStores() {
    if (unplacedStores.length === 0) return;
    setGeocoding(true);
    setProgress({ done: 0, total: unplacedStores.length });
    for (let i = 0; i < unplacedStores.length; i++) {
      const store = unplacedStores[i];
      const result = await geocodeAddress(store.data.address ?? '', store.data.city ?? '');
      if (result) {
        try {
          await updateStore(store.id, { ...store.data, lat: String(result.lat), lng: String(result.lng) });
        } catch {
          // Continue with the rest even if one save fails.
        }
      }
      setProgress({ done: i + 1, total: unplacedStores.length });
      if (i < unplacedStores.length - 1) await sleep(GEOCODE_DELAY_MS);
    }
    setGeocoding(false);
    setProgress(null);
    await refresh();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Store Map</h2>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && stores.length === 0 && <p>No stores yet.</p>}

      <div ref={mapContainerRef} className="leaflet-map-container" />

      {selectedStore && (
        <div className="panel">
          <div className="panel-title-row">
            <h3>Store #{selectedStore.data.storeNumber}</h3>
            <button className="link-button" onClick={() => setSelectedId(null)}>
              Close
            </button>
          </div>
          {selectedStore.data.address && <p className="record-field">{selectedStore.data.address}</p>}
          {selectedStore.data.city && <p className="record-field">{selectedStore.data.city}</p>}
          <div className="panel-actions">
            <button onClick={() => handleViewInStores(selectedStore.id)}>View in Stores →</button>
          </div>
        </div>
      )}

      {unplacedStores.length > 0 && (
        <div className="panel">
          <p className="muted">
            {unplacedStores.length} store{unplacedStores.length === 1 ? '' : 's'} with an address but no map location
            yet.
          </p>
          <div className="panel-actions">
            <button onClick={handleLocateStores} disabled={geocoding}>
              {geocoding && progress ? `Locating ${progress.done}/${progress.total}…` : 'Locate Stores'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
