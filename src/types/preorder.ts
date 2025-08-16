export interface PreorderCampaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  discountPercentage: number
  startDate: any // Firestore timestamp
  endDate: any // Firestore timestamp
  preorderDate: any // Firestore timestamp - when orders will be processed
  deliveryTimeframe: string // e.g., "3 weeks"
  availableProducts: string[] // array of product IDs, empty = all products
  createdBy: string
  createdAt: any // Firestore timestamp
  lastUpdated: any // Firestore timestamp
  updatedBy?: string
  // Statistics
  totalOrders?: number
  totalRevenue?: number
}

export interface PreorderItem {
  productId: string
  product: any // Full product object
  quantity: number
  discountPercentage: number
  pricePerItem: number
  discountedPrice: number
}

export interface Preorder {
  id: string
  campaignId: string
  campaignName: string
  userId: string
  userEmail: string
  items: PreorderItem[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  shippingAddress: {
    name: string
    street: string
    city: string
    postalCode: string
    country: string
    phone?: string
  }
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  stripeSessionId?: string
  stripePaymentIntentId?: string
  status: 'pending' | 'processing' | 'processed' | 'shipped' | 'delivered' | 'cancelled'
  placedAt: any // Firestore timestamp
  preorderDate: any // Firestore timestamp - from campaign
  estimatedDelivery: any // Firestore timestamp
  processedAt?: any // Firestore timestamp
  shippedAt?: any // Firestore timestamp
  deliveredAt?: any // Firestore timestamp
}

// Admin statistics
export interface PreorderStats {
  campaignId: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  topProducts: {
    productId: string
    productName: string
    quantity: number
    revenue: number
  }[]
  ordersByStatus: {
    pending: number
    processing: number
    processed: number
    shipped: number
    delivered: number
    cancelled: number
  }
}