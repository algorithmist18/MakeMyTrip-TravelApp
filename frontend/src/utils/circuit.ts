export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PlanePoint {
  x: number;
  y: number;
}

/**
 * Projects lat/lng points into a padded width x height box, preserving
 * relative layout. Falls back to a centered point (or two points side by
 * side) when there isn't enough spread to normalize against.
 */
export function normalizePoints(
  points: GeoPoint[],
  width: number,
  height: number,
  padding: number
): PlanePoint[] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    return [{ x: width / 2, y: height / 2 }];
  }

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpread = maxLat - minLat || 1;
  const lngSpread = maxLng - minLng || 1;

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  return points.map((p) => {
    const nx = (p.lng - minLng) / lngSpread;
    // lat increases northward but screen y increases downward, so flip.
    const ny = 1 - (p.lat - minLat) / latSpread;
    return {
      x: padding + nx * innerW,
      y: padding + ny * innerH,
    };
  });
}
