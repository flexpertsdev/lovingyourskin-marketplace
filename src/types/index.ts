// Core types based on feature requirements from lys-project-plan-features.md

// User types with role-based access (lines 57-61)
export type UserRole = 'admin' | 'retailer' | 'brand' | 'consumer'

export interface User {
  id: string
  email: string
  role: UserRole
  companyId?: string // Optional for admin users and consumers
  brandId?: string // For brand users
  salesRepId?: string // Auto-linked from invite
  language: 'en' | 'ko' | 'zh'
  name: string
  createdAt: Date
  lastLoginAt: Date
  // Consumer-specific fields
  wishlist?: string[] // Product IDs
  addresses?: Address[]
  phoneNumber?: string
  newsletter?: boolean
}

// Address type for consumers
export interface Address {
  id: string
  label?: string // e.g., "Home", "Work"
  name: string
  street: string
  city: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
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
  companyId?: string
  salesRepId?: string
  role: UserRole
  email: string
  used: boolean
  usedBy?: string
  usedAt?: Date
  createdBy: string
  expiresAt: Date
  createdAt: Date
}

// Product types based on Firestore schema
export interface Product {
  id: string
  brandId: string
  brand: {
    id: string
    name: string
  }
  category: string
  subcategory?: string
  name: string
  description: string
  shortDescription?: string
  slug: string
  
  // Images structure from Firestore
  images: {
    primary: string
    gallery: string[]
  }
  
  // Product details
  ingredients?: string
  usage?: string
  
  // Status and flags
  status: 'active' | 'presale' | 'discontinued' | 'out-of-stock'
  featured: boolean
  
  // Pre-order fields
  isPreorder: boolean
  preorderDiscount?: number
  preorderEndDate?: string
  
  // Tags and categorization
  tags: string[]
  
  // Specifications object (complete from Firestore)
  specifications?: {
    certifications?: string[]
    expiryDate?: string
    features?: string[]  // Array of feature strings
    keyIngredient?: string
    origin?: string
    pao?: string  // Period After Opening
    setContents?: string  // Contents for product sets
    treatmentDuration?: string  // e.g., "4 weeks"
    paRating?: string  // PA rating for sunscreens
    spf?: string  // SPF value
    patent?: string
    technology?: string
    // Additional fields that may be present
    volume?: string
    weight?: string
    texture?: string
    skinType?: string[]  // Target skin types
    concerns?: string[]  // Skin concerns addressed
  }
  
  // Variants array
  variants: ProductVariant[]
  
  // Timestamps
  createdAt: any // Firestore timestamp
  updatedAt: any // Firestore timestamp or string
  
  // Legacy fields for backward compatibility
  price?: {
    wholesale?: number
    retail?: number
    currency: 'GBP' | 'EUR' | 'CHF' | 'USD'
    item?: number
  }
  retailPrice?: {
    item: number
    currency: 'GBP' | 'EUR' | 'CHF' | 'USD'
  }
  soldB2C?: boolean
  soldB2B?: boolean
  stock?: number
  stockLevel?: 'in' | 'low' | 'out'
  inStock?: boolean
  moq?: number
  itemsPerCarton?: number
  volume?: string
  certifications?: CertificationType[]
  active?: boolean
  leadTime?: string
}

export type CertificationType = 'CPNP' | 'CPNP_UK' | 'CPNP_EU' | 'CPNP_CH' | 'VEGAN' | 'CRUELTY_FREE' | 'EWG' | 'DERMATOLOGIST_TESTED' | 'CARBON_NEUTRAL'

// Product variant type based on Firestore schema
export interface ProductVariant {
  variantId: string
  sku: string
  color?: string | null
  colorHex?: string | null
  size?: number | null
  sizeUnit?: string | null
  isDefault: boolean
  status: 'active' | 'inactive'
  inventory: {
    b2b: {
      stock: number
      available: number
      reserved: number
    }
    b2c: {
      stock: number
      available: number
      reserved: number
    }
  }
  pricing: {
    b2b: {
      enabled: boolean
      wholesalePrice: number
      minOrderQuantity: number
      unitsPerCarton?: number | null
      currency: string
    }
    b2c: {
      enabled: boolean
      retailPrice: number
      salePrice?: number | null
      currency: string
    }
  }
}

