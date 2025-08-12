"use client";

import { API_BASE_URL } from "./api";

export type Role =
  | "customer"
  | "provider"
  | "staff"
  | "manager"
  | "admin"
  | "super_admin";

export interface SessionUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  phone?: string;
  isEmailVerified?: boolean;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface Session {
  user: SessionUser | null;
  tokens: Tokens | null;
}

const ACCESS_KEY = "leazo.accessToken";
const REFRESH_KEY = "leazo.refreshToken";
const DEMO_KEY = "leazo.demoRole";

function setTokens(tokens: Tokens) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  // Legacy compatibility keys used across the app
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("token", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  // Check for demo token first
  const demoToken = localStorage.getItem("demo-token");
  if (demoToken) return demoToken;

  return (
    localStorage.getItem(ACCESS_KEY) ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(REFRESH_KEY) || localStorage.getItem("refreshToken")
  );
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  // Legacy keys
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  // Demo token
  localStorage.removeItem("demo-token");
}

export function setDemoRole(role: Role | null) {
  if (typeof window === "undefined") return;
  if (!role) {
    localStorage.removeItem(DEMO_KEY);
    // Also clear demo token
    localStorage.removeItem("demo-token");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    console.log("Demo mode disabled");
  } else {
    localStorage.setItem(DEMO_KEY, role);
    // Generate demo token that backend expects: demo-token-{role}-{timestamp}
    const demoToken = `demo-token-${role}-${Date.now()}`;
    localStorage.setItem("demo-token", demoToken);
    // Also set as regular token for compatibility
    localStorage.setItem("token", demoToken);
    localStorage.setItem("accessToken", demoToken);
    console.log("Demo mode enabled with role:", role, "token:", demoToken);
  }
}

export function getDemoRole(): Role | null {
  if (typeof window === "undefined") return null;
  const r = localStorage.getItem(DEMO_KEY) as Role | null;
  return r ?? null;
}

function makeDemoUser(role: Role): SessionUser {
  const roleLabel = role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: "demo-user",
    email: "demo@leazo.dev",
    firstName: "Demo",
    lastName: roleLabel,
    role,
    isEmailVerified: true,
  };
}

export async function login(email: string, password: string): Promise<Session> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Invalid credentials");
  }

  const json = await res.json();
  const data = json.data as { user: SessionUser; tokens: Tokens };
  setTokens(data.tokens);
  return { user: data.user, tokens: data.tokens };
}

export async function register(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<Session> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Registration failed");
  }

  const json = await res.json();
  const data = json.data as { user: SessionUser; tokens: Tokens };
  setTokens(data.tokens);
  return { user: data.user, tokens: data.tokens };
}

export async function me(): Promise<SessionUser | null> {
  // Demo mode: return a static user for whichever role is selected
  const demoRole = getDemoRole();
  if (demoRole) {
    console.log("Using demo mode with role:", demoRole);
    return makeDemoUser(demoRole);
  }

  const token = getAccessToken();
  if (!token) return null;

  // Skip /auth/me call for demo tokens since they don't work with that endpoint
  if (token.startsWith("demo-token-")) {
    const parts = token.split("-");
    if (parts.length >= 3) {
      const role = parts[2] as Role;
      console.log("Using demo token with role:", role);
      return makeDemoUser(role);
    }
  }

  try {
    const res = await authFetch(`${API_BASE_URL}/auth/me`, {
      cache: "no-store",
    });

    if (res.status === 401) return null;
    if (!res.ok) {
      // Don't throw error, just return null for failed auth
      console.warn("Auth check failed:", res.status);
      return null;
    }

    const json = await res.json();
    return json.data.user as SessionUser;
  } catch (error) {
    console.warn("Auth check error:", error);
    return null;
  }
}

export async function refresh(): Promise<Tokens | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const tokens = json.data.tokens as Tokens;
    setTokens(tokens);
    return tokens;
  } catch (error) {
    console.warn("Token refresh failed:", error);
    return null;
  }
}

export async function logout(): Promise<void> {
  const token = getAccessToken();

  // Only clear tokens and demo role - let backend handle token invalidation
  try {
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (error) {
    console.warn("Logout API call failed:", error);
  } finally {
    // Always clear local storage regardless of API call success
    clearTokens();
    setDemoRole(null);
  }
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  let token = getAccessToken();
  const headers = new Headers(init.headers);

  console.log(
    "authFetch - token:",
    token ? `${token.substring(0, 20)}...` : "none"
  );

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(input, { ...init, headers });
  console.log("authFetch - response status:", res.status, "for URL:", input);

  // If token expired, try to refresh once
  if (res.status === 401 && token) {
    console.log("authFetch - attempting token refresh");
    const newTokens = await refresh();
    if (newTokens) {
      token = newTokens.accessToken;
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(input, { ...init, headers });
      console.log("authFetch - retry response status:", res.status);
    }
  }

  return res;
}

// Simple auth utilities for components
export function useSimpleAuth() {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    me().then((userData) => {
      if (mounted) {
        setUser(userData);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const session = await login(email, password);
    setUser(session.user);
    return session;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const setDemo = (role: Role) => {
    setDemoRole(role);
    const demoUser = makeDemoUser(role);
    setUser(demoUser);
    // Force a re-render to ensure token is available
    setTimeout(() => {
      setUser({ ...demoUser });
    }, 100);
  };

  return {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    setDemo,
  };
}

// Add React import for the hook
import React from "react";
import { useRouter } from "next/navigation";

// Lightweight Protected wrapper with role checks, replacing the old AuthProvider usage
export function Protected({
  children,
  roles = [] as Role[],
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const { user, loading } = useSimpleAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (roles.length > 0 && !roles.includes(user.role)) {
      router.push("/unauthorized");
    }
  }, [user, loading, roles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) return null;
  if (roles.length > 0 && !roles.includes(user.role)) return null;
  return <>{children}</>;
}
