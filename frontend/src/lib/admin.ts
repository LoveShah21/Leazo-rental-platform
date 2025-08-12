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

async function parseUsersResponse(params: Record<string, any>, res: Response): Promise<AdminUsersPayload> {
  if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
  const json = await res.json();
  const raw = json?.data as any;
  const normalized: AdminUsersPayload = {
    users: Array.isArray(raw?.users) ? raw.users : [],
    pagination: {
      page: Number(raw?.pagination?.page) || 1,
      limit: Number(raw?.pagination?.limit) || (Number(params.limit) || 20),
      total: Number(raw?.pagination?.total) || (Array.isArray(raw?.users) ? raw.users.length : 0),
      pages: Number(raw?.pagination?.pages ?? raw?.pagination?.totalPages) || 1,
    },
  };
  return normalized;
}

export async function fetchAdminUsers(params: Record<string, any> = {}): Promise<AdminUsersPayload> {
  const search = new URLSearchParams(params as Record<string, string>).toString();
  const urlAdmin = `${API_BASE_URL}/admin/users${search ? `?${search}` : ""}`;
  const resAdmin = await authFetch(urlAdmin);
  if (resAdmin.ok) return parseUsersResponse(params, resAdmin);
  // Fallback to auth route if admin route unavailable in some envs
  const urlAuth = `${API_BASE_URL}/auth/users${search ? `?${search}` : ""}`;
  const resAuth = await authFetch(urlAuth);
  return parseUsersResponse(params, resAuth);
}

// Convenience helper: fetches all pages and returns a flat list of users
export async function fetchAllAdminUsers(params: Record<string, any> = {}): Promise<AdminUser[]> {
  let page = 1;
  const maxPages = 50;
  const limit = Math.max(1, Math.min(200, Number(params.limit) || 200));
  const baseParams = { ...params, limit };
  const all: AdminUser[] = [];
  // Fetch pages until server reports last page or we see a short page
  // Also cap at maxPages to avoid infinite loops on bad backends
  while (page <= maxPages) {
    const res = await fetchAdminUsers({ ...baseParams, page });
    all.push(...res.users);
    const knownPages = Number(res.pagination.pages) || undefined;
    const isLastByCount = res.users.length < limit;
    if ((knownPages && page >= knownPages) || isLastByCount) break;
    page += 1;
  }
  return all;
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

async function parseProductsResponse(params: Record<string, any>, res: Response): Promise<AdminProductsPayload> {
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  const json = await res.json();
  const raw = json?.data as any;
  const normalized: AdminProductsPayload = {
    products: Array.isArray(raw?.products) ? raw.products : [],
    pagination: {
      page: Number(raw?.pagination?.page) || 1,
      limit: Number(raw?.pagination?.limit) || (Number(params.limit) || 20),
      total: Number(raw?.pagination?.total) || (Array.isArray(raw?.products) ? raw.products.length : 0),
      pages: Number(raw?.pagination?.pages ?? raw?.pagination?.totalPages) || 1,
    },
  };
  return normalized;
}

export async function fetchAdminProducts(params: Record<string, any> = {}): Promise<AdminProductsPayload> {
  const search = new URLSearchParams(params as Record<string, string>).toString();
  
  // Use public products endpoint (same as product grid) - it has the data
  const urlPublic = `${API_BASE_URL}/products${search ? `?${search}` : ""}`;
  const resPublic = await fetch(urlPublic);
  
  if (!resPublic.ok) {
    // Try admin endpoint as fallback
    const urlAdmin = `${API_BASE_URL}/admin/products${search ? `?${search}` : ""}`;
    const resAdmin = await authFetch(urlAdmin);
    if (resAdmin.ok) {
      return parseProductsResponse(params, resAdmin);
    }
    throw new Error(`Failed to load products (${resPublic.status})`);
  }

  const jsonPublic = await resPublic.json();
  const data = jsonPublic?.data as any;
  const publicProducts = Array.isArray(data?.products) ? data.products : [];
  
  const mapped: AdminProduct[] = publicProducts.map((p: any) => ({
    _id: String(p._id),
    name: String(p.name),
    category: p.category ?? undefined,
    status: (p.status as any) || 'active',
    isVisible: p.isVisible ?? true,
    images: p.images ?? [],
    pricing: p.pricing ?? {},
    rating: p.rating ?? {},
    owner: p.owner ? { firstName: p.owner.firstName, lastName: p.owner.lastName } : undefined,
    createdAt: p.createdAt ?? undefined,
  }));
  
  const paginationRaw = data?.pagination || {};
  return {
    products: mapped,
    pagination: {
      page: Number(paginationRaw.page) || 1,
      limit: Number(paginationRaw.limit) || (Number(params.limit) || 20),
      total: Number(paginationRaw.total) || mapped.length,
      pages: Number(paginationRaw.pages) || (Number(paginationRaw.hasNext) ? Number(paginationRaw.pages) || 1 : 1),
    },
  };
}

export async function fetchAllAdminProducts(params: Record<string, any> = {}): Promise<AdminProduct[]> {
  let page = 1;
  const maxPages = 50;
  const limit = Math.max(1, Math.min(200, Number(params.limit) || 200));
  const baseParams = { ...params, limit };
  const all: AdminProduct[] = [];
  while (page <= maxPages) {
    const res = await fetchAdminProducts({ ...baseParams, page });
    all.push(...res.products);
    const knownPages = Number(res.pagination.pages) || undefined;
    const isLastByCount = res.products.length < limit;
    if ((knownPages && page >= knownPages) || isLastByCount) break;
    page += 1;
  }
  return all;
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


