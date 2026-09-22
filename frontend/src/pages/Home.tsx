import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Trip } from "../types";
import CreateTripModal from "../components/CreateTripModal";
import TripCompletionPrompt from "../components/TripCompletionPrompt";
import { useAuth } from "../context/AuthContext";
import { travelStyleLabel } from "../constants/travelStyles";

function TripCard({ trip }: { trip: Trip }) {
  const nights = Math.max(
    1,
    Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)
  );
  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex h-28 items-end bg-gradient-to-br from-brand-500 to-brand-700 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            {trip.destination}
          </p>
          <h3 className="text-lg font-bold text-white">{trip.title}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-ink-500">
          {new Date(trip.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          {" – "}
          {new Date(trip.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
          {nights} {nights === 1 ? "day" : "days"}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            trip.status === "completed"
              ? "bg-green-100 text-green-700"
              : trip.status === "not-completed"
              ? "bg-ink-900/5 text-ink-500"
              : "bg-brand-100 text-brand-700"
          }`}
        >
          {trip.status === "completed" ? "Completed" : trip.status === "not-completed" ? "Skipped" : travelStyleLabel(trip.travelStyle)}
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [answering, setAnswering] = useState(false);

  async function loadTrips() {
    const res = await api.get("/trips");
    setTrips(res.data.trips);
    setLoading(false);
  }

  useEffect(() => {
    loadTrips();
  }, []);

  const pendingCompletion = useMemo(
    () =>
      trips.find(
        (t) => t.status === "planning" && !t.askedCompletion && new Date(t.endDate) < new Date()
      ),
    [trips]
  );

  const upcoming = trips.filter((t) => t.status === "planning");
  const past = trips.filter((t) => t.status !== "planning");

  async function handleCreate(data: Parameters<Parameters<typeof CreateTripModal>[0]["onCreate"]>[0]) {
    const res = await api.post("/trips", data);
    setShowCreate(false);
    navigate(`/trips/${res.data.trip.id}`);
  }

  async function handleCompletionAnswer(tripId: string, didYouDoIt: boolean) {
    setAnswering(true);
    try {
      await api.post(`/trips/${tripId}/complete`, { didYouDoIt });
      await loadTrips();
    } finally {
      setAnswering(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Hey {user?.name?.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-ink-500">Plan together, travel together, flex together.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          + Plan a trip
        </button>
      </div>

      {loading ? (
        <p className="mt-10 text-ink-500">Loading your trips…</p>
      ) : trips.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-ink-900/15 p-12 text-center">
          <p className="text-lg font-semibold text-ink-900">No trips yet</p>
          <p className="mt-1 text-sm text-ink-500">Start your first collaborative itinerary.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Plan a trip
          </button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">Planning</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((t) => (
                  <TripCard key={t.id} trip={t} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">Past trips</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((t) => (
                  <TripCard key={t.id} trip={t} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {showCreate && <CreateTripModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {pendingCompletion && (
        <TripCompletionPrompt trip={pendingCompletion} onAnswer={handleCompletionAnswer} busy={answering} />
      )}
    </div>
  );
}
