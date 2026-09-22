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
}

export default function HotelCard({ hotel, distanceKm, matchesStyle }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
        matchesStyle ? "border-brand-500 ring-1 ring-brand-500" : "border-ink-900/5"
      }`}
    >
      <div className="relative h-28">
        <img src={hotel.imageUrl ?? undefined} alt={hotel.name} className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-700">
          {TIER_LABEL[hotel.tier] ?? hotel.tier}
        </span>
        {matchesStyle && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
            Best match
          </span>
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
      </div>
    </div>
  );
}
