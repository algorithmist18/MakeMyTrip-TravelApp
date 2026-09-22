import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";

interface Props {
  points: LatLngTuple[];
  fallback: LatLngTuple;
}

export default function FitMapBounds({ points, fallback }: Props) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(fallback, 12);
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(points, { padding: [56, 56] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points), fallback[0], fallback[1]]);

  return null;
}
