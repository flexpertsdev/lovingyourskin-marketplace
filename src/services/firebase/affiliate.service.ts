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
import { AffiliateCode, AffiliateTracking, AffiliateStats } from '../../types/affiliate'

class FirebaseAffiliateService {
  // ============================================
  // AFFILIATE CODE OPERATIONS
  // ============================================
  
  // Create affiliate code
  async createAffiliateCode(data: Omit<AffiliateCode, 'id' | 'currentUses' | 'totalRevenue' | 'totalOrders' | 'totalCustomers' | 'createdAt' | 'updatedAt'>): Promise<AffiliateCode> {
    try {
      // Check if code already exists
      const existingCode = await this.getAffiliateCodeByCode(data.code)
      if (existingCode) {
        throw new Error('Affiliate code already exists')
      }
      
      const docRef = await addDoc(collection(db, 'affiliateCodes'), {
        ...data,
        currentUses: 0,
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        validFrom: Timestamp.fromDate(data.validFrom),
        validUntil: data.validUntil ? Timestamp.fromDate(data.validUntil) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      const newDoc = await getDoc(docRef)
      return { id: newDoc.id, ...newDoc.data() } as AffiliateCode
    } catch (error) {
      console.error('Error creating affiliate code:', error)
      throw error
    }
  }
  
  // Get affiliate code by code string
  async getAffiliateCodeByCode(code: string): Promise<AffiliateCode | null> {
    try {
      const q = query(
        collection(db, 'affiliateCodes'),
        where('code', '==', code.toUpperCase())
      )
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as AffiliateCode
    } catch (error) {
      console.error('Error fetching affiliate code:', error)
      throw error
    }
  }
  
  // Get affiliate code by ID
  async getAffiliateCode(id: string): Promise<AffiliateCode | null> {
    try {
      const docRef = doc(db, 'affiliateCodes', id)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) return null
      
      return { id: docSnap.id, ...docSnap.data() } as AffiliateCode
    } catch (error) {
      console.error('Error fetching affiliate code:', error)
      throw error
    }
  }
  
  // Get all affiliate codes
  async getAllAffiliateCodes(): Promise<AffiliateCode[]> {
    try {
      const q = query(
        collection(db, 'affiliateCodes'),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AffiliateCode[]
    } catch (error) {
      console.error('Error fetching affiliate codes:', error)
      throw error
    }
  }
  
  // Update affiliate code
  async updateAffiliateCode(id: string, updates: Partial<AffiliateCode>): Promise<void> {
    try {
      const docRef = doc(db, 'affiliateCodes', id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating affiliate code:', error)
      throw error
    }
  }
  
  // Delete affiliate code
  async deleteAffiliateCode(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'affiliateCodes', id))
    } catch (error) {
      console.error('Error deleting affiliate code:', error)
      throw error
    }
  }
  
  // Validate affiliate code
  async validateAffiliateCode(code: string): Promise<{ valid: boolean; affiliateCode?: AffiliateCode; error?: string }> {
    try {
      const affiliateCode = await this.getAffiliateCodeByCode(code)
      
      if (!affiliateCode) {
        return { valid: false, error: 'Invalid affiliate code' }
      }
      
      if (!affiliateCode.active) {
        return { valid: false, error: 'Affiliate code is inactive' }
      }
      
      const now = new Date()
      const validFrom = affiliateCode.validFrom.toDate()
      const validUntil = affiliateCode.validUntil?.toDate()
      
      if (now < validFrom) {
        return { valid: false, error: 'Affiliate code is not yet valid' }
      }
      
      if (validUntil && now > validUntil) {
        return { valid: false, error: 'Affiliate code has expired' }
      }
      
      if (affiliateCode.maxUses && affiliateCode.currentUses >= affiliateCode.maxUses) {
        return { valid: false, error: 'Affiliate code usage limit reached' }
      }
      
      return { valid: true, affiliateCode }
    } catch (error) {
      console.error('Error validating affiliate code:', error)
      return { valid: false, error: 'Error validating code' }
    }
  }
  
  // ============================================
  // TRACKING OPERATIONS
  // ============================================
  
  // Track affiliate click/visit
  async trackAffiliateClick(data: Omit<AffiliateTracking, 'id' | 'status' | 'clickedAt'>): Promise<AffiliateTracking> {
    try {
      const docRef = await addDoc(collection(db, 'affiliateTracking'), {
        ...data,
        status: 'clicked',
        clickedAt: Timestamp.now()
      })
      
      const newDoc = await getDoc(docRef)
      return { id: newDoc.id, ...newDoc.data() } as AffiliateTracking
    } catch (error) {
      console.error('Error tracking affiliate click:', error)
      throw error
    }
  }
  
