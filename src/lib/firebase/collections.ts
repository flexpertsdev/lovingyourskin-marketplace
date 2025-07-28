// src/lib/firebase/collections.ts

import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  CollectionReference,
  DocumentReference,
  Timestamp
} from 'firebase/firestore'
import { db } from './config'

// ============================================
// TYPE DEFINITIONS
// ============================================

// User types
export interface User {
  id: string
  email: string
  displayName: string
  role: 'admin' | 'retailer' | 'brand'
  company?: string
  phone?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  status: 'active' | 'inactive' | 'pending'
  inviteCode?: string
  lastLogin?: Timestamp
}

// Product types
export interface Product {
  id: string
  brandId: string
  brandName: string
  name: string
  description: string
  category: string
  subcategory?: string
  volume: string
  retailPrice: number
  wholesalePrice: number
  moq: number
  moqUnit: 'units' | 'cartons' | 'skus'
  unitsPerCarton?: number
  stock: number
  expiryDate?: Timestamp
  pao?: string // Period After Opening
  origin: string
  certifications: string[]
  eanCode?: string
  ingredients?: string
  images: string[]
  status: 'active' | 'presale' | 'discontinued' | 'out-of-stock'
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Brand types
export interface Brand {
  id: string
  name: string
  logo: string
  description: string
  country: string
  certifications: string[]
  moqDefault: number
  volumeDiscounts: VolumeDiscount[]
  status: 'active' | 'inactive'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface VolumeDiscount {
  threshold: number
  discount: number
}

// Order types
export interface Order {
  id: string
  orderNumber: string
  userId: string
  userEmail: string
  companyName: string
  items: OrderItem[]
  subtotal: number
  discount: number
  manualDiscount?: ManualDiscount
  volumeDiscount?: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: string
  shippingAddress: Address
  billingAddress?: Address
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  shipmentTracking?: string
}

export interface OrderItem {
  productId: string
  productName: string
  brandName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  moq: number
}

export interface ManualDiscount {
  type: 'percentage' | 'flat' | 'override'
  value: number
  reason: string
  appliedBy: string
  appliedAt: Timestamp
}

export interface Address {
  street: string
  city: string
  state?: string
  country: string
  postalCode: string
  phone: string
}

// Message/Contact types
export interface Message {
  id: string
  type: 'general' | 'partnership' | 'sales'
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  createdAt: Timestamp
  repliedAt?: Timestamp
  repliedBy?: string
}

// Invite types
export interface Invite {
  id: string
  code: string
  email: string
  role: 'admin' | 'retailer' | 'brand'
  createdBy: string
  createdAt: Timestamp
  expiresAt: Timestamp
  usedAt?: Timestamp
  usedBy?: string
  status: 'pending' | 'used' | 'expired'
}

// ============================================
// COLLECTION REFERENCES
// ============================================

export const collections = {
  users: collection(db, 'users') as CollectionReference<User>,
  products: collection(db, 'products') as CollectionReference<Product>,
  brands: collection(db, 'brands') as CollectionReference<Brand>,
  orders: collection(db, 'orders') as CollectionReference<Order>,
  messages: collection(db, 'messages') as CollectionReference<Message>,
  invites: collection(db, 'invites') as CollectionReference<Invite>,
}

// ============================================
// COMMON QUERIES
// ============================================

export const queries = {
  // User queries
  users: {
    byEmail: (email: string) => 
      query(collections.users, where('email', '==', email)),
    
    byRole: (role: User['role']) => 
      query(collections.users, where('role', '==', role)),
    
    active: () => 
      query(collections.users, where('status', '==', 'active')),
  },

  // Product queries
  products: {
    byBrand: (brandId: string) => 
      query(collections.products, where('brandId', '==', brandId)),
    
    active: () => 
      query(collections.products, where('status', '==', 'active')),
    
    presale: () => 
      query(collections.products, where('status', '==', 'presale')),
    
    inStock: () => 
      query(collections.products, 
        where('status', '==', 'active'),
        where('stock', '>', 0)
      ),
    
    byCategory: (category: string) => 
      query(collections.products, where('category', '==', category)),
  },

  // Order queries
  orders: {
    byUser: (userId: string) => 
      query(collections.orders, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      ),
    
    pending: () => 
      query(collections.orders, where('status', '==', 'pending')),
    
    recent: (limitCount = 10) => 
      query(collections.orders, 
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      ),
    
    byDateRange: (startDate: Date, endDate: Date) => 
      query(collections.orders,
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      ),
  },

  // Message queries
  messages: {
    unread: () => 
      query(collections.messages, where('status', '==', 'new')),
    
    byType: (type: Message['type']) => 
      query(collections.messages, where('type', '==', type)),
    
    recent: (limitCount = 20) => 
      query(collections.messages, 
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      ),
  },

  // Invite queries
  invites: {
    byCode: (code: string) => 
      query(collections.invites, where('code', '==', code)),
    
    pending: () => 
      query(collections.invites, 
        where('status', '==', 'pending'),
        where('expiresAt', '>', Timestamp.now())
      ),
    
    byEmail: (email: string) => 
      query(collections.invites, where('email', '==', email)),
  },

  // Brand queries
  brands: {
    active: () => 
      query(collections.brands, where('status', '==', 'active')),
    
    byCountry: (country: string) => 
      query(collections.brands, where('country', '==', country)),
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const docRefs = {
  user: (userId: string) => 
    doc(collections.users, userId) as DocumentReference<User>,
  
  product: (productId: string) => 
    doc(collections.products, productId) as DocumentReference<Product>,
  
  brand: (brandId: string) => 
    doc(collections.brands, brandId) as DocumentReference<Brand>,
  
  order: (orderId: string) => 
    doc(collections.orders, orderId) as DocumentReference<Order>,
  
  message: (messageId: string) => 
    doc(collections.messages, messageId) as DocumentReference<Message>,
  
  invite: (inviteId: string) => 
    doc(collections.invites, inviteId) as DocumentReference<Invite>,
}

// ============================================
// DISCOUNT CALCULATION HELPERS
// ============================================

export const calculateVolumeDiscount = (
  brand: Brand, 
  orderTotal: number
): number => {
  if (!brand.volumeDiscounts || brand.volumeDiscounts.length === 0) {
    return 0
  }

  // Sort discounts by threshold descending to find highest applicable
  const sortedDiscounts = [...brand.volumeDiscounts]
    .sort((a, b) => b.threshold - a.threshold)

  for (const discount of sortedDiscounts) {
    if (orderTotal >= discount.threshold) {
      return discount.discount
    }
  }

  return 0
}

export const applyManualDiscount = (
  subtotal: number, 
  discount: ManualDiscount
): number => {
  switch (discount.type) {
    case 'percentage':
      return subtotal * (1 - discount.value / 100)
    case 'flat':
      return Math.max(0, subtotal - discount.value)
    case 'override':
      return discount.value
    default:
      return subtotal
  }
}