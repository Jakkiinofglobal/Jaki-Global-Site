// client/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthCtx = {
  isAuthenticated: boolean;
  isLoading: boolean;
  email: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  isAuthenticated: false,
  isLoading: true,
  email: null,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" }); // ✅ cookie required
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAuthed(!!data?.authenticated);
      setEmail(data?.email ?? null);
    } catch {
      setAuthed(false);
      setEmail(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setAuthed(false);
      setEmail(null);
    }
  }

  useEffect(() => {
    // On first load, always ask the server (no guessing)
    refresh();
  }, []);

  return (
    <Ctx.Provider value={{ isAuthenticated, isLoading, email, refresh, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
