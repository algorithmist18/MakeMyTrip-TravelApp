import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ItineraryItem, LocalIntelTip, Review } from "../types";
import { destinationLabel } from "../constants/destinations";
import LocalIntelCard from "./LocalIntelCard";
import ReviewCard from "./ReviewCard";

interface Props {
  destination: string;
  itinerary: ItineraryItem[];
}

export default function LocalIntelReviewsTab({ destination, itinerary }: Props) {
  const [tips, setTips] = useState<LocalIntelTip[]>([]);
  const [reviewsByPlace, setReviewsByPlace] = useState<Record<string, Review[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [tipsRes, ...reviewResponses] = await Promise.all([
        api.get("/local-intel", { params: { destination } }),
        ...itinerary.map((i) => api.get(`/places/${i.place.id}/reviews`)),
      ]);
      if (cancelled) return;
      setTips(tipsRes.data.tips);
      const map: Record<string, Review[]> = {};
      itinerary.forEach((item, idx) => {
        map[item.place.id] = reviewResponses[idx].data.reviews;
      });
      setReviewsByPlace(map);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [destination, itinerary]);

  if (loading) {
    return <p className="py-8 text-center text-sm text-ink-500">Loading local intel & reviews…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-600">🧭 Local intelligence</p>
        <h2 className="text-lg font-bold text-ink-900">Insider tips for {destinationLabel(destination)}</h2>
        <p className="mb-3 text-xs text-ink-500">Practical, on-the-ground knowledge from past travelers and locals.</p>
        {tips.length === 0 ? (
          <p className="text-sm text-ink-500">No local intel yet for this destination.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tips.map((tip) => (
              <LocalIntelCard key={tip.id} tip={tip} />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-600">⭐ Verified reviews</p>
        <h2 className="text-lg font-bold text-ink-900">What travelers say about your stops</h2>
        {itinerary.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">Add places to your itinerary to see reviews for each stop.</p>
        ) : (
          <div className="mt-3 space-y-6">
            {itinerary.map((item) => (
              <div key={item.tripPlaceId}>
                <h3 className="mb-2 text-sm font-bold text-ink-900">{item.place.name}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(reviewsByPlace[item.place.id] ?? []).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