// Multi-language support type
export interface MultiLangString {
  en: string
  ko: string
  zh: string
}

// Brand types based on mock data
export interface Brand {
  id: string
  slug: string
  name: string | MultiLangString
  tagline: string | MultiLangString
  description: string | MultiLangString
  story?: string
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
  isExclusivePartner?: boolean
  stats: {
    yearsInBusiness: number
    productsSold: string
    customerSatisfaction: number
  }
  active: boolean
  featured: boolean
  // Additional fields found in Firestore
  clinicalResults?: ClinicalResults
  logoStyle?: LogoStyle
  // Admin-specific fields (should be stored in Firestore)
  contactEmail?: string
  contactPerson?: string
  website?: string
  productCategories?: string[]
  status?: 'active' | 'pending' | 'inactive'
  applicationDate?: string
  approvedDate?: string
  createdAt?: any // Firestore timestamp
  updatedAt?: any // Firestore timestamp
}

export interface Technology {
  name: string
  patent?: string
  description: string
}

// Clinical results type for brands
export interface ClinicalResults {
  hairLossReduction?: {
    value: number
    duration: string
  }
  hairGrowthVisible?: {
    value: number
    duration: string
  }
  scalpHealth?: {
    value: number
    duration: string
  }
  customerSatisfaction?: {
    value: number
    unit: string
  }
}

// Logo style configuration
export interface LogoStyle {
  height?: string
  objectFit?: string
  backgroundColor?: string
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
  // User identification - either retailer or consumer
  userId: string
  userType: 'retailer' | 'consumer'
  retailerId?: string // Only for B2B orders
  retailerName?: string // Retailer company name
  retailerCompanyId?: string // Only for B2B orders
  consumerId?: string // Only for B2C orders
  brandId: string // Orders separated by brand
  brandName: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: {
    items: number
    shipping: number
    tax: number
    discount?: number
    total: number
    currency: 'GBP' | 'EUR' | 'CHF'
  }
  shippingAddress: {
    name: string
    company?: string
    street: string
    city: string
    postalCode: string
    country: string
    phone?: string
  }
  // Payment information
  paymentMethod: 'stripe_card' | 'stripe_invoice' | 'bank_transfer'
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
  stripeSessionId?: string
  stripePaymentIntentId?: string
  // Invoice information
  invoice?: {
    id: string
    number: string
    status: 'draft' | 'sent' | 'paid' | 'overdue'
    pdfUrl: string
    dueDate?: Date // B2B only
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
  product?: Product // Full product object for filtering
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

// Invoice types
export interface Invoice {
  id: string
  orderId: string
  invoiceNumber: string
  type: 'b2b' | 'b2c'
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate?: Date // For B2B with payment terms
  stripeInvoiceId?: string
  pdfUrl?: string
  customerInfo: {
    name: string
    email: string
    company?: string
    address: Address | Order['shippingAddress']
  }
  items: InvoiceItem[]
  subtotal: number
  tax: number
  taxRate: number
  shipping: number
  discount?: {
    amount: number
    description: string
  }
  total: number
  currency: 'GBP' | 'EUR' | 'CHF'
  paymentTerms?: number // Days for B2B
  notes?: string
  createdAt: Date
  sentAt?: Date
  paidAt?: Date
}

export interface InvoiceItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  description?: string
}

// Stripe configuration types
export interface StripeConfig {
  mode: 'b2b' | 'b2c'
  paymentMethods: ('card' | 'bank_transfer' | 'invoice')[]
  invoiceSettings: {
    autoGenerate: boolean
    dueInDays?: number // For B2B
    customFields?: Record<string, any>
  }
}

// Consumer cart specific types
export interface ConsumerCartItem {
  id: string
  product: Product
  quantity: number
  preOrderDiscount?: number // Applied discount percentage
  addedAt: Date
}

// UI State types
export interface UIState {
  language: 'en' | 'ko' | 'zh'
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  activeModal: string | null
}
// Re-export ContactMessage from message service
export type { ContactMessage } from '../services/firebase/message.service'

// Re-export affiliate types
export type { AffiliateCode, AffiliateTracking, AffiliateStats } from './affiliate'
