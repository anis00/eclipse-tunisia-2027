/** Build-time SVG rendering of GeoJSON (equirectangular projection scaled at the mean latitude). */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Pos = number[];
type Geometry =
  | { type: 'Polygon'; coordinates: Pos[][] }
  | { type: 'MultiPolygon'; coordinates: Pos[][][] }
  | { type: 'LineString'; coordinates: Pos[] }
  | { type: 'MultiLineString'; coordinates: Pos[][] };
export interface Feature {
  properties: Record<string, unknown>;
  geometry: Geometry;
}

export function readGeoJSON(name: string): { features: Feature[] } {
  return JSON.parse(readFileSync(join(process.cwd(), 'public', 'data', name), 'utf8'));
}

export interface Projection {
  width: number;
  height: number;
  project: (lon: number, lat: number) => [number, number];
}

export function makeProjection(bbox: [number, number, number, number], width: number): Projection {
  const [w, s, e, n] = bbox;
  const k = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const scale = width / ((e - w) * k);
  const height = Math.round((n - s) * scale);
  return {
    width,
    height,
    project: (lon, lat) => [Math.round((lon - w) * k * scale * 10) / 10, Math.round((n - lat) * scale * 10) / 10],
  };
}

function ringPath(p: Projection, ring: Pos[], close: boolean): string {
  return (
    ring
      .map(([lon, lat], i) => {
        const [x, y] = p.project(lon!, lat!);
        return `${i ? 'L' : 'M'}${x} ${y}`;
      })
      .join('') + (close ? 'Z' : '')
  );
}

export function pathData(p: Projection, g: Geometry): string {
  switch (g.type) {
    case 'Polygon':
      return g.coordinates.map((r) => ringPath(p, r, true)).join('');
    case 'MultiPolygon':
      return g.coordinates.flatMap((poly) => poly.map((r) => ringPath(p, r, true))).join('');
    case 'LineString':
      return ringPath(p, g.coordinates, false);
    case 'MultiLineString':
      return g.coordinates.map((r) => ringPath(p, r, false)).join('');
  }
}

function ringContains(ring: Pos[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as [number, number];
    const [xj, yj] = ring[j] as [number, number];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Point-in-polygon test (holes honoured) for Polygon / MultiPolygon geometries. */
export function geometryContains(g: Geometry, lon: number, lat: number): boolean {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  return polys.some((p) => ringContains(p[0]!, lon, lat) && !p.slice(1).some((h) => ringContains(h, lon, lat)));
}
