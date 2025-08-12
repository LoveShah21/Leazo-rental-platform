export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") as string) ||
  "http://localhost:3000/api";

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
  metadata?: unknown;
}

export interface UserProfileResponse {
  success: boolean;
  data: {
    user: UserProfile;
  };
  message?: string;
}

// Booking related interfaces
export interface BookingPricing {
  baseAmount: number;
  deposit: number;
  taxes: number;
  fees: number;
  discounts: number;
  lateFees: number;
  totalAmount: number;
  currency: string;
}

export interface BookingPayment {
  method: 'stripe' | 'razorpay' | 'cash' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
}

export interface BookingDelivery {
  type: 'pickup' | 'delivery' | 'both';
  pickupAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  instructions?: string;
  contactPerson?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface BookingNotes {
  customer?: string;
  staff?: string;
  provider?: string;
}

export interface BookingLocation {
  _id: string;
  name: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface BookingProduct {
  _id: string;
  name: string;
  slug?: string;
  images?: { url: string; isPrimary?: boolean }[];
  pricing?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    basePrice?: { hourly?: number; daily?: number; weekly?: number; monthly?: number };
    currency?: string;
    deposit?: { amount?: number; required?: boolean };
  };
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  customer: string;
  product: BookingProduct;
  location: BookingLocation;
  quantity: number;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: 'pending' | 'confirmed' | 'approved' | 'rejected' | 'picked_up' | 'in_use' | 'returned' | 'completed' | 'cancelled' | 'overdue' | 'disputed';
  pricing: BookingPricing;
  payment: BookingPayment;
  delivery: BookingDelivery;
  notes: BookingNotes;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface BookingListResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BookingFilters {
  status?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

// Booking API functions
export async function fetchCustomerBookings(params: BookingFilters = {}): Promise<BookingListResponse> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key as keyof BookingFilters];
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/bookings${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const json: ApiEnvelope<BookingListResponse> = await response.json();

    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch bookings');
    }

    return json.data;
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    throw error;
  }
}

export async function cancelBooking(bookingId: string, reason: string): Promise<{ booking: Booking }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        status: 'cancelled', 
        reason,
        notes: 'Cancelled by customer'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to cancel booking: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const json: ApiEnvelope<{ booking: Booking }> = await response.json();

    if (!json.success) {
      throw new Error(json.message || 'Failed to cancel booking');
    }

    return json.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}

export async function fetchBookingById(bookingId: string): Promise<{ booking: Booking; payment?: unknown }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch booking: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const json: ApiEnvelope<{ booking: Booking; payment?: unknown }> = await response.json();

    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch booking');
    }

    return json.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
}
