import { API_BASE_URL, ApiEnvelope } from "./api";
import { authFetch } from "./auth";

export type ProviderPeriod = "7d" | "30d" | "90d";

export interface ProviderDashboard {
  period: ProviderPeriod;
  products: { total: number; active: number; totalViews: number };
  bookings: { totalBookings: number; totalRevenue: number; statusBreakdown: string[] };
  recentBookings: Array<{
    _id: string;
    bookingNumber: string;
    status: string;
    pricing: { totalAmount: number; currency: string };
    startDate: string;
    endDate: string;
    customer?: { firstName?: string; lastName?: string };
    product?: { name?: string; slug?: string };
  }>;
  topProducts: Array<{
    _id: string;
    bookings: number;
    revenue: number;
    product: { _id: string; name: string; slug: string };
  }>;
}

export async function fetchProviderDashboard(period: ProviderPeriod = "30d"): Promise<{ dashboard: ProviderDashboard }> {
  const res = await authFetch(`${API_BASE_URL}/provider/dashboard?period=${period}`);
  if (!res.ok) throw new Error(`Failed to load provider dashboard (${res.status})`);
  const json: ApiEnvelope<{ dashboard: ProviderDashboard }> = await res.json();
  return json.data;
}

export interface ProviderProductItem {
  _id: string;
  name: string;
  category?: string;
  status?: string;
  images?: { url: string; isPrimary?: boolean }[];
  pricing?: { basePrice?: { daily?: number; weekly?: number; monthly?: number }; currency?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export async function fetchProviderProducts(params: Record<string, any> = {}): Promise<{ products: ProviderProductItem[]; pagination: Pagination }> {
  const search = new URLSearchParams(params as Record<string, string>).toString();
  const res = await authFetch(`${API_BASE_URL}/provider/products${search ? `?${search}` : ""}`);
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  const json: ApiEnvelope<{ products: ProviderProductItem[]; pagination: Pagination }> = await res.json();
  return json.data;
}

export type ProductCreateInput = {
  name: string;
  description: string;
  shortDescription?: string;
  category: "electronics" | "furniture" | "appliances" | "tools" | "sports" | "automotive" | "clothing" | "books" | "toys" | "other";
  tags?: string[];
  pricing: { daily: number; weekly?: number; monthly?: number; deposit?: { amount: number; required: boolean } };
  inventory: { quantity: number; locationId: string };
  rentalTerms?: { minRentalDays?: number; maxRentalDays?: number; advanceBookingDays?: number; requiresApproval?: boolean };
  images?: File[];
};

export async function createProviderProduct(input: ProductCreateInput): Promise<{ product: ProviderProductItem }> {
  const form = new FormData();
  const { images = [], ...rest } = input;
  form.append("productData", JSON.stringify(rest));
  images.forEach((file) => form.append("images", file));

  const res = await authFetch(`${API_BASE_URL}/provider/products`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Failed to create product (${res.status})`);
  const json: ApiEnvelope<{ product: ProviderProductItem }> = await res.json();
  return json.data;
}

export async function deleteProviderProduct(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/provider/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete product (${res.status})`);
}

export async function fetchProviderBookings(params: Record<string, any> = {}): Promise<{ bookings: any[]; pagination: Pagination }> {
  const search = new URLSearchParams(params as Record<string, string>).toString();
  const res = await authFetch(`${API_BASE_URL}/provider/bookings${search ? `?${search}` : ""}`);
  if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`);
  const json: ApiEnvelope<{ bookings: any[]; pagination: Pagination }> = await res.json();
  return json.data;
}

export async function updateProviderBookingStatus(id: string, payload: { status: "approved" | "rejected"; reason?: string; notes?: string }): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/provider/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update booking status (${res.status})`);
}

export async function fetchProviderProfile(): Promise<{ user: any }> {
  const res = await authFetch(`${API_BASE_URL}/provider/profile`);
  if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
  const json: ApiEnvelope<{ user: any }> = await res.json();
  return json.data;
}