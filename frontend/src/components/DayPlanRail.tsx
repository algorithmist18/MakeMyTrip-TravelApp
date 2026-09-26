interface Props {
  startDate: string;
  dayCount: number;
  activeDay: number | "all";
  onSelect: (day: number | "all") => void;
}

export default function DayPlanRail({ startDate, dayCount, activeDay, onSelect }: Props) {
  const days = Array.from({ length: dayCount }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return { day: i + 1, date };
  });

  return (
    <div className="lg:w-40 lg:shrink-0">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-500">Day Plan</p>
      <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        <button
          onClick={() => onSelect("all")}
          className={`shrink-0 rounded-lg px-3 py-2 text-left text-xs font-semibold lg:w-full ${
            activeDay === "all" ? "bg-navy-900 text-white" : "bg-ink-900/5 text-ink-700 hover:bg-ink-900/10"
          }`}
        >
          All days
        </button>
        {days.map(({ day, date }) => (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold lg:w-full ${
              activeDay === day ? "bg-navy-900 text-white" : "bg-ink-900/5 text-ink-700 hover:bg-ink-900/10"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                activeDay === day ? "bg-accent-400" : "bg-ink-500/40"
              }`}
            />
            <span className="whitespace-nowrap">
              {date.toLocaleDateString(undefined, { day: "numeric", month: "short" })},{" "}
              {date.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
