interface Props {
  dailySpendEstimate: number;
  travelerCount: number;
  travelStyle: string;
}

const STYLE_NOTE: Record<string, string> = {
  chill: "Private cabs + curated stays keep it comfortable.",
  "cost-saving": "BTS + buses keeps this plan on budget.",
  backpacking: "Hostels + street food, max stretch per rupee.",
};

export default function SmartSpendCard({ dailySpendEstimate, travelerCount, travelStyle }: Props) {
  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-ink-500">
        ₹ Smart spend
      </p>
      <p className="mt-1 text-2xl font-extrabold text-ink-900">
        ₹{dailySpendEstimate.toLocaleString("en-IN")}
        <span className="text-sm font-medium text-ink-500"> / day</span>
      </p>
      <p className="text-xs text-ink-500">
        For {travelerCount} traveler{travelerCount > 1 ? "s" : ""} · {travelStyle} plan
      </p>
      <p className="mt-2 text-xs font-semibold text-brand-600">{STYLE_NOTE[travelStyle]}</p>
    </div>
  );
}
