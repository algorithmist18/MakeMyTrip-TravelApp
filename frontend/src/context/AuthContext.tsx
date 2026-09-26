import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  newIdentity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("tt_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((token: string, nextUser: User) => {
    localStorage.setItem("tt_token", token);
    localStorage.setItem("tt_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const createGuest = useCallback(async () => {
    const res = await api.post("/auth/guest");
    persistSession(res.data.token, res.data.user);
  }, [persistSession]);

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem("tt_token");
      if (token) {
        try {
          const res = await api.get<User>("/auth/me");
          setUser(res.data);
          localStorage.setItem("tt_user", JSON.stringify(res.data));
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem("tt_token");
          localStorage.removeItem("tt_user");
        }
      }
      // No account, no form: everyone gets a real (auto-created) identity so
      // trips, collaborators and sockets work exactly as if they'd signed up.
      await createGuest();
      setLoading(false);
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newIdentity = useCallback(async () => {
    localStorage.removeItem("tt_token");
    localStorage.removeItem("tt_user");
    setUser(null);
    await createGuest();
  }, [createGuest]);

  const value = useMemo(() => ({ user, loading, newIdentity }), [user, loading, newIdentity]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
