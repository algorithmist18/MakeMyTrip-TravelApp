import { Place } from "../types";

interface Props {
  place: Place;
  added: boolean;
  onAdd: (place: Place) => void;
  onRemove: (place: Place) => void;
  variant?: "default" | "gem";
  busy?: boolean;
}

export default function PlaceCard({ place, added, onAdd, onRemove, variant = "default", busy }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
        added ? "border-brand-500 ring-1 ring-brand-500" : "border-ink-900/5"
      }`}
    >
      <div className="relative h-32">
        <img src={place.imageUrl ?? undefined} alt={place.name} className="h-full w-full object-cover" />
        {variant === "gem" && (
          <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600">
            Hidden gem
          </span>
        )}
        {added && (
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs text-white">
            ✓
          </span>
        )}
      </div>
      <div className="p-3">
        {place.neighborhood && <p className="text-xs text-ink-500">{place.neighborhood}</p>}
        <h4 className="text-sm font-bold text-ink-900">{place.name}</h4>
        <p className="mt-0.5 text-xs text-ink-500">
          ★ {place.rating.toFixed(1)} · {place.durationLabel}
        </p>
        {added ? (
          <button
            disabled={busy}
            onClick={() => onRemove(place)}
            className="mt-2 w-full rounded-lg bg-ink-900/5 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-900/10 disabled:opacity-60"
          >
            ✕ Remove
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={() => onAdd(place)}
            className="mt-2 w-full rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            + {variant === "gem" ? "Add gem" : "Add to trip"}
          </button>
        )}
      </div>
    </div>
  );
}
