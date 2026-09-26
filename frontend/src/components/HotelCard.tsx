import { Hotel } from "../types";

const TIER_LABEL: Record<string, string> = {
  budget: "Budget",
  mid: "Mid-range",
  luxury: "Luxury",
};

interface Props {
  hotel: Hotel;
  distanceKm: number | null;
  matchesStyle: boolean;
  added: boolean;
  onAdd: (hotel: Hotel) => void;
  onRemove: (hotel: Hotel) => void;
  busy?: boolean;
}

export default function HotelCard({ hotel, distanceKm, matchesStyle, added, onAdd, onRemove, busy }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
        added ? "border-accent-500 ring-1 ring-accent-500" : matchesStyle ? "border-brand-500 ring-1 ring-brand-500" : "border-ink-900/5"
      }`}
    >
      <div className="relative h-28">
        <img src={hotel.imageUrl ?? undefined} alt={hotel.name} className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-700">
          {TIER_LABEL[hotel.tier] ?? hotel.tier}
        </span>
        {added ? (
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-accent-500 text-xs text-white">
            ✓
          </span>
        ) : (
          matchesStyle && (
            <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
              Best match
            </span>
          )
        )}
      </div>
      <div className="p-3">
        {hotel.neighborhood && <p className="text-xs text-ink-500">{hotel.neighborhood}</p>}
        <h4 className="text-sm font-bold text-ink-900">{hotel.name}</h4>
        <p className="mt-0.5 text-xs text-ink-500">
          ★ {hotel.rating.toFixed(1)}
          {distanceKm != null && <> · {distanceKm.toFixed(1)} km from your trip</>}
        </p>
        <p className="mt-1 text-sm font-extrabold text-ink-900">
          ₹{hotel.pricePerNight.toLocaleString("en-IN")}
          <span className="text-xs font-medium text-ink-500"> / night</span>
        </p>
        {added ? (
          <button
            disabled={busy}
            onClick={() => onRemove(hotel)}
            className="mt-2 w-full rounded-lg bg-ink-900/5 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-900/10 disabled:opacity-60"
          >
            ✕ Remove
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={() => onAdd(hotel)}
            className="mt-2 w-full rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-600 disabled:opacity-60"
          >
            + Add to trip
          </button>
        )}
      </div>
    </div>
  );
}
