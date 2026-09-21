import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("tt_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("tt_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<User>("/auth/me");
        setUser(res.data);
        localStorage.setItem("tt_user", JSON.stringify(res.data));
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem("tt_token");
        localStorage.removeItem("tt_user");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem("tt_token", nextToken);
    localStorage.setItem("tt_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post("/auth/login", { email, password });
      persistSession(res.data.token, res.data.user);
    },
    [persistSession]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post("/auth/signup", { name, email, password });
      persistSession(res.data.token, res.data.user);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("tt_token");
    localStorage.removeItem("tt_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout }),
    [user, token, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
