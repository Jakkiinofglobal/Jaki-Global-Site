import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  email: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ authenticated: boolean; email?: string }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setIsAuthenticated(data.authenticated);
      setEmail(data.email || null);
    }
  }, [data]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', undefined);
      return res.json();
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      setEmail(null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, email, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