  // Update tracking status
  async updateTrackingStatus(
    sessionId: string, 
    status: 'added_to_cart' | 'purchased' | 'refunded',
    additionalData?: Partial<AffiliateTracking>
  ): Promise<void> {
    try {
      const q = query(
        collection(db, 'affiliateTracking'),
        where('sessionId', '==', sessionId)
      )
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) return
      
      const doc = snapshot.docs[0]
      const updates: any = {
        status,
        ...additionalData
      }
      
      // Add timestamp based on status
      if (status === 'added_to_cart') {
        updates.addedToCartAt = Timestamp.now()
      } else if (status === 'purchased') {
        updates.purchasedAt = Timestamp.now()
      } else if (status === 'refunded') {
        updates.refundedAt = Timestamp.now()
      }
      
      await updateDoc(doc.ref, updates)
      
      // Update affiliate code stats if purchased
      if (status === 'purchased' && additionalData?.orderValue) {
        const tracking = doc.data() as AffiliateTracking
        await this.updateAffiliateCodeStats(
          tracking.affiliateCodeId,
          additionalData.orderValue,
          additionalData.commission || 0
        )
      }
    } catch (error) {
      console.error('Error updating tracking status:', error)
      throw error
    }
  }
  
  // Update affiliate code stats after purchase
  private async updateAffiliateCodeStats(
    affiliateCodeId: string, 
    orderValue: number,
    commission: number
  ): Promise<void> {
    try {
      const docRef = doc(db, 'affiliateCodes', affiliateCodeId)
      await updateDoc(docRef, {
        currentUses: increment(1),
        totalRevenue: increment(orderValue),
        totalOrders: increment(1),
        totalCustomers: increment(1), // This should be unique, but simplified for now
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating affiliate code stats:', error)
      throw error
    }
  }
  
  // ============================================
  // ANALYTICS OPERATIONS
  // ============================================
  
  // Get affiliate stats
  async getAffiliateStats(affiliateCodeId: string, period: AffiliateStats['period'] = 'all'): Promise<AffiliateStats> {
    try {
      // Calculate date range based on period
      const now = new Date()
      let startDate = new Date(0) // Beginning of time
      
      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
      }
      
      // Query tracking data
      const q = query(
        collection(db, 'affiliateTracking'),
        where('affiliateCodeId', '==', affiliateCodeId),
        where('clickedAt', '>=', Timestamp.fromDate(startDate))
      )
      
      const snapshot = await getDocs(q)
      const trackingData = snapshot.docs.map(doc => doc.data() as AffiliateTracking)
      
      // Calculate stats
      const clicks = trackingData.length
      const uniqueVisitors = new Set(trackingData.map(t => t.sessionId)).size
      const cartsCreated = trackingData.filter(t => t.status === 'added_to_cart' || t.status === 'purchased').length
      const orders = trackingData.filter(t => t.status === 'purchased').length
      const conversionRate = clicks > 0 ? (orders / clicks) * 100 : 0
      
      const totalRevenue = trackingData
        .filter(t => t.status === 'purchased')
        .reduce((sum, t) => sum + (t.orderValue || 0), 0)
      
      const totalCommission = trackingData
        .filter(t => t.status === 'purchased')
        .reduce((sum, t) => sum + (t.commission || 0), 0)
      
      const averageOrderValue = orders > 0 ? totalRevenue / orders : 0
      
      // Note: Top products and referrers would require additional queries
      // For now, returning empty arrays
      
      return {
        affiliateCodeId,
        period,
        clicks,
        uniqueVisitors,
        cartsCreated,
        orders,
        conversionRate,
        totalRevenue,
        totalCommission,
        averageOrderValue,
        topProducts: [],
        topReferrers: []
      }
    } catch (error) {
      console.error('Error getting affiliate stats:', error)
      throw error
    }
  }
  
  // Get tracking by session
  async getTrackingBySession(sessionId: string): Promise<AffiliateTracking | null> {
    try {
      const q = query(
        collection(db, 'affiliateTracking'),
        where('sessionId', '==', sessionId)
      )
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as AffiliateTracking
    } catch (error) {
      console.error('Error fetching tracking by session:', error)
      throw error
    }
  }
}

export const firebaseAffiliateService = new FirebaseAffiliateService()