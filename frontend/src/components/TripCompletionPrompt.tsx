import { KeyboardEvent, useState } from "react";
import { Trip } from "../types";
import { destinationLabel } from "../constants/destinations";
import TripCircuitCard from "./TripCircuitCard";

export interface CompletionPayload {
  didYouDoIt: boolean;
  visitedTripPlaceIds?: string[];
  extraActivities?: string[];
}

interface Props {
  trip: Trip;
  onSubmit: (payload: CompletionPayload) => Promise<Trip>;
  onClose: () => void;
}

type Step = "ask" | "confirm" | "share";

export default function TripCompletionPrompt({ trip, onSubmit, onClose }: Props) {
  const [step, setStep] = useState<Step>("ask");
  const [busy, setBusy] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set(trip.itinerary.map((i) => i.tripPlaceId))
  );
  const [extras, setExtras] = useState<string[]>([]);
  const [extraInput, setExtraInput] = useState("");
  const [resultTrip, setResultTrip] = useState<Trip | null>(null);

  function toggleVisited(tripPlaceId: string) {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(tripPlaceId)) next.delete(tripPlaceId);
      else next.add(tripPlaceId);
      return next;
    });
  }

  function addExtra() {
    const value = extraInput.trim();
    if (!value) return;
    setExtras((prev) => [...prev, value]);
    setExtraInput("");
  }

  function removeExtra(idx: number) {
    setExtras((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleExtraKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addExtra();
    }
  }

  async function handleDidNotGo() {
    setBusy(true);
    try {
      await onSubmit({ didYouDoIt: false });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleBuildCircuit() {
    setBusy(true);
    try {
      const updated = await onSubmit({
        didYouDoIt: true,
        visitedTripPlaceIds: Array.from(visited),
        extraActivities: extras,
      });
      setResultTrip(updated);
      setStep("share");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {step === "ask" && (
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-2xl">
              🧳
            </div>
            <h2 className="text-lg font-bold text-ink-900">Did you go on "{trip.title}"?</h2>
            <p className="mt-1 text-sm text-ink-500">
              Your {destinationLabel(trip.destination)} trip was scheduled to wrap up on{" "}
              {new Date(trip.endDate).toLocaleDateString()}. Let us know so we can add it to your
              travel year.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                disabled={busy}
                onClick={handleDidNotGo}
                className="flex-1 rounded-lg border border-ink-900/10 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-900/5 disabled:opacity-60"
              >
                Didn't happen
              </button>
              <button
                disabled={busy}
                onClick={() => setStep("confirm")}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                Yes, I went!
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div>
            <h2 className="text-lg font-bold text-ink-900">What did you actually do?</h2>
            <p className="mt-1 text-sm text-ink-500">
              Uncheck anything you skipped, and tell us about anything else you got up to.
            </p>

            {trip.itinerary.length > 0 && (
              <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
                {trip.itinerary.map((item) => (
                  <label
                    key={item.tripPlaceId}
                    className="flex items-center gap-3 rounded-lg border border-ink-900/10 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={visited.has(item.tripPlaceId)}
                      onChange={() => toggleVisited(item.tripPlaceId)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    <span className="text-ink-900">{item.place.name}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-ink-700">
                Anything else you did?
              </label>
              <div className="flex gap-2">
                <input
                  value={extraInput}
                  onChange={(e) => setExtraInput(e.target.value)}
                  onKeyDown={handleExtraKeyDown}
                  placeholder="e.g. Random rooftop bar we found"
                  className="min-w-0 flex-1 rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={addExtra}
                  className="shrink-0 rounded-lg bg-ink-900 px-3 py-2 text-sm font-semibold text-white hover:bg-ink-700"
                >
                  Add
                </button>
              </div>
              {extras.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {extras.map((activity, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                    >
                      {activity}
                      <button
                        type="button"
                        onClick={() => removeExtra(idx)}
                        className="text-brand-500 hover:text-brand-700"
                        aria-label={`Remove ${activity}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                disabled={busy}
                onClick={() => setStep("ask")}
                className="flex-1 rounded-lg border border-ink-900/10 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-900/5 disabled:opacity-60"
              >
                Back
              </button>
              <button
                disabled={busy}
                onClick={handleBuildCircuit}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? "Building…" : "Build my circuit →"}
              </button>
            </div>
          </div>
        )}

        {step === "share" && (
          <div>
            <h2 className="text-lg font-bold text-ink-900">Your trip, wrapped up 🎉</h2>
            <p className="mt-1 mb-4 text-sm text-ink-500">
              Here's your circuit — download it and share it anywhere.
            </p>
            <TripCircuitCard trip={resultTrip ?? trip} />
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-lg border border-ink-900/10 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-900/5"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
