"use client";

import { API_BASE_URL } from "./api";
import { authFetch } from "./auth";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ADMIN DASHBOARD
export interface AdminDashboardResponse {
  dashboard: {
    period: string;
    users: {
      total: number;
      new: number;
      active: number;
      byRole: { _id: string; count: number }[];
    };
    products: {
      total: number;
      active: number;
      byCategory: { _id: string; count: number }[];
    };
    bookings: {
      totalBookings: number;
      totalRevenue: number;
      averageBookingValue: number;
      statusBreakdown: string[];
    };
    payments: {
      totalPayments?: number;
      totalAmount?: number;
      averageAmount?: number;
      gatewayBreakdown?: string[];
    };
    recent: {
      bookings: any[];
      users: any[];
    };
    topProducts: { name: string; slug: string; bookings: number; revenue: number }[];
  };
}

export async function fetchAdminDashboard(period: string = "30d"): Promise<AdminDashboardResponse["dashboard"]> {
  const res = await authFetch(`${API_BASE_URL}/admin/dashboard?period=${encodeURIComponent(period)}`);
  if (!res.ok) throw new Error(`Failed to load admin dashboard (${res.status})`);
  const json = await res.json();
  return json.data.dashboard as AdminDashboardResponse["dashboard"];
}

// ADMIN USERS
export interface AdminUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminUsersPayload {
  users: AdminUser[];
  pagination: Pagination;
}

export async function fetchAdminUsers(params: Record<string, any> = {}): Promise<AdminUsersPayload> {
  const search = new URLSearchParams(params as Record<string, string>).toString();
  const res = await authFetch(`${API_BASE_URL}/admin/users${search ? `?${search}` : ""}`);
  if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
  const json = await res.json();
  return json.data as AdminUsersPayload;
}

export async function updateAdminUser(id: string, updates: Partial<Pick<AdminUser, "firstName" | "lastName" | "role" | "isActive">>): Promise<AdminUser> {
  const res = await authFetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update user (${res.status})`);
  const json = await res.json();
  return json.data.user as AdminUser;
}

// ADMIN PRODUCTS
export interface AdminProductOwner { firstName?: string; lastName?: string; }
export interface AdminProduct {
  _id: string;
  name: string;
  category?: string;
  status: "draft" | "active" | "inactive" | "archived";
  isVisible?: boolean;
  images?: { url: string; isPrimary?: boolean }[];
  pricing?: { basePrice?: { daily?: number }; currency?: string };
  rating?: { average?: number; count?: number };
  owner?: AdminProductOwner;
  createdAt?: string;
}

export interface AdminProductsPayload {
  products: AdminProduct[];
  pagination: Pagination;
}

export async function fetchAdminProducts(params: Record<string, any> = {}): Promise<AdminProductsPayload> {
  const search = new URLSearchParams(params as Record<string, string>).toString();
  const res = await authFetch(`${API_BASE_URL}/admin/products${search ? `?${search}` : ""}`);
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  const json = await res.json();
  return json.data as AdminProductsPayload;
}

export async function updateAdminProduct(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> {
  const res = await authFetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update product (${res.status})`);
  const json = await res.json();
  return json.data.product as AdminProduct;
}


