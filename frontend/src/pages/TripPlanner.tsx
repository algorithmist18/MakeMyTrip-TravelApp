import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Hotel, ItineraryItem, Place, Trip, TravelStyle } from "../types";
import { useTripSocket } from "../hooks/useTripSocket";
import { TRAVEL_STYLE_MAP } from "../constants/travelStyles";
import { destinationLabel } from "../constants/destinations";
import { haversineKm } from "../utils/geo";
import TravelStyleSelector from "../components/TravelStyleSelector";
import PlaceCard from "../components/PlaceCard";
import HotelCard from "../components/HotelCard";
import ItineraryList from "../components/ItineraryList";
import TripMap from "../components/TripMap";
import SmartSpendCard from "../components/SmartSpendCard";
import InviteCollaboratorsCard from "../components/InviteCollaboratorsCard";
import TripCompletionPrompt, { CompletionPayload } from "../components/TripCompletionPrompt";
import TripCircuitCard from "../components/TripCircuitCard";

export default function TripPlanner() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeDay, setActiveDay] = useState<number | "all">("all");
  const [notFound, setNotFound] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showCircuit, setShowCircuit] = useState(false);

  const applyTrip = useCallback((next: Trip) => setTrip(next), []);
  useTripSocket(tripId, applyTrip);

  useEffect(() => {
    if (!tripId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get(`/trips/${tripId}`);
        if (cancelled) return;
        setTrip(res.data.trip);
        const [placesRes, hotelsRes] = await Promise.all([
          api.get(`/places`, { params: { destination: res.data.trip.destination } }),
          api.get(`/hotels`, { params: { destination: res.data.trip.destination } }),
        ]);
        if (cancelled) return;
        setPlaces(placesRes.data.places);
        setHotels(hotelsRes.data.hotels);
      } catch {
        setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const dayCount = useMemo(() => {
    if (!trip) return 1;
    const ms = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
    return Math.max(1, Math.round(ms / 86400000) + 1);
  }, [trip]);

  const addedPlaceIds = useMemo(() => new Set(trip?.itinerary.map((i) => i.place.id) ?? []), [trip]);
  const regularPlaces = places.filter((p) => !p.isHiddenGem);
  const gemPlaces = places.filter((p) => p.isHiddenGem);
  const styleMeta = trip ? TRAVEL_STYLE_MAP[trip.travelStyle] : undefined;

  const sortedHotels = useMemo(() => {
    if (!trip || hotels.length === 0) return [];
    const center =
      trip.destinationLat != null && trip.destinationLng != null
        ? { lat: trip.destinationLat, lng: trip.destinationLng }
        : null;
    const tierOrder = styleMeta?.hotelTierOrder ?? ["mid", "budget", "luxury"];
    return [...hotels]
      .map((hotel) => ({
        hotel,
        distanceKm: center ? haversineKm(center, hotel) : null,
        tierRank: tierOrder.indexOf(hotel.tier),
      }))
      .sort((a, b) => {
        if (a.tierRank !== b.tierRank) return a.tierRank - b.tierRank;
        return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
      })
      .slice(0, 6);
  }, [hotels, trip, styleMeta]);

  async function refresh() {
    const res = await api.get(`/trips/${tripId}`);
    setTrip(res.data.trip);
  }

  async function handleAddPlace(place: Place) {
    if (!trip) return;
    setBusy(true);
    try {
      await api.post(`/trips/${trip.id}/places`, { placeId: place.id, day: 1 });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleRemovePlaceByPlace(place: Place) {
    if (!trip) return;
    const item = trip.itinerary.find((i) => i.place.id === place.id);
    if (!item) return;
    await handleRemoveByTripPlaceId(item.tripPlaceId);
  }

  async function handleRemoveByTripPlaceId(tripPlaceId: string) {
    if (!trip) return;
    setBusy(true);
    try {
      await api.delete(`/trips/${trip.id}/places/${tripPlaceId}`);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleMove(item: ItineraryItem, direction: "up" | "down") {
    if (!trip) return;
    const sameDay = trip.itinerary.filter((i) => i.day === item.day).sort((a, b) => a.order - b.order);
    const idx = sameDay.findIndex((i) => i.tripPlaceId === item.tripPlaceId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameDay.length) return;
    const other = sameDay[swapIdx];
    setBusy(true);
    try {
      await api.patch(`/trips/${trip.id}/places/reorder`, {
        items: [
          { tripPlaceId: item.tripPlaceId, day: item.day, order: other.order },
          { tripPlaceId: other.tripPlaceId, day: other.day, order: item.order },
        ],
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    return Math.hypot(a.lat - b.lat, a.lng - b.lng);
  }

  async function handleOptimize() {
    if (!trip || !trip.destinationLat || !trip.destinationLng) return;
    setBusy(true);
    try {
      const items: { tripPlaceId: string; day: number; order: number }[] = [];
      const byDay = new Map<number, ItineraryItem[]>();
      for (const item of trip.itinerary) {
        const list = byDay.get(item.day) ?? [];
        list.push(item);
        byDay.set(item.day, list);
      }
      for (const [day, dayItems] of byDay) {
        const remaining = [...dayItems];
        const ordered: ItineraryItem[] = [];
        let cursor = { lat: trip.destinationLat, lng: trip.destinationLng };
        while (remaining.length) {
          remaining.sort((a, b) => distance(cursor, a.place) - distance(cursor, b.place));
          const next = remaining.shift()!;
          ordered.push(next);
          cursor = { lat: next.place.lat, lng: next.place.lng };
        }
        ordered.forEach((item, idx) => items.push({ tripPlaceId: item.tripPlaceId, day, order: idx }));
      }
      await api.patch(`/trips/${trip.id}/places/reorder`, { items });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleInvite(email: string) {
    if (!trip) return;
    await api.post(`/trips/${trip.id}/collaborators`, { email });
    await refresh();
  }

  async function handleStyleChange(style: TravelStyle) {
    if (!trip) return;
    setBusy(true);
    try {
      await api.patch(`/trips/${trip.id}`, { travelStyle: style });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleCompletionSubmit(payload: CompletionPayload): Promise<Trip> {
    if (!trip) throw new Error("No trip loaded");
    const res = await api.post(`/trips/${trip.id}/complete`, payload);
    setTrip(res.data.trip);
    return res.data.trip;
  }

  const needsCompletion = !!(
    trip &&
    trip.status === "planning" &&
    !trip.askedCompletion &&
    new Date(trip.endDate) < new Date()
  );

  useEffect(() => {
    if (needsCompletion) setShowCompletion(true);
  }, [needsCompletion]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-semibold text-ink-900">Trip not found</p>
        <button onClick={() => navigate("/")} className="mt-4 text-brand-600 hover:underline">
          Back to my trips
        </button>
      </div>
    );
  }

  if (loading || !trip) {
    return <div className="flex h-[60vh] items-center justify-center text-ink-500">Loading trip…</div>;
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-57px)] lg:flex-row">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-ink-900">{trip.title}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
              <span>
                📅 {new Date(trip.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                {" – "}
                {new Date(trip.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
                {dayCount} days
              </span>
              <span>📍 {destinationLabel(trip.destination)}</span>
            </p>
          </div>
        </div>

        {trip.status === "completed" && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
            <p className="text-sm font-semibold text-green-700">
              ✅ Trip completed — {trip.itinerary.filter((i) => i.visited).length} stop
              {trip.itinerary.filter((i) => i.visited).length === 1 ? "" : "s"},{" "}
              {trip.extraActivities.length} extra {trip.extraActivities.length === 1 ? "memory" : "memories"}
            </p>
            <button
              onClick={() => setShowCircuit(true)}
              className="rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
            >
              View & share circuit
            </button>
          </div>
        )}

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink-900">How do you want to travel?</p>
              <p className="text-xs text-ink-500">We'll tune the route, transport, and spend.</p>
            </div>
            <span className="rounded-full bg-ink-900/5 px-3 py-1 text-xs font-semibold text-ink-700">
              👥 {trip.travelerCount} traveler{trip.travelerCount > 1 ? "s" : ""}
            </span>
          </div>
          <TravelStyleSelector value={trip.travelStyle} onChange={handleStyleChange} disabled={busy} />
        </div>

        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
            ✨ Explore {destinationLabel(trip.destination)}
          </p>
          <h2 className="text-lg font-bold text-ink-900">Add places to your trip</h2>
          <p className="mb-3 text-xs text-ink-500">
            Pick up to {styleMeta?.targetPlaces ?? 4} places, then fine-tune your route.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {regularPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                added={addedPlaceIds.has(place.id)}
                onAdd={handleAddPlace}
                onRemove={handleRemovePlaceByPlace}
                busy={busy}
              />
            ))}
          </div>
        </div>

        {gemPlaces.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600">✨ Hidden gems nearby</p>
                <h2 className="text-lg font-bold text-ink-900">Go beyond the usual stops</h2>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                {gemPlaces.length} local picks
              </span>
            </div>
            <p className="mb-3 text-xs text-ink-500">Less crowded picks that fit naturally into your route.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gemPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  added={addedPlaceIds.has(place.id)}
                  onAdd={handleAddPlace}
                  onRemove={handleRemovePlaceByPlace}
                  variant="gem"
                  busy={busy}
                />
              ))}
            </div>
          </div>
        )}

        {sortedHotels.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">🏨 Stay nearby</p>
            <h2 className="text-lg font-bold text-ink-900">Suggested hotels</h2>
            <p className="mb-3 text-xs text-ink-500">
              Matched to your {styleMeta?.title.toLowerCase() ?? ""} style, closest first.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sortedHotels.map(({ hotel, distanceKm, tierRank }) => (
                <HotelCard key={hotel.id} hotel={hotel} distanceKm={distanceKm} matchesStyle={tierRank === 0} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <ItineraryList
            itinerary={trip.itinerary}
            totalPlacesTarget={styleMeta?.targetPlaces ?? 4}
            paceHint={styleMeta?.paceHint ?? ""}
            onRemove={handleRemoveByTripPlaceId}
            onMove={handleMove}
            onOptimize={handleOptimize}
            busy={busy}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SmartSpendCard
            dailySpendEstimate={trip.dailySpendEstimate}
            travelerCount={trip.travelerCount}
            travelStyle={trip.travelStyle}
          />
          <InviteCollaboratorsCard collaborators={[trip.creator, ...trip.collaborators]} onInvite={handleInvite} />
        </div>
      </div>

      <div className="relative min-h-[50vh] flex-1 lg:min-h-0">
        <div className="absolute left-3 top-3 z-10 flex gap-1 rounded-full bg-white/95 p-1 text-xs font-semibold shadow">
          <button
            onClick={() => setActiveDay("all")}
            className={`rounded-full px-3 py-1 ${activeDay === "all" ? "bg-ink-900 text-white" : "text-ink-700"}`}
          >
            All days
          </button>
          {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`rounded-full px-3 py-1 ${activeDay === d ? "bg-ink-900 text-white" : "text-ink-700"}`}
            >
              Day {d}
            </button>
          ))}
        </div>
        <div className="absolute bottom-3 right-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-700 shadow">
          {(activeDay === "all" ? trip.itinerary : trip.itinerary.filter((i) => i.day === activeDay)).length} places
          on your map
        </div>
        <TripMap
          centerLat={trip.destinationLat ?? 13.7563}
          centerLng={trip.destinationLng ?? 100.5018}
          itinerary={trip.itinerary}
          activeDay={activeDay}
        />
      </div>

      {showCompletion && (
        <TripCompletionPrompt
          trip={trip}
          onSubmit={handleCompletionSubmit}
          onClose={() => setShowCompletion(false)}
        />
      )}

      {showCircuit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 px-4">
          <div className="w-full max-w-sm">
            <TripCircuitCard trip={trip} />
            <button
              onClick={() => setShowCircuit(false)}
              className="mt-3 w-full rounded-lg border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
