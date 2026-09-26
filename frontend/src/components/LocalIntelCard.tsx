import { LocalIntelTip } from "../types";

const CATEGORY_ICON: Record<string, string> = {
  weather: "☀️",
  money: "💵",
  transport: "🚌",
  custom: "🙏",
  safety: "🛡️",
  connectivity: "📶",
};

export default function LocalIntelCard({ tip }: { tip: LocalIntelTip }) {
  return (
    <div className="flex gap-3 rounded-xl border border-ink-900/5 bg-white p-4 shadow-sm">
      <span className="text-xl">{CATEGORY_ICON[tip.category] ?? "💡"}</span>
      <div>
        <p className="text-sm font-bold text-ink-900">{tip.title}</p>
        <p className="mt-0.5 text-sm text-ink-500">{tip.tip}</p>
      </div>
    </div>
  );
}
