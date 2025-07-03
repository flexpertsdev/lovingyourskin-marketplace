// Core types based on feature requirements from lys-project-plan-features.md

// User types with role-based access (lines 57-61)
export interface User {
  id: string
  email: string
  role: 'admin' | 'retailer' | 'brand'
  companyId: string
  salesRepId?: string // Auto-linked from invite
  language: 'en' | 'ko' | 'zh'
  name: string
  createdAt: Date
  lastLoginAt: Date
}

export interface Company {
  id: string
  name: string
  type: 'retailer' | 'brand'
  country: string
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  contactEmail: string
  contactPhone: string
  taxId?: string
  active: boolean
}

// Invite system types (invite-only requirement)
export interface InviteCode {
  id: string
  code: string
  companyId: string
  salesRepId: string
  role: 'retailer' | 'brand'
  email: string
  used: boolean
  expiresAt: Date
  createdAt: Date
}

// Product types with multi-language support (lines 63-68)
export interface Product {
  id: string
  brandId: string
  categoryId: string
  category: string // Category name
  name: {
    en: string
    ko: string
    zh: string
  }
  description: {
    en: string
    ko: string
    zh: string
  }
  images: string[]
  price: {
    item: number
    carton: number
    currency: 'GBP' | 'EUR' | 'CHF'
  }
  moq: number // Minimum order quantity
  moqUnit: 'items' | 'cartons'
  itemsPerCarton: number
  packSize: string // e.g. "12", "24" - number per carton/pack
  volume: string // e.g. "50ml", "100g"
  ingredients?: string[]
  certifications: CertificationType[]
  badges?: string[]
  inStock: boolean
  stockLevel: 'in' | 'low' | 'out'
  featured: boolean
  active: boolean
  leadTime: string // e.g. "3-5 days"
}

export type CertificationType = 'CPNP' | 'CPNP_UK' | 'CPNP_EU' | 'CPNP_CH' | 'VEGAN' | 'CRUELTY_FREE' | 'EWG' | 'DERMATOLOGIST_TESTED' | 'CARBON_NEUTRAL'

// Brand types based on mock data
export interface Brand {
  id: string
  slug: string
  name: {
    en: string
    ko: string
    zh: string
  }
  tagline: string
  description: {
    en: string
    ko: string
    zh: string
  }
  story?: {
    en: string
    ko: string
    zh: string
  }
  logo: string
  heroImage: string
  heroImages?: string[]
  establishedYear: number
  productCount: number
  minimumOrder: number
  country: string
  certifications: CertificationType[]
  featureTags: string[]
  technologies?: Technology[]
  categories: string[]
  stats: {
    yearsInBusiness: number
    productsSold: string
    customerSatisfaction: number
  }
  active: boolean
  featured: boolean
}

export interface Technology {
  name: string
  patent?: string
  description: string
}

export interface Category {
  id: string
  name: string
  productCount: number
}

// Shopping cart types (lines 70-78)
export interface CartItem {
  id: string
  product: Product
  quantity: number
  addedAt: Date
}

export interface Cart {
  items: CartItem[]
  lastUpdated: Date
}

// MOQ validation types
export interface MOQStatus {
  brandId: string
  brandName: string
  status: 'met' | 'warning' | 'error'
  met: boolean
  current: number
  required: number
  percentage: number
  remainingItems: number
}

// Order types with 9 statuses (lines 88-91)
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'invoiced'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'completed'

export interface Order {
  id: string
  orderNumber: string
  retailerId: string
  retailerCompanyId: string
  brandId: string // Orders separated by brand
  brandName: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: {
    items: number
    shipping: number
    total: number
    currency: 'GBP' | 'EUR' | 'CHF'
  }
  shippingAddress: {
    name: string
    company: string
    street: string
    city: string
    postalCode: string
    country: string
  }
  timeline: OrderEvent[]
  documents: OrderDocument[]
  messageThreadId: string // One thread per order
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  pricePerItem: number
  pricePerCarton: number
  totalPrice: number
}

export interface OrderEvent {
  status: OrderStatus
  timestamp: Date
  description: string
  userId?: string
}

export interface OrderDocument {
  id: string
  type: 'invoice' | 'shipping_label' | 'customs_form' | 'other'
  name: string
  url: string
  uploadedAt: Date
}

// Messaging types (lines 93-97)
export interface MessageThread {
  id: string
  orderId: string // Thread per order, never mixed
  participants: MessageParticipant[]
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface MessageParticipant {
  userId: string
  name: string
  role: 'buyer' | 'lys_team' | 'brand'
  avatar?: string
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  senderName: string
  senderRole: 'buyer' | 'lys_team' | 'brand'
  content: string
  attachments?: MessageAttachment[]
  readBy: string[]
  createdAt: Date
}

export interface MessageAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

// UI State types
export interface UIState {
  language: 'en' | 'ko' | 'zh'
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  activeModal: string | null
}