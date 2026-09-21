import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isPlanner = location.pathname.startsWith("/trips/");

  return (
    <header className="sticky top-0 z-30 border-b border-ink-900/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-extrabold text-white">
            TT
          </span>
          {!isPlanner && <span className="text-lg font-extrabold tracking-tight">TripTogether</span>}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-900/5"
          >
            My Trips
          </Link>
          <Link
            to="/wrapped"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-900/5"
          >
            Wrapped
          </Link>
          {user && (
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: user.avatarColor }}
              title={user.name}
            >
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <button
            onClick={logout}
            className="rounded-full border border-ink-900/10 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-900/5"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
