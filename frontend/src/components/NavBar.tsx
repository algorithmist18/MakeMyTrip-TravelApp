import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DECORATIVE_CATEGORIES = [
  { icon: "✈️", label: "Flights" },
  { icon: "🏨", label: "Hotels" },
  { icon: "🏡", label: "Homestays" },
  { icon: "🚆", label: "Trains" },
  { icon: "🚌", label: "Buses" },
  { icon: "🚕", label: "Cabs" },
  { icon: "🛂", label: "Visa" },
  { icon: "💱", label: "Forex" },
];

export default function NavBar() {
  const { user, newIdentity } = useAuth();
  const location = useLocation();
  const isTripCanvas = location.pathname.startsWith("/trips/");

  return (
    <header className="sticky top-0 z-30 bg-navy-900 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2.5 sm:gap-2 sm:px-6">
        <Link to="/" className="mr-2 flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-extrabold text-white">
            TC
          </span>
          <span className="hidden text-base font-extrabold tracking-tight sm:inline">TripCanvas</span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          {DECORATIVE_CATEGORIES.map((cat) => (
            <span
              key={cat.label}
              className="flex cursor-default flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium text-white/50"
              title={`${cat.label} (coming soon)`}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              {cat.label}
            </span>
          ))}
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-semibold ${
              isTripCanvas ? "text-accent-400" : "text-white hover:text-accent-400"
            }`}
          >
            <span className="text-base leading-none">🧳</span>
            Trip Canvas
            <span
              className={`mt-0.5 h-0.5 w-6 rounded-full ${isTripCanvas ? "bg-accent-400" : "bg-transparent"}`}
            />
          </Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 pl-2 sm:gap-3">
          <Link to="/" className="rounded-full px-2.5 py-1.5 text-xs font-medium text-white/85 hover:text-white sm:text-sm">
            My Trips
          </Link>
          <Link to="/wrapped" className="rounded-full px-2.5 py-1.5 text-xs font-medium text-white/85 hover:text-white sm:text-sm">
            Wrapped
          </Link>
          {user && (
            <span className="hidden items-center gap-1.5 text-sm text-white/90 sm:flex">
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              Hi {user.name.split(" ")[0]}
            </span>
          )}
          <button
            onClick={newIdentity}
            title="Start over as a new person (useful for testing collaboration)"
            className="rounded-full border border-white/20 px-2.5 py-1.5 text-xs font-medium text-white/85 hover:bg-white/10 sm:text-sm"
          >
            New session
          </button>
        </div>
      </div>
    </header>
  );
}
