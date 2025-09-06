import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, endpoints } from "../services/api";
import type { components, paths } from "@open-file-sharing/shared-types";

type User = NonNullable<components["schemas"]["User"]>;
type LoginRequest = components["schemas"]["LoginRequest"];
type LoginSuccessResponse = paths["/auth/login"]["post"]["responses"][200]["content"]["application/json"];

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
    const payload: LoginRequest = { username, password };
    const { data } = await api.post<LoginSuccessResponse>(endpoints.login, payload);
    const token: string = (data as any)?.data?.token;
    const user: User = (data as any)?.data?.user as User;
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
      type MeResponse = paths["/auth/me"]["get"]["responses"][200]["content"]["application/json"];
      const { data } = await api.get<MeResponse>(endpoints.me);
      const user: User = (data as any)?.data as User;
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
