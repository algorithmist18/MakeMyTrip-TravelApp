import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { ItineraryItem } from "../types";
import { numberedIcon } from "../utils/mapIcons";
import FitMapBounds from "./FitMapBounds";

interface Props {
  centerLat: number;
  centerLng: number;
  itinerary: ItineraryItem[];
  activeDay: number | "all";
}

export default function TripMap({ centerLat, centerLng, itinerary, activeDay }: Props) {
  const visible = useMemo(
    () => (activeDay === "all" ? itinerary : itinerary.filter((i) => i.day === activeDay)),
    [itinerary, activeDay]
  );
  const points: LatLngTuple[] = visible.map((i) => [i.place.lat, i.place.lng]);

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={12}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {visible.map((item, idx) => (
        <Marker
          key={item.tripPlaceId}
          position={[item.place.lat, item.place.lng]}
          icon={numberedIcon(idx + 1)}
        />
      ))}
      {points.length > 1 && (
        <Polyline positions={points} pathOptions={{ color: "#EF4444", weight: 3, opacity: 0.9 }} />
      )}
      <FitMapBounds points={points} fallback={[centerLat, centerLng]} />
    </MapContainer>
  );
}
