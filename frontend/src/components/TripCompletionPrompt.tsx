import { Trip } from "../types";
import { destinationLabel } from "../constants/destinations";

interface Props {
  trip: Trip;
  onAnswer: (tripId: string, didYouDoIt: boolean) => void;
  busy?: boolean;
}

export default function TripCompletionPrompt({ trip, onAnswer, busy }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-2xl">
          🧳
        </div>
        <h2 className="text-lg font-bold text-ink-900">Did you go on "{trip.title}"?</h2>
        <p className="mt-1 text-sm text-ink-500">
          Your {destinationLabel(trip.destination)} trip was scheduled to wrap up on{" "}
          {new Date(trip.endDate).toLocaleDateString()}. Let us know so we can add it to your travel year.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            disabled={busy}
            onClick={() => onAnswer(trip.id, false)}
            className="flex-1 rounded-lg border border-ink-900/10 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-900/5 disabled:opacity-60"
          >
            Didn't happen
          </button>
          <button
            disabled={busy}
            onClick={() => onAnswer(trip.id, true)}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Yes, I went!
          </button>
        </div>
      </div>
    </div>
  );
}
