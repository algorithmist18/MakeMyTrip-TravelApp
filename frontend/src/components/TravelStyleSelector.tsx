import { TravelStyle } from "../types";

const OPTIONS: { key: TravelStyle; icon: string; title: string; subtitle: string }[] = [
  { key: "chill", icon: "🧘", title: "Chill", subtitle: "More time, fewer stops" },
  { key: "cost-saving", icon: "🚈", title: "Cost-saving", subtitle: "Smart transit, local eats" },
  { key: "backpacking", icon: "🗺️", title: "Backpacking", subtitle: "Maximum adventure" },
];

interface Props {
  value: TravelStyle;
  onChange: (style: TravelStyle) => void;
  disabled?: boolean;
}

export default function TravelStyleSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.key)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition disabled:opacity-60 ${
              active
                ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                : "border-ink-900/10 hover:border-ink-900/20"
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            <span>
              <span className="block text-sm font-semibold text-ink-900">{opt.title}</span>
              <span className="block text-xs text-ink-500">{opt.subtitle}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
