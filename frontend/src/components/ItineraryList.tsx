import { ItineraryItem } from "../types";

interface Props {
  itinerary: ItineraryItem[];
  totalPlacesTarget: number;
  paceHint: string;
  onRemove: (tripPlaceId: string) => void;
  onMove: (item: ItineraryItem, direction: "up" | "down") => void;
  onOptimize: () => void;
  busy?: boolean;
}

export default function ItineraryList({
  itinerary,
  totalPlacesTarget,
  paceHint,
  onRemove,
  onMove,
  onOptimize,
  busy,
}: Props) {
  const byDay = new Map<number, ItineraryItem[]>();
  for (const item of itinerary) {
    const list = byDay.get(item.day) ?? [];
    list.push(item);
    byDay.set(item.day, list);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => a - b);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Your itinerary</h2>
          <p className="text-xs text-ink-500">
            {itinerary.length}/{totalPlacesTarget} saved · {paceHint}
          </p>
        </div>
        <button
          onClick={onOptimize}
          disabled={busy || itinerary.length < 2}
          className="rounded-full border border-ink-900/10 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-900/5 disabled:opacity-50"
        >
          ⚡ Optimize route
        </button>
      </div>

      {itinerary.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-900/15 p-6 text-center text-sm text-ink-500">
          Add places above to start building your day-by-day plan.
        </p>
      ) : (
        <div className="space-y-6">
          {days.map((day) => {
            const items = byDay.get(day)!.sort((a, b) => a.order - b.order);
            return (
              <div key={day}>
                <h3 className="mb-2 text-sm font-bold text-ink-700">Day {day}</h3>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={item.tripPlaceId}
                      className="flex items-center gap-3 rounded-xl border border-ink-900/5 bg-white p-3 shadow-sm"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink-900">{item.place.name}</p>
                        <p className="text-xs text-ink-500">{item.place.durationLabel}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={busy || idx === 0}
                          onClick={() => onMove(item, "up")}
                          className="grid h-7 w-7 place-items-center rounded-full text-ink-500 hover:bg-ink-900/5 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          disabled={busy || idx === items.length - 1}
                          onClick={() => onMove(item, "down")}
                          className="grid h-7 w-7 place-items-center rounded-full text-ink-500 hover:bg-ink-900/5 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => onRemove(item.tripPlaceId)}
                          className="grid h-7 w-7 place-items-center rounded-full text-ink-500 hover:bg-brand-50 hover:text-brand-600 disabled:opacity-30"
                          aria-label="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
