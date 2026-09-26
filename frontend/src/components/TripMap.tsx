import { useMemo } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { ItineraryItem, TripHotel } from "../types";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const HOTEL_ICON = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";

interface Props {
  centerLat: number;
  centerLng: number;
  itinerary: ItineraryItem[];
  hotels: TripHotel[];
  activeDay: number | "all";
}

const containerStyle = { width: "100%", height: "100%" };

export default function TripMap({ centerLat, centerLng, itinerary, hotels, activeDay }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "trip-together-map",
    googleMapsApiKey: API_KEY || "",
  });

  const visible = useMemo(
    () => (activeDay === "all" ? itinerary : itinerary.filter((i) => i.day === activeDay)),
    [itinerary, activeDay]
  );

  const path = visible.map((i) => ({ lat: i.place.lat, lng: i.place.lng }));

  if (!API_KEY) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-900/5 p-6 text-center">
        <p className="text-sm font-semibold text-ink-700">Map preview unavailable</p>
        <p className="max-w-xs text-xs text-ink-500">
          Add a <code className="rounded bg-white px-1 py-0.5">VITE_GOOGLE_MAPS_API_KEY</code> in{" "}
          <code className="rounded bg-white px-1 py-0.5">frontend/.env</code> to see the live collaborative
          map with route lines.
        </p>
        <ul className="mt-2 space-y-1 text-left text-xs text-ink-500">
          {itinerary.map((item, idx) => (
            <li key={item.tripPlaceId}>
              <span className="mr-1 font-bold text-brand-600">{idx + 1}.</span>
              {item.place.name}
            </li>
          ))}
          {hotels.map((th) => (
            <li key={th.tripHotelId}>
              <span className="mr-1 font-bold text-accent-600">🏨</span>
              {th.hotel.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="flex h-full w-full items-center justify-center text-sm text-ink-500">Loading map…</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: centerLat, lng: centerLng }}
      zoom={12}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      {visible.map((item, idx) => (
        <Marker
          key={item.tripPlaceId}
          position={{ lat: item.place.lat, lng: item.place.lng }}
          label={{ text: String(idx + 1), color: "white", fontWeight: "700" }}
        />
      ))}
      {hotels.map((th) => (
        <Marker
          key={th.tripHotelId}
          position={{ lat: th.hotel.lat, lng: th.hotel.lng }}
          icon={HOTEL_ICON}
          title={th.hotel.name}
        />
      ))}
      {path.length > 1 && (
        <Polyline
          path={path}
          options={{ strokeColor: "#EF4444", strokeWeight: 3, strokeOpacity: 0.9 }}
        />
      )}
    </GoogleMap>
  );
}
