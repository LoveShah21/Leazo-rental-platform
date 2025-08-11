export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") as string) ||
  "http://localhost:3000/api";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  cached?: boolean;
}

export interface ProductListItem {
  _id: string;
  name: string;
  category?: string;
  images?: { url: string; isPrimary?: boolean }[];
  pricing?: {
    basePrice?: { hourly?: number; daily?: number; weekly?: number; monthly?: number };
    currency?: string;
    deposit?: { amount?: number; required?: boolean };
  };
  rating?: { average?: number; count?: number };
  greenScore?: { score?: number };
}

export interface ProductListPayload {
  products: ProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function fetchProducts(params: Record<string, any> = {}): Promise<ProductListPayload> {
  const search = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE_URL}/products${search ? `?${search}` : ""}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  const json: ApiEnvelope<ProductListPayload> = await res.json();
  return json.data;
}

export interface ProductDetail extends ProductListItem {
  description?: string;
  shortDescription?: string;
  owner?: { firstName?: string; lastName?: string; email?: string };
  relatedProducts?: any[];
  status?: string;
  isVisible?: boolean;
}

export async function fetchProductById(id: string): Promise<{ product: ProductDetail }> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
  const json: ApiEnvelope<{ product: ProductDetail }> = await res.json();
  return json.data;
}
