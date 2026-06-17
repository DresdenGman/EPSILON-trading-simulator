"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

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

// Demo user — always authenticated, no database needed
const DEMO_USER: User = {
  id: 0,
  email: "demo@epsilon.local",
  username: "Demo",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always authenticated with demo user
  const [user] = useState<User | null>(DEMO_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Short delay to simulate loading, then ready
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const login = useCallback(async (_email: string, _password: string) => {
    // No-op: demo mode, always authenticated
  }, []);

  const register = useCallback(async (_email: string, _username: string, _password: string) => {
    // No-op: demo mode
  }, []);

  const logout = useCallback(() => {
    // No-op: demo mode
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
