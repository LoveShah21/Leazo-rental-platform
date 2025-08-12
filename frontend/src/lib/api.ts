export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") as string) ||
  "http://localhost:3001/api";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  cached?: boolean;
  message?: string;
}

export interface ProductListItem {
  shortDescription?: string;
  _id: string;
  name: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  images?: { url: string; isPrimary?: boolean }[];
  pricing?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    basePrice?: { hourly?: number; daily?: number; weekly?: number; monthly?: number };
    currency?: string;
    deposit?: { amount?: number; required?: boolean };
  };
  rating?: { average?: number; count?: number };
  greenScore?: { score?: number };
  specifications?: {
    yearOfManufacture: any;
    dimensions: any;
    weight: any;
    brand?: string;
    model?: string;
    color?: string;
    condition?: string;
  };
  inventory?: {
    quantity?: number;
    locationId?: string;
  }[];
  rentalTerms?: {
    minRentalDays?: number;
    maxRentalDays?: number;
    requiresApproval?: boolean;
  };
  status?: string;
  isVisible?: boolean;
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
  try {
    const searchParams = new URLSearchParams();

    // Add valid parameters
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key].toString());
      }
    });

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Disable caching for now to ensure fresh data
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}. ${errorText}`);
    }

    const json: ApiEnvelope<ProductListPayload> = await res.json();

    if (!json.success) {
      throw new Error(json.message || "Failed to fetch products");
    }

    return json.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export interface ProductDetail extends ProductListItem {
  description?: string;
  shortDescription?: string;
  owner?: { firstName?: string; lastName?: string; email?: string };
  relatedProducts?: any[];
}

export async function fetchProductById(id: string): Promise<{ product: ProductDetail }> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}. ${errorText}`);
    }

    const json: ApiEnvelope<{ product: ProductDetail }> = await res.json();

    if (!json.success) {
      throw new Error(json.message || "Failed to fetch product");
    }

    return json.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  role: "customer" | "provider" | "admin" | "super_admin" | "staff" | "manager";
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  plan?: any;
  preferences?: any;
  metadata?: any;
}

export interface UserProfileResponse {
  success: boolean;
  data: {
    user: UserProfile;
  };
  message?: string;
}
