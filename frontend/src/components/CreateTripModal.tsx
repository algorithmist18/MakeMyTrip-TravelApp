import { FormEvent, useState } from "react";
import { TravelStyle } from "../types";
import { TRAVEL_STYLES } from "../constants/travelStyles";

export const DESTINATIONS = [
  { key: "bangkok", label: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018 },
  { key: "goa", label: "Goa, India", lat: 15.2993, lng: 74.124 },
  { key: "manali", label: "Manali, India", lat: 32.2432, lng: 77.1892 },
];

interface Props {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    destination: string;
    destinationLat: number;
    destinationLng: number;
    startDate: string;
    endDate: string;
    travelStyle: TravelStyle;
    travelerCount: number;
  }) => Promise<void>;
}

export default function CreateTripModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [destinationKey, setDestinationKey] = useState(DESTINATIONS[0].key);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("cost-saving");
  const [travelerCount, setTravelerCount] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const dest = DESTINATIONS.find((d) => d.key === destinationKey)!;
    if (!startDate || !endDate) {
      setError("Please choose both dates");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim() || `${dest.label.split(",")[0]} getaway`,
        destination: dest.key,
        destinationLat: dest.lat,
        destinationLng: dest.lng,
        startDate,
        endDate,
        travelStyle,
        travelerCount,
      });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Could not create trip");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-ink-900">Plan a new trip</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Trip name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bangkok getaway"
              className="w-full rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Destination</label>
            <select
              value={destinationKey}
              onChange={(e) => setDestinationKey(e.target.value)}
              className="w-full rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Start date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">End date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Travel style</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as TravelStyle)}
                className="w-full rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {TRAVEL_STYLES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Travelers</label>
              <input
                type="number"
                min={1}
                max={30}
                value={travelerCount}
                onChange={(e) => setTravelerCount(Number(e.target.value))}
                className="w-full rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          {error && <p className="text-sm text-brand-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-ink-900/10 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-900/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
