/**
 * Interactive eclipse map (MapLibre GL JS + OpenFreeMap vector tiles).
 * The eclipse layers are local GeoJSON files and keep working if the
 * background map cannot be loaded.
 */
import * as maplibregl from 'maplibre-gl';
import type { GeoJSONSource, Map as MLMap, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// The worker is self-contained: ship it as a static asset and point MapLibre to it.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { clientI18n } from './i18n-client.ts';

const BASEMAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';
const TUNISIA_BOUNDS: [[number, number], [number, number]] = [
  [7.4, 30.2],
  [11.7, 37.4],
];

export interface MapOptions {
  container: HTMLElement;
  onPick: (p: { lat: number; lon: number; label?: string; id?: string }) => void;
  onStatus: (message: string | null, kind?: 'error' | 'info') => void;
}

export interface CityFeatureProps {
  id: string;
  name: string;
  kind: 'total' | 'partial';
  duration: string;
  destination: boolean;
}

/** Layer groups toggled by the layer panel. */
export const LAYER_GROUPS: Record<string, string[]> = {
  umbra: ['umbra-fill'],
  central: ['central-line'],
  limits: ['limit-lines'],
  durations: ['duration-lines', 'duration-labels'],
  magnitudes: ['magnitude-lines', 'magnitude-labels'],
  governorates: ['gov-lines'],
  cities: ['city-points', 'city-labels'],
  destinations: ['dest-points'],
};

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function loadBasemap(lang: string): Promise<StyleSpecification | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(BASEMAP_STYLE, { signal: ctrl.signal });
    if (!res.ok) return null;
    const style = (await res.json()) as StyleSpecification;
    // Localize basemap labels: name in the page language, then the local name.
    for (const layer of style.layers) {
      if (layer.type === 'symbol' && layer.layout?.['text-field'] && !layer.id.includes('shield') && !layer.id.includes('oneway')) {
        const field = JSON.stringify(layer.layout['text-field']);
        if (field.includes('name')) {
          layer.layout['text-field'] = ['coalesce', ['get', `name:${lang}`], ['get', 'name_int'], ['get', 'name']];
        }
      }
    }
    return style;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#0b1530' } }],
};

