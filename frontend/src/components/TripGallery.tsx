import { ItineraryItem } from "../types";

interface Props {
  itinerary: ItineraryItem[];
  destination: string;
}

const GRADIENTS = [
  "from-brand-500 to-brand-800",
  "from-accent-500 to-navy-800",
  "from-navy-700 to-brand-700",
];

export default function TripGallery({ itinerary, destination }: Props) {
  const images = itinerary
    .map((i) => i.place.imageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);

  function Tile({ index, className }: { index: number; className: string }) {
    const url = images[index];
    if (url) {
      return (
        <div className={`${className} overflow-hidden rounded-xl bg-ink-900/5`}>
          <img src={url} alt={`${destination} preview ${index + 1}`} className="h-full w-full object-cover" />
        </div>
      );
    }
    return (
      <div
        className={`${className} flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} text-white/70`}
      >
        <span className="text-3xl">✦</span>
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-3 gap-2" style={{ height: "220px" }}>
      <Tile index={0} className="relative col-span-2 row-span-2" />
      <Tile index={1} className="relative" />
      <Tile index={2} className="relative" />
      <button
        type="button"
        className="absolute bottom-3 left-3 rounded-full bg-navy-900/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
      >
        🖼 View gallery →
      </button>
    </div>
  );
}
