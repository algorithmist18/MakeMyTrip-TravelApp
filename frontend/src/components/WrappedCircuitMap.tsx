import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { WrappedCircuitPoint } from "../types";
import { destinationLabel } from "../constants/destinations";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const containerStyle = { width: "100%", height: "100%" };

interface Props {
  circuit: WrappedCircuitPoint[];
}

export default function WrappedCircuitMap({ circuit }: Props) {
  const { isLoaded } = useJsApiLoader({ id: "trip-together-map", googleMapsApiKey: API_KEY || "" });

  if (circuit.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-ink-900/5 text-sm text-ink-500">
        Complete a trip to start your yearly circuit.
      </div>
    );
  }

  if (!API_KEY) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-center text-white">
        <p className="text-sm font-semibold">Add VITE_GOOGLE_MAPS_API_KEY to see your circuit on a live map</p>
        <ol className="mt-2 space-y-1 text-left text-sm">
          {circuit.map((c, idx) => (
            <li key={c.tripId}>
              {idx + 1}. {c.title} — {destinationLabel(c.destination)}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="flex h-full w-full items-center justify-center text-sm text-ink-500">Loading map…</div>;
  }

  const center = circuit[Math.floor(circuit.length / 2)];
  const path = circuit.map((c) => ({ lat: c.lat, lng: c.lng }));

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: center.lat, lng: center.lng }}
      zoom={circuit.length > 1 ? 3 : 8}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      {circuit.map((c, idx) => (
        <Marker key={c.tripId} position={{ lat: c.lat, lng: c.lng }} label={{ text: String(idx + 1), color: "white" }} />
      ))}
      {path.length > 1 && (
        <Polyline path={path} options={{ strokeColor: "#EF4444", strokeWeight: 3, strokeOpacity: 0.9 }} />
      )}
    </GoogleMap>
  );
}
