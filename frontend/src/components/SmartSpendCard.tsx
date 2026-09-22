import { TravelStyle } from "../types";
import { TRAVEL_STYLE_MAP, travelStyleLabel } from "../constants/travelStyles";

interface Props {
  dailySpendEstimate: number;
  travelerCount: number;
  travelStyle: TravelStyle;
}

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
        For {travelerCount} traveler{travelerCount > 1 ? "s" : ""} · {travelStyleLabel(travelStyle)} plan
      </p>
      <p className="mt-2 text-xs font-semibold text-brand-600">{TRAVEL_STYLE_MAP[travelStyle]?.spendNote}</p>
    </div>
  );
}
