export interface AffiliateCode {
  id: string
  code: string // The actual affiliate code (e.g., "SUMMER2024")
  name: string // Friendly name for the code
  description?: string
  
  // Tracking
  userId?: string // Optional: link to specific user/influencer
  campaign?: string // Marketing campaign name
  
  // Commission
  commissionType: 'percentage' | 'fixed'
  commissionValue: number // Either percentage (0-100) or fixed amount
  
  // Discount for customers
  discountType: 'percentage' | 'fixed' | 'none'
  discountValue: number // Either percentage (0-100) or fixed amount
  
  // Usage limits
  maxUses?: number // Total number of times code can be used
  maxUsesPerCustomer?: number // Max uses per customer
  currentUses: number // Current usage count
  
  // Time limits
  validFrom: Date
  validUntil?: Date // Optional expiry date
  
  // Status
  active: boolean
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string // Admin user ID who created it
  
  // Analytics
  totalRevenue: number // Total revenue generated through this code
  totalOrders: number // Number of orders using this code
  totalCustomers: number // Unique customers who used this code
}

export interface AffiliateTracking {
  id: string
  affiliateCodeId: string
  affiliateCode: string
  
  // Session info
  sessionId: string
  ipAddress?: string
  userAgent?: string
  
  // UTM parameters
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  
  // Referrer info
  referrerUrl?: string
  landingPage: string
  
  // Customer info (after purchase)
  customerId?: string
  customerEmail?: string
  orderId?: string
  orderValue?: number
  commission?: number
  
  // Status
  status: 'clicked' | 'added_to_cart' | 'purchased' | 'refunded'
  
  // Timestamps
  clickedAt: Date
  addedToCartAt?: Date
  purchasedAt?: Date
  refundedAt?: Date
}

export interface AffiliateStats {
  affiliateCodeId: string
  period: 'today' | 'week' | 'month' | 'year' | 'all'
  
  // Traffic
  clicks: number
  uniqueVisitors: number
  
  // Conversion
  cartsCreated: number
  orders: number
  conversionRate: number // orders / clicks
  
  // Revenue
  totalRevenue: number
  totalCommission: number
  averageOrderValue: number
  
  // Top performers
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
  
  topReferrers: Array<{
    referrer: string
    clicks: number
    orders: number
  }>
}