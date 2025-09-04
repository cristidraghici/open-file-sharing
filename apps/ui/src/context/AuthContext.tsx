import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, endpoints } from "../services/api";

export interface User {
  id: string;
  username: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("ofs_token");
    const userStr = localStorage.getItem("ofs_user");
    const user = userStr ? (JSON.parse(userStr) as User) : null;
    setState({ user, token, loading: false });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post(endpoints.login, { username, password });
    const token: string = data?.data?.token;
    const user: User = data?.data?.user;
    if (token) localStorage.setItem("ofs_token", token);
    if (user) localStorage.setItem("ofs_user", JSON.stringify(user));
    setState({ user: user ?? null, token: token ?? null, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ofs_token");
    localStorage.removeItem("ofs_user");
    setState({ user: null, token: null, loading: false });
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get(endpoints.me);
      const user: User = data?.data;
      if (user) {
        localStorage.setItem("ofs_user", JSON.stringify(user));
        setState((s) => ({ ...s, user }));
      }
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, refreshMe }),
    [state, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
