"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "@/app/lib/axios";

type User = { id: number; username: string };

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh access token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const res = await api.post(
        "token/refresh/",
        {},
        { withCredentials: true }
      );
      const access = res.data.access;
      setAccessToken(access);
      localStorage.setItem("access", access);
      return true;
    } catch {
      localStorage.removeItem("access");
      setAccessToken(null);
      return false;
    }
  };

  // Fetch current user safely
  const fetchMe = async () => {
    try {
      const res = await api.get("me/");
      setUser(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Try refreshing token
        const refreshed = await refreshToken();
        if (refreshed) {
          await fetchMe(); // retry after refresh
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const initAuth = async () => {
    setLoading(true);
    const access = localStorage.getItem("access");

    if (access) {
      // Set the token first
      setAccessToken(access);
      // Try fetching user
      await fetchMe();
    } else {
      // No access token, try refreshing
      const refreshed = await refreshToken();
      if (refreshed) await fetchMe();
      else setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  // Login
  const login = async (username: string, password: string) => {
    const res = await api.post("login/", { username, password });
    const access = res.data.access;
    setAccessToken(access);
    localStorage.setItem("access", access);
    await fetchMe();
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("logout/", {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("access");
    setAccessToken(null);
    setUser(null);
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
