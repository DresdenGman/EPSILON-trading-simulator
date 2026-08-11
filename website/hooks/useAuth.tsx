"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, AUTH_FAILURE_EVENT } from "@/lib/api";

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const handleAuthenticationFailure = () => {
      if (!cancelled) {
        setUser(null);
        setLoading(false);
      }
    };

    window.addEventListener(AUTH_FAILURE_EVENT, handleAuthenticationFailure);
    const bootstrap = async () => {
      try {
        const currentUser = await api.getMe();
        if (!cancelled) setUser(currentUser);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_FAILURE_EVENT, handleAuthenticationFailure);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await api.login({ email, password });
    const currentUser = await api.getMe();
    setUser(currentUser);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    await api.register({ email, username, password });
    // Registration creates the account but the backend intentionally returns no token.
    // Complete the same authenticated lifecycle as an existing user.
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    void api.logout().catch(() => undefined);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: user !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
