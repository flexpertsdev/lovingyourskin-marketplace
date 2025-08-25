import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  increment
} from 'firebase/firestore'
import { db } from '../../lib/firebase/config'
import { 
  DiscountCode, 
  Affiliate, 
  DiscountValidationResult,
  DiscountUsage 
} from '../../types/discount'

class FirebaseDiscountService {
  // ============================================
  // DISCOUNT CODE OPERATIONS
  // ============================================
  
  /**
   * Create a new discount code
   */
  async createDiscountCode(data: Omit<DiscountCode, 'id' | 'currentUses' | 'totalRevenue' | 'totalOrders' | 'totalSavings' | 'createdAt' | 'updatedAt'>): Promise<DiscountCode> {
    try {
      // Check if code already exists
      const existingCode = await this.getDiscountByCode(data.code)
      if (existingCode) {
        throw new Error('Discount code already exists')
      }
      
      // Clean the data object to remove undefined values
      const cleanData: any = {}
      Object.keys(data).forEach(key => {
        const value = (data as any)[key]
        if (value !== undefined) {
          cleanData[key] = value
        }
      })
      
      const docRef = await addDoc(collection(db, 'discountCodes'), {
        ...cleanData,
        code: data.code.toUpperCase(),
        currentUses: 0,
        totalRevenue: 0,
        totalOrders: 0,
        totalSavings: 0,
        validFrom: data.validFrom instanceof Date ? Timestamp.fromDate(data.validFrom) : data.validFrom,
        validUntil: data.validUntil ? (data.validUntil instanceof Date ? Timestamp.fromDate(data.validUntil) : data.validUntil) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      const newDoc = await getDoc(docRef)
      return { id: newDoc.id, ...newDoc.data() } as DiscountCode
    } catch (error) {
      console.error('Error creating discount code:', error)
      throw error
    }
  }
  
  /**
   * Get discount code by code string
   */
  async getDiscountByCode(code: string): Promise<DiscountCode | null> {
    try {
      const q = query(
        collection(db, 'discountCodes'),
        where('code', '==', code.toUpperCase())
      )
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as DiscountCode
    } catch (error) {
      console.error('Error fetching discount code:', error)
      return null
    }
  }
  
  /**
   * Get discount code by ID
   */
  async getDiscountById(id: string): Promise<DiscountCode | null> {
    try {
      const docRef = doc(db, 'discountCodes', id)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) return null
      
      return { id: docSnap.id, ...docSnap.data() } as DiscountCode
    } catch (error) {
      console.error('Error fetching discount code:', error)
      return null
    }
  }
  
  /**
   * Get all discount codes
   */
  async getAllDiscountCodes(includeInactive = false): Promise<DiscountCode[]> {
    try {
      let q = query(
        collection(db, 'discountCodes'),
        orderBy('createdAt', 'desc')
      )
      
      if (!includeInactive) {
        q = query(
          collection(db, 'discountCodes'),
          where('active', '==', true),
          orderBy('createdAt', 'desc')
        )
      }
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiscountCode[]
    } catch (error) {
      console.error('Error fetching discount codes:', error)
      return []
    }
  }
  
  /**
   * Validate a discount code for use
   */
  async validateDiscountCode(
    code: string, 
    orderDetails?: {
      customerId?: string
      orderValue?: number
      productIds?: string[]
      brandIds?: string[]
      isNewCustomer?: boolean
      cartItems?: any[] // Cart items for MOQ validation
      isB2BOrder?: boolean // Whether this is a B2B order
    }
  ): Promise<DiscountValidationResult> {
    try {
      // Get the discount code
      const discountCode = await this.getDiscountByCode(code)
      
      if (!discountCode) {
        return { valid: false, error: 'Invalid discount code' }
      }
      
      // Check if active
      if (!discountCode.active) {
        return { valid: false, error: 'Discount code is not active' }
      }
      
      // Check validity dates
      const now = new Date()
      const validFrom = discountCode.validFrom instanceof Timestamp 
        ? discountCode.validFrom.toDate() 
        : new Date(discountCode.validFrom)
      
      if (now < validFrom) {
        return { valid: false, error: 'Discount code is not yet valid' }
      }
      
      if (discountCode.validUntil) {
        const validUntil = discountCode.validUntil instanceof Timestamp 
          ? discountCode.validUntil.toDate() 
          : new Date(discountCode.validUntil)
        
        if (now > validUntil) {
          return { valid: false, error: 'Discount code has expired' }
        }
      }
      
      // Check usage limits
      if (discountCode.maxUses && discountCode.currentUses >= discountCode.maxUses) {
        return { valid: false, error: 'Discount code usage limit reached' }
      }
      
      // Check customer-specific usage limits
      if (discountCode.maxUsesPerCustomer && orderDetails?.customerId) {
        const customerUses = await this.getCustomerUsageCount(code, orderDetails.customerId)
        if (customerUses >= discountCode.maxUsesPerCustomer) {
          return { valid: false, error: 'You have already used this discount code' }
        }
      }
      
      // Validate No-MOQ codes - only for B2B orders
      if (discountCode.removesMOQ && discountCode.type === 'no-moq') {
        if (!orderDetails?.isB2BOrder) {
          return { valid: false, error: 'No-MOQ codes are only valid for B2B orders' }
        }
      }
      
      // Check conditions
      if (discountCode.conditions && orderDetails) {
        const conditions = discountCode.conditions
        
        // Min order value
        if (conditions.minOrderValue && orderDetails.orderValue) {
          if (orderDetails.orderValue < conditions.minOrderValue) {
            return { 
              valid: false, 
              error: `Minimum order value of ${conditions.minOrderValue} required` 
            }
          }
        }
        
        // New customers only
        if (conditions.newCustomersOnly && !orderDetails.isNewCustomer) {
          return { valid: false, error: 'This code is only valid for new customers' }
        }
        
        // Specific products
        if (conditions.specificProducts && conditions.specificProducts.length > 0) {
          if (!orderDetails.productIds || !orderDetails.productIds.some(id => 
            conditions.specificProducts!.includes(id)
          )) {
            return { valid: false, error: 'This code is not valid for these products' }
          }
        }
        
        // Specific brands
        if (conditions.specificBrands && conditions.specificBrands.length > 0) {
          if (!orderDetails.brandIds || !orderDetails.brandIds.some(id => 
            conditions.specificBrands!.includes(id)
          )) {
            return { valid: false, error: 'This code is not valid for these brands' }
          }
        }
      }
      
      // Get affiliate if it's an affiliate code
      let affiliate: Affiliate | undefined
      if (discountCode.type === 'affiliate') {
        affiliate = await this.getAffiliateByDiscountCode(discountCode.id)
      }
      
      // Calculate discount amount
      let discountAmount = 0
      let applicableAmount = orderDetails?.orderValue || 0
      
      if (discountCode.discountType === 'percentage') {
        discountAmount = (applicableAmount * discountCode.discountValue) / 100
      } else {
        discountAmount = Math.min(discountCode.discountValue, applicableAmount)
      }
      
      return { 
        valid: true, 
        discountCode,
        affiliate,
        applicableAmount,
        discountAmount,
        removesMOQ: discountCode.removesMOQ || false
      }
    } catch (error) {
      console.error('Error validating discount code:', error)
      return { valid: false, error: 'Error validating discount code' }
    }
  }
  
  /**
   * Get customer usage count for a discount code
   */
  private async getCustomerUsageCount(code: string, customerId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'discountUsage'),
        where('discountCode', '==', code.toUpperCase()),
        where('customerId', '==', customerId)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.size
    } catch (error) {
      console.error('Error getting customer usage count:', error)
      return 0
    }
  }
  
  /**
   * Record discount code usage
   */
  async recordDiscountUsage(usage: Omit<DiscountUsage, 'id' | 'usedAt'>): Promise<void> {
    try {
      // Record the usage
      await addDoc(collection(db, 'discountUsage'), {
        ...usage,
        discountCode: usage.discountCode.toUpperCase(),
        usedAt: Timestamp.now()
      })
      
      // Update the discount code stats
      const codeRef = doc(db, 'discountCodes', usage.discountCodeId)
      await updateDoc(codeRef, {
        currentUses: increment(1),
        totalOrders: increment(1),
        totalRevenue: increment(usage.orderValue),
        totalSavings: increment(usage.discountAmount),
        updatedAt: Timestamp.now()
      })
      
      // If it's an affiliate code, update affiliate stats
      const discountCode = await this.getDiscountById(usage.discountCodeId)
      if (discountCode?.type === 'affiliate') {
        await this.updateAffiliateStats(usage.discountCodeId, usage.orderValue, usage.discountAmount)
      }
    } catch (error) {
      console.error('Error recording discount usage:', error)
      throw error
    }
  }
  
  /**
   * Update discount code
   */
  async updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<void> {
    try {
      const docRef = doc(db, 'discountCodes', id)
      
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now()
      }
      
      // Convert dates to Timestamps
      if (updates.validFrom) {
        updateData.validFrom = updates.validFrom instanceof Date 
          ? Timestamp.fromDate(updates.validFrom) 
          : updates.validFrom
      }
      
      if (updates.validUntil !== undefined) {
        updateData.validUntil = updates.validUntil 
          ? (updates.validUntil instanceof Date ? Timestamp.fromDate(updates.validUntil) : updates.validUntil)
          : null
      }
      
      await updateDoc(docRef, updateData)
    } catch (error) {
      console.error('Error updating discount code:', error)
      throw error
    }
  }
  
  /**
   * Delete discount code
   */
  async deleteDiscountCode(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'discountCodes', id))
    } catch (error) {
      console.error('Error deleting discount code:', error)
      throw error
    }
  }
  
  // ============================================
  // AFFILIATE OPERATIONS
  // ============================================
  
  /**
   * Get affiliate by discount code ID
   */
  async getAffiliateByDiscountCode(discountCodeId: string): Promise<Affiliate | undefined> {
    try {
      const q = query(
        collection(db, 'affiliates'),
        where('discountCodeId', '==', discountCodeId),
        where('status', '==', 'active')
      )
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) return undefined
      
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Affiliate
    } catch (error) {
      console.error('Error fetching affiliate:', error)
      return undefined
    }
  }
  
  /**
   * Update affiliate stats after a purchase
   */
  private async updateAffiliateStats(discountCodeId: string, orderValue: number, _discountAmount: number): Promise<void> {
    try {
      const affiliate = await this.getAffiliateByDiscountCode(discountCodeId)
      if (!affiliate) return
      
      // Calculate commission
      let commission = 0
      if (affiliate.commissionType === 'percentage') {
        commission = (orderValue * affiliate.commissionValue) / 100
      } else {
        commission = affiliate.commissionValue
      }
      
      // Update affiliate stats
      const affiliateRef = doc(db, 'affiliates', affiliate.id)
      await updateDoc(affiliateRef, {
        'stats.totalOrders': increment(1),
        'stats.totalRevenue': increment(orderValue),
        'stats.totalCommission': increment(commission),
        'stats.pendingCommission': increment(commission),
        'stats.lastOrderDate': Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating affiliate stats:', error)
    }
  }
}

export const firebaseDiscountService = new FirebaseDiscountService()