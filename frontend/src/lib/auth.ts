"use client";

import { API_BASE_URL } from "./api";

export type Role = "customer" | "provider" | "staff" | "manager" | "admin" | "super_admin";

export interface SessionUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
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
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function setDemoRole(role: Role | null) {
  if (typeof window === "undefined") return;
  if (!role) {
    localStorage.removeItem(DEMO_KEY);
  } else {
    localStorage.setItem(DEMO_KEY, role);
  }
}

export function getDemoRole(): Role | null {
  if (typeof window === "undefined") return null;
  const r = localStorage.getItem(DEMO_KEY) as Role | null;
  return r ?? null;
}

function makeDemoUser(role: Role): SessionUser {
  const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
  if (!res.ok) throw new Error("Invalid credentials");
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
  if (!res.ok) throw new Error("Registration failed");
  const json = await res.json();
  const data = json.data as { user: SessionUser; tokens: Tokens };
  setTokens(data.tokens);
  return { user: data.user, tokens: data.tokens };
}

export async function me(): Promise<SessionUser | null> {
  // Demo mode: return a static user for whichever role is selected
  const demoRole = getDemoRole();
  if (demoRole) {
    return makeDemoUser(demoRole);
  }
  const token = getAccessToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load profile");
  const json = await res.json();
  return json.data.user as SessionUser;
}

export async function refresh(): Promise<Tokens | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
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
}

export async function logout(): Promise<void> {
  const token = getAccessToken();
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
  } catch {}
  clearTokens();
  setDemoRole(null);
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  let token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    const newTokens = await refresh();
    if (newTokens) {
      token = newTokens.accessToken;
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(input, { ...init, headers });
    }
  }
  return res;
}
