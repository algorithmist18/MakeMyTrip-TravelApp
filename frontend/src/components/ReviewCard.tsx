import { Review } from "../types";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl border border-ink-900/5 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink-900">{review.reviewerName}</p>
          <p className="text-xs text-ink-500">
            {review.tripType} · {review.visitedMonth}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
          ★ {review.rating.toFixed(1)}
        </div>
      </div>
      {review.verified && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-700">
          ✓ Verified traveler
        </span>
      )}
      <p className="mt-2 text-sm text-ink-700">{review.text}</p>
      <p className="mt-2 text-xs text-ink-500">👍 {review.helpfulCount} found this helpful</p>
    </div>
  );
}
