import { useEffect, useState } from "react";
import { api } from "../api/client";
import { LiveHotelAvailability } from "../types";

interface Props {
  checkin: string;
  checkout: string;
}

export default function LiveHotelPrices({ checkin, checkout }: Props) {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [accommodationIds, setAccommodationIds] = useState("");
  const [results, setResults] = useState<LiveHotelAvailability[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/live-hotels/status")
      .then((res) => setConnected(res.data.connected))
      .catch(() => setConnected(false));
  }, []);

  async function handleCheck() {
    if (!accommodationIds.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await api.get("/live-hotels/availability", {
        params: { accommodationIds, checkin, checkout },
      });
      setResults(res.data.results);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Couldn't fetch live prices");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-500">🔴 Live Booking.com prices</p>
        {connected !== null && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
              connected ? "bg-green-100 text-green-700" : "bg-ink-900/5 text-ink-500"
            }`}
          >
            {connected ? "Connected" : "Not connected"}
          </span>
        )}
      </div>

      {connected === false && (
        <p className="mt-2 text-xs text-ink-500">
          Live pricing needs a Booking.com Managed Affiliate Partner account. Once you have Partner
          Centre credentials, set <code className="rounded bg-ink-900/5 px-1 py-0.5">BOOKING_API_KEY</code>,{" "}
          <code className="rounded bg-ink-900/5 px-1 py-0.5">BOOKING_AFFILIATE_ID</code>, and{" "}
          <code className="rounded bg-ink-900/5 px-1 py-0.5">BOOKING_API_BASE_URL</code> in{" "}
          <code className="rounded bg-ink-900/5 px-1 py-0.5">backend/.env</code>.
        </p>
      )}

      {connected && (
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-ink-700">
            Booking.com accommodation IDs (comma-separated)
          </label>
          <div className="flex gap-2">
            <input
              value={accommodationIds}
              onChange={(e) => setAccommodationIds(e.target.value)}
              placeholder="e.g. 1234567, 7654321"
              className="min-w-0 flex-1 rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              onClick={handleCheck}
              disabled={loading || !accommodationIds.trim()}
              className="shrink-0 rounded-lg bg-ink-900 px-3 py-2 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-60"
            >
              {loading ? "Checking…" : "Check"}
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-500">
            For {checkin} → {checkout}. Get accommodation IDs from your Booking.com Partner Centre.
          </p>

          {error && <p className="mt-2 text-xs text-brand-600">{error}</p>}

          {results && results.length === 0 && (
            <p className="mt-2 text-xs text-ink-500">No availability returned for those IDs/dates.</p>
          )}
          {results && results.length > 0 && (
            <ul className="mt-3 space-y-2">
              {results.map((r) => (
                <li
                  key={r.accommodationId}
                  className="flex items-center justify-between rounded-lg border border-ink-900/10 px-3 py-2 text-sm"
                >
                  <span className="text-ink-700">{r.accommodationId}</span>
                  <span className="font-bold text-ink-900">
                    {r.currency} {r.price.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
