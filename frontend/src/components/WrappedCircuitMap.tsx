import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { WrappedCircuitPoint } from "../types";
import { numberedIcon } from "../utils/mapIcons";
import FitMapBounds from "./FitMapBounds";

interface Props {
  circuit: WrappedCircuitPoint[];
}

export default function WrappedCircuitMap({ circuit }: Props) {
  if (circuit.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-ink-900/5 text-sm text-ink-500">
        Complete a trip to start your yearly circuit.
      </div>
    );
  }

  const points: LatLngTuple[] = circuit.map((c) => [c.lat, c.lng]);
  const center = points[Math.floor(points.length / 2)];

  return (
    <MapContainer center={center} zoom={circuit.length > 1 ? 3 : 8} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {circuit.map((c, idx) => (
        <Marker key={c.tripId} position={[c.lat, c.lng]} icon={numberedIcon(idx + 1)} />
      ))}
      {points.length > 1 && (
        <Polyline positions={points} pathOptions={{ color: "#EF4444", weight: 3, opacity: 0.9 }} />
      )}
      <FitMapBounds points={points} fallback={center} />
    </MapContainer>
  );
}
