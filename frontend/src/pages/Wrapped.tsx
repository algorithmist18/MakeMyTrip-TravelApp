import { useEffect, useState } from "react";
import { api } from "../api/client";
import { WrappedResponse } from "../types";
import { useAuth } from "../context/AuthContext";
import StatTile from "../components/StatTile";
import WrappedCircuitMap from "../components/WrappedCircuitMap";
import WrappedShareCard from "../components/WrappedShareCard";

const STYLE_LABEL: Record<string, string> = {
  chill: "Chill traveler",
  "cost-saving": "Cost-saving traveler",
  backpacking: "Backpacker",
};

export default function Wrapped() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState<number[]>([currentYear]);
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<WrappedResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/wrapped").then((res) => {
      const fetched: number[] = res.data.years;
      const all = Array.from(new Set([currentYear, ...fetched])).sort((a, b) => b - a);
      setYears(all);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get(`/wrapped/${year}`).then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, [year]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Your travel year</p>
          <h1 className="text-3xl font-extrabold text-ink-900">Wrapped {year}</h1>
          <p className="mt-1 text-sm text-ink-500">
            Confirm a trip actually happened and it joins your yearly circuit — like a Strava year in sport,
            but for your travels.
          </p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-full border border-ink-900/10 px-4 py-2 text-sm font-semibold text-ink-700"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading || !data ? (
        <p className="mt-10 text-ink-500">Loading your wrapped…</p>
      ) : data.stats.tripsCompleted === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-ink-900/15 p-12 text-center">
          <p className="text-lg font-semibold text-ink-900">No confirmed trips in {year} yet</p>
          <p className="mt-1 text-sm text-ink-500">
            After a trip's dates pass, we'll ask "did you do it?" — say yes and it lands here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile icon="🧳" label="Trips" value={data.stats.tripsCompleted} />
            <StatTile icon="🌍" label="Cities" value={data.stats.citiesVisited} />
            <StatTile icon="📅" label="Days traveled" value={data.stats.totalDays} />
            <StatTile
              icon="🏅"
              label="Top style"
              value={data.stats.topTravelStyle ? STYLE_LABEL[data.stats.topTravelStyle] : "—"}
            />
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-lg font-bold text-ink-900">Your {year} circuit</h2>
            <div className="h-80 overflow-hidden rounded-2xl border border-ink-900/5 shadow-sm">
              <WrappedCircuitMap circuit={data.circuit} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900">Confirmed trips</h2>
            {user && <WrappedShareCard data={data} user={user} />}
          </div>
          <div className="mt-3 space-y-2">
            {data.trips.map((t, idx) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-ink-900/5 bg-white p-3 shadow-sm"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                  <p className="text-xs capitalize text-ink-500">{t.destination}</p>
                </div>
                <span className="text-xs text-ink-500">
                  {new Date(t.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
