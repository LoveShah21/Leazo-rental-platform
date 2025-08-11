// Core types for the rental platform

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'customer' | 'admin'
  plan?: 'basic' | 'premium' | 'enterprise'
  createdAt: string
  lastActive?: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  images: string[]
  pricing: PricingTier[]
  availability: AvailabilitySlot[]
  location: Location
  specifications: Record<string, string>
  tags: string[]
  greenScore: GreenScore
  rating: Rating
  deposit: number
  status: 'active' | 'maintenance' | 'retired'
  createdAt: string
  updatedAt: string
}

export interface PricingTier {
  duration: 'hour' | 'day' | 'week' | 'month'
  price: number
  minDuration?: number
  maxDuration?: number
  discountPercentage?: number
}

export interface AvailabilitySlot {
  startDate: string
  endDate: string
  status: 'available' | 'booked' | 'hold' | 'maintenance'
  bookingId?: string
}

export interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface GreenScore {
  score: number // 0-100
  verificationCount: number
  badge: 'bronze' | 'silver' | 'gold'
  providerNotes?: string
  userEndorsements: number
}

export interface Rating {
  average: number
  count: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface Booking {
  id: string
  userId: string
  productId: string
  startDate: string
  endDate: string
  duration: number
  durationUnit: 'hour' | 'day' | 'week' | 'month'
  totalAmount: number
  deposit: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  deliveryDetails?: DeliveryDetails
  returnDetails?: ReturnDetails
  createdAt: string
  updatedAt: string
}

export type BookingStatus = 
  | 'quote' 
  | 'hold' 
  | 'confirmed' 
  | 'picked_up' 
  | 'returned' 
  | 'late' 
  | 'cancelled'

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'succeeded' 
  | 'failed' 
  | 'refunded'

export interface DeliveryDetails {
  method: 'pickup' | 'delivery'
  address?: string
  scheduledDate: string
  actualDate?: string
  trackingNumber?: string
  courierName?: string
  status: 'scheduled' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'
}

export interface ReturnDetails {
  method: 'pickup' | 'dropoff'
  scheduledDate: string
  actualDate?: string
  condition: 'excellent' | 'good' | 'fair' | 'damaged'
  notes?: string
  lateFee?: number
}

export interface Review {
  id: string
  userId: string
  productId: string
  bookingId: string
  rating: number
  title: string
  content: string
  verified: boolean
  helpful: number
  reported: boolean
  createdAt: string
}

export interface CartItem {
  productId: string
  startDate: string
  endDate: string
  duration: number
  durationUnit: 'hour' | 'day' | 'week' | 'month'
  price: number
  deposit: number
}

// Socket.IO event types
export interface SocketEvents {
  // Inventory updates
  'inventory:update': {
    productId: string
    locationId: string
    availability: AvailabilitySlot[]
  }
  
  // Hold events
  'hold:created': {
    productId: string
    startDate: string
    endDate: string
    expiresAt: string
  }
  
  'hold:released': {
    productId: string
    startDate: string
    endDate: string
  }
  
  // Booking updates
  'booking:statusChanged': {
    bookingId: string
    status: BookingStatus
    timestamp: string
  }
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter and search types
export interface ProductFilters {
  category?: string
  location?: string
  priceRange?: [number, number]
  availability?: {
    startDate: string
    endDate: string
  }
  rating?: number
  greenScore?: number
  tags?: string[]
}

export interface SearchParams {
  query?: string
  filters?: ProductFilters
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
  page?: number
  limit?: number
}