"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { registerAuthHandlers, setAccessToken } from "@/app/lib/axios";
import { User } from "@/app/types";

const AUTH_SESSION_STORAGE_KEY = "hp_has_session";
const ACCESS_TOKEN_STORAGE_KEY = "hp_access_token";

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    typeof error.response.status === "number"
  ) {
    return error.response.status;
  }

  return undefined;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistAccessToken = useCallback((token: string) => {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, "true");
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    setAccessToken(token);
  }, []);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await api.post(
        "token/refresh/",
        {},
        {
          withCredentials: true,
          _skipAuthRefresh: true,
        } as never
      );
      const access = res.data.access;
      persistAccessToken(access);
      return access;
    } catch (err: unknown) {
      const status = getErrorStatus(err);

      if (status && status !== 401 && status !== 400) {
        console.error("Token refresh failed", err);
      }

      clearAuthState();
      return null;
    }
  }, [clearAuthState, persistAccessToken]);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("me/");
      setUser(res.data);
    } catch (err: unknown) {
      if (getErrorStatus(err) === 401) {
        const refreshedAccessToken = await refreshToken();
        if (refreshedAccessToken) {
          await fetchMe();
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  const initAuth = useCallback(async () => {
    setLoading(true);
    const hasSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY) === "true";
    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
      await fetchMe();
      return;
    }

    if (hasSession) {
      const refreshedAccessToken = await refreshToken();
      if (refreshedAccessToken) {
        await fetchMe();
        return;
      }
    }

    setLoading(false);
  }, [fetchMe, refreshToken]);

  useEffect(() => {
    registerAuthHandlers({
      refreshAccessToken: refreshToken,
      onAuthFailure: clearAuthState,
    });
    void initAuth();
  }, [clearAuthState, initAuth, refreshToken]);

  const login = async (username: string, password: string) => {
    const res = await api.post("login/", { username, password });
    const access = res.data.access;
    persistAccessToken(access);
    await fetchMe();
  };

  const logout = async () => {
    try {
      await api.post("logout/", {}, { withCredentials: true });
    } catch {}
    clearAuthState();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
