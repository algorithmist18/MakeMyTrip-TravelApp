import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Disruption, DisruptionPlanOption, DisruptionScenarioPreview, DisruptionScenarioType } from "../types";

interface Props {
  tripId: string;
}

const SCENARIOS: { type: DisruptionScenarioType; icon: string; title: string; subtitle: string }[] = [
  { type: "flight_delay", icon: "✈️", title: "Flight delayed", subtitle: "Simulate a late inbound flight" },
  { type: "hotel_overbooked", icon: "🏨", title: "Hotel overbooked", subtitle: "Property can't honor your booking" },
  { type: "car_unavailable", icon: "🚙", title: "Rental car unavailable", subtitle: "Reserved vehicle isn't at the counter" },
  { type: "activity_closed", icon: "🚧", title: "Activity closed", subtitle: "A booked stop is shut for the day" },
];

const OUTCOME_STYLE: Record<string, { label: string; className: string }> = {
  "auto-resolved": { label: "Auto-resolved", className: "bg-green-100 text-green-700" },
  "needs-confirmation": { label: "Needs your OK", className: "bg-amber-100 text-amber-700" },
  "at-risk": { label: "At risk", className: "bg-red-100 text-red-700" },
};

function formatCost(amount: number) {
  if (amount === 0) return "No extra cost";
  const sign = amount > 0 ? "+" : "-";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

function costBadgeClass(amount: number) {
  if (amount > 0) return "bg-red-100 text-red-700";
  if (amount < 0) return "bg-green-100 text-green-700";
  return "bg-ink-900/5 text-ink-700";
}

function PlanOptionCard({
  option,
  onChoose,
  busy,
}: {
  option: DisruptionPlanOption;
  onChoose: (id: string) => void;
  busy: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-4 ${
        option.recommended ? "border-brand-500 ring-1 ring-brand-500" : "border-ink-900/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-ink-900">{option.name}</p>
        {option.recommended && (
          <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
            Agent's pick
          </span>
        )}
      </div>
      <span className={`mt-2 inline-block w-fit rounded-full px-2.5 py-1 text-xs font-bold ${costBadgeClass(option.totalCostDelta)}`}>
        {formatCost(option.totalCostDelta)}
      </span>
      <p className="mt-1 text-xs text-ink-500">{option.costNote}</p>

      <div className="mt-3 space-y-1.5">
        {option.actions.map((a, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            <span>{a.icon}</span>
            <span className="min-w-0 flex-1 text-ink-700">{a.title}</span>
            {typeof a.costDelta === "number" && a.costDelta !== 0 && (
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${costBadgeClass(a.costDelta)}`}>
                {formatCost(a.costDelta)}
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => onChoose(option.id)}
        disabled={busy}
        className={`mt-4 w-full rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 ${
          option.recommended ? "bg-brand-600 hover:bg-brand-700" : "bg-navy-900 hover:bg-navy-800"
        }`}
      >
        Choose this plan
      </button>
    </div>
  );
}

function DisruptionCard({ disruption, onApply }: { disruption: Disruption; onApply: (id: string) => void }) {
  const needsAction = disruption.actions.some((a) => a.status === "proposed");
  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{disruption.label}</p>
          <p className="mt-1 text-sm font-bold text-ink-900">{disruption.planName}</p>
          <p className="text-sm text-ink-700">{disruption.summary}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
              disruption.status === "applied"
                ? "bg-green-100 text-green-700"
                : disruption.status === "dismissed"
                ? "bg-ink-900/5 text-ink-500"
                : "bg-accent-100 text-accent-700"
            }`}
          >
            {disruption.status}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${costBadgeClass(disruption.totalCostDelta)}`}>
            {formatCost(disruption.totalCostDelta)}
          </span>
        </div>
      </div>
      {disruption.costNote && <p className="mt-1 text-xs text-ink-500">{disruption.costNote}</p>}

      <div className="mt-4 space-y-2">
        {disruption.actions.map((action) => {
          const style = OUTCOME_STYLE[action.outcome];
          return (
            <div key={action.id} className="flex items-start gap-3 rounded-lg border border-ink-900/5 p-3">
              <span className="text-lg">{action.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{action.title}</p>
                <p className="text-xs text-ink-500">{action.detail}</p>
                {action.costNote && <p className="mt-0.5 text-[11px] italic text-ink-400">{action.costNote}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {(action.costDelta ?? 0) !== 0 && (
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${costBadgeClass(action.costDelta ?? 0)}`}>
                    {formatCost(action.costDelta ?? 0)}
                  </span>
                )}
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${style.className}`}>
                  {action.status === "applied" ? "✓ Applied" : style.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {needsAction && disruption.status === "proposed" && (
        <button
          onClick={() => onApply(disruption.id)}
          className="mt-4 w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Approve agent's plan
        </button>
      )}
    </div>
  );
}

export default function DisruptionsTab({ tripId }: Props) {
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [delayHours, setDelayHours] = useState(3);
  const [thinking, setThinking] = useState(false);
  const [preview, setPreview] = useState<{ scenarioType: DisruptionScenarioType; scenario: DisruptionScenarioPreview } | null>(null);
  const [choosing, setChoosing] = useState(false);

  async function loadDisruptions() {
    const res = await api.get(`/trips/${tripId}/disruptions`);
    setDisruptions(res.data.disruptions);
    setLoading(false);
  }

  useEffect(() => {
    loadDisruptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function handleSimulate(type: DisruptionScenarioType) {
    setSimulating(true);
    setThinking(true);
    setPreview(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const res = await api.post(`/trips/${tripId}/disruptions/simulate`, {
        scenarioType: type,
        ...(type === "flight_delay" ? { delayHours } : {}),
      });
      setPreview({ scenarioType: type, scenario: res.data.scenario });
    } finally {
      setSimulating(false);
      setThinking(false);
    }
  }

  async function handleChoose(optionId: string) {
    if (!preview) return;
    setChoosing(true);
    try {
      await api.post(`/trips/${tripId}/disruptions/choose`, {
        scenarioType: preview.scenarioType,
        ...(preview.scenarioType === "flight_delay" ? { delayHours } : {}),
        optionId,
      });
      setPreview(null);
      await loadDisruptions();
    } finally {
      setChoosing(false);
    }
  }

  async function handleApply(disruptionId: string) {
    await api.post(`/trips/${tripId}/disruptions/${disruptionId}/apply`);
    await loadDisruptions();
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-brand-600">🤖 Your AI trip agent</p>
      <h2 className="text-lg font-bold text-ink-900">Simulate a disruption</h2>
      <p className="mb-4 text-xs text-ink-500">
        See how an agent would react when things go wrong, with a few concrete plans to choose from and what
        each would cost you. This is a demo simulation, not a live integration with real bookings.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SCENARIOS.map((s) => (
          <div key={s.type} className="rounded-xl border border-ink-900/10 p-4">
            <div className="text-xl">{s.icon}</div>
            <p className="mt-1 text-sm font-bold text-ink-900">{s.title}</p>
            <p className="text-xs text-ink-500">{s.subtitle}</p>
            {s.type === "flight_delay" && (
              <select
                value={delayHours}
                onChange={(e) => setDelayHours(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-ink-900/10 px-2 py-1.5 text-xs"
              >
                <option value={2}>2 hours</option>
                <option value={4}>4 hours</option>
                <option value={8}>8 hours</option>
              </select>
            )}
            <button
              onClick={() => handleSimulate(s.type)}
              disabled={simulating}
              className="mt-3 w-full rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              Simulate
            </button>
          </div>
        ))}
      </div>

      {thinking && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-dashed border-accent-400 bg-accent-50 px-4 py-3 text-sm text-accent-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent-500" />
          Agent is reasoning over your itinerary, hotel, and transfers…
        </div>
      )}

      {preview && (
        <div className="mt-6 rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{preview.scenario.label}</p>
              <p className="mt-1 text-sm text-ink-700">{preview.scenario.summary}</p>
            </div>
            <button onClick={() => setPreview(null)} className="shrink-0 text-xs font-semibold text-ink-500 hover:text-ink-700">
              ✕ Cancel
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {preview.scenario.options.map((option) => (
              <PlanOptionCard key={option.id} option={option} onChoose={handleChoose} busy={choosing} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-ink-500">Loading…</p>
        ) : disruptions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-900/15 p-6 text-center text-sm text-ink-500">
            No disruptions simulated yet. Try one above to see the agent in action.
          </p>
        ) : (
          disruptions.map((d) => <DisruptionCard key={d.id} disruption={d} onApply={handleApply} />)
        )}
      </div>
    </div>
  );
}
