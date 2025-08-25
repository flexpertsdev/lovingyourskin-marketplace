export interface DiscountCode {
  id: string
  code: string // The actual discount code (e.g., "WELCOME10")
  name: string // Friendly name for the code
  description?: string
  
  // Type of discount
  type: 'general' | 'affiliate' | 'seasonal' | 'vip' | 'promotional' | 'no-moq'
  
  // Discount details
  discountType: 'percentage' | 'fixed'
  discountValue: number // Either percentage (0-100) or fixed amount in base currency
  
  // Usage limits
  maxUses?: number // Total number of times code can be used
  maxUsesPerCustomer?: number // Max uses per customer
  currentUses: number // Current usage count
  
  // Time limits
  validFrom: Date
  validUntil?: Date // Optional expiry date
  
  // Status
  active: boolean
  
  // Special functionality
  removesMOQ?: boolean // For 'no-moq' type codes - removes MOQ requirements
  
  // Conditions
  conditions?: {
    minOrderValue?: number // Minimum order value required
    maxOrderValue?: number // Maximum order value (for percentage discounts)
    newCustomersOnly?: boolean // Only for first-time customers
    specificProducts?: string[] // Product IDs this code applies to
    specificBrands?: string[] // Brand IDs this code applies to
    specificCategories?: string[] // Category restrictions
    excludedProducts?: string[] // Products excluded from discount
    requiresAccount?: boolean // User must be logged in
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string // Admin user ID who created it
  
  // Analytics
  totalRevenue: number // Total revenue generated with this code
  totalOrders: number // Number of orders using this code
  totalSavings: number // Total amount saved by customers
}

export interface Affiliate {
  id: string
  
  // Personal info
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  socialMedia?: {
    instagram?: string
    youtube?: string
    tiktok?: string
    facebook?: string
    twitter?: string
  }
  
  // Discount code link
  discountCodeId: string // Links to discountCodes collection
  discountCode?: string // The actual code for quick reference
  
  // Commission structure
  commissionType: 'percentage' | 'fixed'
  commissionValue: number // Either percentage (0-100) or fixed amount per order
  tieredCommission?: Array<{
    minOrders: number
    commissionValue: number
  }> // Optional tiered commission structure
  
  // Status
  status: 'pending' | 'active' | 'suspended' | 'terminated'
  approvedAt?: Date
  suspendedAt?: Date
  suspendedReason?: string
  
  // Statistics
  stats: {
    totalClicks: number
    uniqueVisitors: number
    totalOrders: number
    conversionRate: number // Calculated: orders / clicks
    totalRevenue: number // Total sales generated
    totalCommission: number // Total commission earned
    pendingCommission: number // Awaiting payout
    paidCommission: number // Already paid out
    lastOrderDate?: Date
    lastClickDate?: Date
  }
  
  // Payment information
  paymentInfo?: {
    method: 'bank_transfer' | 'paypal' | 'stripe' | 'other'
    bankDetails?: {
      accountName: string
      accountNumber: string
      sortCode?: string
      iban?: string
      swift?: string
    }
    paypalEmail?: string
    stripeAccountId?: string
    preferredCurrency?: string
    minPayoutAmount?: number // Minimum amount before payout
  }
  
  // Terms
  agreementDate?: Date
  agreementVersion?: string
  customTerms?: string
  
  // Metadata
  notes?: string // Internal notes
  tags?: string[] // For categorization
  createdAt: Date
  updatedAt: Date
  createdBy: string // Admin who created/approved
}

export interface DiscountValidationResult {
  valid: boolean
  error?: string
  discountCode?: DiscountCode
  affiliate?: Affiliate
  applicableAmount?: number // Amount the discount applies to
  discountAmount?: number // Actual discount amount
  removesMOQ?: boolean // Whether this discount removes MOQ requirements
}

export interface DiscountUsage {
  id: string
  discountCodeId: string
  discountCode: string
  customerId?: string
  customerEmail: string
  orderId: string
  orderValue: number
  discountAmount: number
  usedAt: Date
}

export interface CommissionPayout {
  id: string
  affiliateId: string
  affiliateName: string
  
  // Payout details
  amount: number
  currency: string
  method: 'bank_transfer' | 'paypal' | 'stripe' | 'other'
  reference?: string // Payment reference/transaction ID
  
  // Period covered
  periodStart: Date
  periodEnd: Date
  orderCount: number
  orderIds: string[]
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processedAt?: Date
  failedReason?: string
  
  // Metadata
  notes?: string
  createdAt: Date
  createdBy: string // Admin who initiated payout
}