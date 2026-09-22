import { TravelStyle } from "../types";
import { TRAVEL_STYLES } from "../constants/travelStyles";

interface Props {
  value: TravelStyle;
  onChange: (style: TravelStyle) => void;
  disabled?: boolean;
}

export default function TravelStyleSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TRAVEL_STYLES.map((opt) => {
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