export async function createEclipseMap(opts: MapOptions, cities: GeoJSON.FeatureCollection) {
  const { lang, d, base } = clientI18n();
  if (!webglAvailable()) {
    opts.onStatus(d.map.webglError, 'error');
    return null;
  }
  opts.onStatus(d.map.loading, 'info');

  maplibregl.setWorkerUrl(workerUrl);
  maplibregl.setRTLTextPlugin(`${base.replace(/\/$/, '')}/vendor/mapbox-gl-rtl-text.js`, true).catch(() => {});

  const basemap = await loadBasemap(lang);
  const hasGlyphs = Boolean(basemap?.glyphs);
  const style = basemap ?? FALLBACK_STYLE;
  if (!basemap) opts.onStatus(d.map.tileError, 'error');

  const map: MLMap = new maplibregl.Map({
    container: opts.container,
    style,
    bounds: TUNISIA_BOUNDS,
    fitBoundsOptions: { padding: 20 },
    maxBounds: [
      [-25, 15],
      [45, 50],
    ],
    attributionControl: false,
    cooperativeGestures: false,
    locale: {
      'NavigationControl.ZoomIn': '+',
      'NavigationControl.ZoomOut': '−',
      'FullscreenControl.Enter': d.map.fullscreen,
      'FullscreenControl.Exit': d.map.fullscreen,
    },
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.FullscreenControl(), 'top-right');
  map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
  map.addControl(
    new maplibregl.AttributionControl({
      compact: true,
      customAttribution: ['Eclipse: NASA/GSFC (F. Espenak)', 'geoBoundaries (ODbL)', 'GeoNames'],
    }),
    'bottom-right',
  );

  let tileErrorShown = !basemap;
  map.on('error', (e) => {
    const sourceId = (e as unknown as { sourceId?: string }).sourceId;
    if (!tileErrorShown && sourceId && !sourceId.startsWith('ecl-')) {
      tileErrorShown = true;
      opts.onStatus(d.map.tileError, 'error');
    }
  });

  await new Promise<void>((resolve) => map.once('load', () => resolve()));
  if (basemap) opts.onStatus(null);

  const dataUrl = (f: string) => `${base.replace(/\/$/, '')}/data/${f}`;
  map.addSource('ecl-path', { type: 'geojson', data: dataUrl('eclipse-2027-path.geojson') });
  map.addSource('ecl-gov', { type: 'geojson', data: dataUrl('tunisia-governorates.geojson') });
  map.addSource('ecl-cities', { type: 'geojson', data: cities });
  map.addSource('ecl-pick', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

  const font = ['Noto Sans Regular'];
  const fontBold = font;

  map.addLayer({
    id: 'umbra-fill',
    type: 'fill',
    source: 'ecl-path',
    filter: ['==', ['get', 'kind'], 'umbra'],
    paint: { 'fill-color': '#8f86ff', 'fill-opacity': 0.24 },
  });
  map.addLayer({
    id: 'gov-lines',
    type: 'line',
    source: 'ecl-gov',
    paint: { 'line-color': '#8b98c9', 'line-width': 0.8, 'line-opacity': 0.6 },
  });
  map.addLayer({
    id: 'magnitude-lines',
    type: 'line',
    source: 'ecl-path',
    filter: ['==', ['get', 'kind'], 'magnitude'],
    paint: { 'line-color': '#5fd4d9', 'line-width': 1, 'line-dasharray': [2, 3], 'line-opacity': 0.7 },
  });
  map.addLayer({
    id: 'duration-lines',
    type: 'line',
    source: 'ecl-path',
    filter: ['==', ['get', 'kind'], 'duration'],
    paint: { 'line-color': '#ffd68a', 'line-width': 0.9, 'line-opacity': 0.55 },
  });
  map.addLayer({
    id: 'limit-lines',
    type: 'line',
    source: 'ecl-path',
    filter: ['==', ['get', 'kind'], 'limit'],
    paint: { 'line-color': '#ece9ff', 'line-width': 2, 'line-dasharray': [3, 2] },
  });
  map.addLayer({
    id: 'central-line',
    type: 'line',
    source: 'ecl-path',
    filter: ['==', ['get', 'kind'], 'central'],
    paint: { 'line-color': '#f7b73b', 'line-width': 2.5 },
  });
  map.addLayer({
    id: 'city-points',
    type: 'circle',
    source: 'ecl-cities',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 9, 6],
      'circle-color': ['match', ['get', 'kind'], 'total', '#f7b73b', '#f5f2ea'],
      'circle-stroke-color': '#05060d',
      'circle-stroke-width': 1.5,
    },
  });
  map.addLayer({
    id: 'dest-points',
    type: 'circle',
    source: 'ecl-cities',
    filter: ['==', ['get', 'destination'], true],
    paint: { 'circle-radius': 10, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': '#5fd4d9', 'circle-stroke-width': 2 },
  });
  map.addLayer({
    id: 'pick-point',
    type: 'circle',
    source: 'ecl-pick',
    paint: { 'circle-radius': 8, 'circle-color': '#ff6b5e', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5 },
  });

  if (hasGlyphs) {
    map.addLayer({
      id: 'duration-labels',
      type: 'symbol',
      source: 'ecl-path',
      filter: ['all', ['==', ['get', 'kind'], 'duration'], ['==', ['get', 'side'], 'north']],
      minzoom: 6,
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 320,
        'text-field': ['concat', ['to-string', ['/', ['get', 'seconds'], 60]], ' min'],
        'text-font': font,
        'text-size': 11,
      },
      paint: { 'text-color': '#ffd68a', 'text-halo-color': '#0b1530', 'text-halo-width': 1.5 },
    });
    map.addLayer({
      id: 'magnitude-labels',
      type: 'symbol',
      source: 'ecl-path',
      filter: ['==', ['get', 'kind'], 'magnitude'],
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 400,
        'text-field': ['to-string', ['get', 'magnitude']],
        'text-font': font,
        'text-size': 11,
      },
      paint: { 'text-color': '#5fd4d9', 'text-halo-color': '#0b1530', 'text-halo-width': 1.5 },
    });
    map.addLayer({
      id: 'city-labels',
      type: 'symbol',
      source: 'ecl-cities',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': fontBold,
        'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 9, 14],
        'text-offset': [0, 1.1],
        'text-anchor': 'top',
        'text-optional': true,
        'symbol-sort-key': ['-', 0, ['get', 'population']],
      },
      paint: { 'text-color': '#f5f2ea', 'text-halo-color': '#05060d', 'text-halo-width': 1.6 },
    });
  }

  map.once('idle', () => (opts.container.dataset.ready = 'true'));

  // Interaction: click a town or anywhere on the map.
  const interactive = ['city-points', 'dest-points'];
  for (const id of interactive) {
    map.on('mouseenter', id, () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', id, () => (map.getCanvas().style.cursor = ''));
  }
  map.getCanvas().style.cursor = 'crosshair';
  map.on('click', (e) => {
    const hit = map.queryRenderedFeatures(e.point, { layers: interactive.filter((l) => map.getLayer(l)) })[0];
    if (hit && hit.geometry.type === 'Point') {
      const p = hit.properties as CityFeatureProps;
      const [lon, lat] = hit.geometry.coordinates as [number, number];
      opts.onPick({ lat, lon, label: p.name, id: p.id });
    } else {
      opts.onPick({ lat: e.lngLat.lat, lon: e.lngLat.lng });
    }
  });

  return {
    map,
    setPick(lat: number, lon: number, fly = false) {
      (map.getSource('ecl-pick') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [lon, lat] } }],
      });
      if (fly) map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), 8), essential: true });
    },
    setGroupVisible(group: string, visible: boolean) {
      for (const id of LAYER_GROUPS[group] ?? []) {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      }
    },
    resetView() {
      map.fitBounds(TUNISIA_BOUNDS, { padding: 20 });
    },
  };
}
