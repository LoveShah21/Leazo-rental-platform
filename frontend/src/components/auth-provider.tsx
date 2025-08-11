"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { me, login as apiLogin, logout as apiLogout, register as apiRegister, type SessionUser, type Role } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const u = await me();
        if (!active) return;
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: async (email, password) => {
      setLoading(true);
      try {
        const session = await apiLogin(email, password);
        setUser(session.user);
      } finally {
        setLoading(false);
      }
    },
    logout: async () => {
      await apiLogout();
      setUser(null);
      router.push("/login");
    },
    register: async (payload) => {
      setLoading(true);
      try {
        const session = await apiRegister(payload);
        setUser(session.user);
      } finally {
        setLoading(false);
      }
    },
    hasRole: (...roles: Role[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
  }), [user, loading, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function Protected({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) {
    if (typeof window !== "undefined") {
      router.replace("/login");
    }
    return null;
  }
  if (roles && !roles.includes(user.role)) {
    if (typeof window !== "undefined") {
      router.replace("/");
    }
    return null;
  }
  return <>{children}</>;
}
