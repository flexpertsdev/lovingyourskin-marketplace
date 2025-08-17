import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../../lib/firebase/config'
import { PreorderCampaign, Preorder, PreorderStats } from '../../types/preorder'

const CAMPAIGNS_COLLECTION = 'preorderCampaigns'
const PREORDERS_COLLECTION = 'preorders'

class PreorderService {
  // Campaign Management
  async createCampaign(campaign: Omit<PreorderCampaign, 'id' | 'createdAt' | 'lastUpdated'>): Promise<PreorderCampaign> {
    try {
      const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), {
        ...campaign,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      })
      
      const newCampaign = await this.getCampaign(docRef.id)
      if (!newCampaign) throw new Error('Failed to create campaign')
      
      return newCampaign
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw error
    }
  }

  async updateCampaign(id: string, updates: Partial<PreorderCampaign>): Promise<void> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id)
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating campaign:', error)
      throw error
    }
  }

  async getCampaign(id: string): Promise<PreorderCampaign | null> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as PreorderCampaign
      }
      return null
    } catch (error) {
      console.error('Error getting campaign:', error)
      throw error
    }
  }

  async getCampaigns(status?: PreorderCampaign['status']): Promise<PreorderCampaign[]> {
    try {
      let q = query(collection(db, CAMPAIGNS_COLLECTION), orderBy('createdAt', 'desc'))
      
      if (status) {
        q = query(collection(db, CAMPAIGNS_COLLECTION), 
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        )
      }
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PreorderCampaign))
    } catch (error) {
      console.error('Error getting campaigns:', error)
      throw error
    }
  }

  async getActiveCampaign(): Promise<PreorderCampaign | null> {
    try {
      const now = Timestamp.now()
      const q = query(
        collection(db, CAMPAIGNS_COLLECTION),
        where('status', '==', 'active'),
        where('startDate', '<=', now),
        where('endDate', '>=', now),
        limit(1)
      )
      
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) return null
      
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as PreorderCampaign
    } catch (error) {
      console.error('Error getting active campaign:', error)
      return null
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, CAMPAIGNS_COLLECTION, id))
    } catch (error) {
      console.error('Error deleting campaign:', error)
      throw error
    }
  }

  // Product Management for Campaigns
  async updateCampaignProducts(campaignId: string, productIds: string[]): Promise<void> {
    try {
      await this.updateCampaign(campaignId, {
        availableProducts: productIds
      })
    } catch (error) {
      console.error('Error updating campaign products:', error)
      throw error
    }
  }

  // Pre-order Management
  async createPreorder(orderData: {
    campaignId: string
    items: any[]
    shippingAddress: any
    paymentMethod: string
    totalAmount: number
  }): Promise<Preorder> {
    try {
      // Get campaign details
      const campaign = await this.getCampaign(orderData.campaignId)
      if (!campaign) throw new Error('Campaign not found')

      // Calculate totals
      const discountAmount = orderData.totalAmount * (campaign.discountPercentage / 100)
      const finalAmount = orderData.totalAmount - discountAmount

      // Calculate estimated delivery (preorder date + delivery timeframe)
      const preorderDate = campaign.preorderDate
      const estimatedDelivery = new Date(preorderDate.toDate())
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 21) // 3 weeks

      const preorder: Omit<Preorder, 'id'> = {
        campaignId: orderData.campaignId,
        campaignName: campaign.name,
        userId: '', // Will be set from auth context
        userEmail: '', // Will be set from auth context
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        discountAmount,
        finalAmount,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        placedAt: serverTimestamp(),
        preorderDate: campaign.preorderDate,
        estimatedDelivery: Timestamp.fromDate(estimatedDelivery)
      }

      const docRef = await addDoc(collection(db, PREORDERS_COLLECTION), preorder)
      
      return {
        id: docRef.id,
        ...preorder
      } as Preorder
    } catch (error) {
      console.error('Error creating preorder:', error)
      throw error
    }
  }

  async getPreorder(id: string): Promise<Preorder | null> {
    try {
      const docRef = doc(db, PREORDERS_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Preorder
      }
      return null
    } catch (error) {
      console.error('Error getting preorder:', error)
      throw error
    }
  }

  async getPreordersByCampaign(campaignId: string): Promise<Preorder[]> {
    try {
      const q = query(
        collection(db, PREORDERS_COLLECTION),
        where('campaignId', '==', campaignId),
        orderBy('placedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Preorder))
    } catch (error) {
      console.error('Error getting campaign preorders:', error)
      throw error
    }
  }

  async getUserPreorders(userId: string): Promise<Preorder[]> {
    try {
      const q = query(
        collection(db, PREORDERS_COLLECTION),
        where('userId', '==', userId),
        orderBy('placedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Preorder))
    } catch (error) {
      console.error('Error getting user preorders:', error)
      throw error
    }
  }

  async updatePreorderStatus(id: string, status: Preorder['status']): Promise<void> {
    try {
      const updates: any = { status }
      
      // Add timestamp for status changes
      if (status === 'processed') {
        updates.processedAt = serverTimestamp()
      } else if (status === 'shipped') {
        updates.shippedAt = serverTimestamp()
      } else if (status === 'delivered') {
        updates.deliveredAt = serverTimestamp()
      }
      
      await updateDoc(doc(db, PREORDERS_COLLECTION, id), updates)
    } catch (error) {
      console.error('Error updating preorder status:', error)
      throw error
    }
  }

  // Statistics
  async getCampaignStats(campaignId: string): Promise<PreorderStats> {
    try {
      const preorders = await this.getPreordersByCampaign(campaignId)
      
      // Calculate statistics
      const stats: PreorderStats = {
        campaignId,
        totalOrders: preorders.length,
        totalRevenue: 0,
        averageOrderValue: 0,
        topProducts: [],
        ordersByStatus: {
          pending: 0,
          processing: 0,
          processed: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        }
      }

      // Product aggregation map
      const productMap = new Map<string, {
        productName: string
        quantity: number
        revenue: number
      }>()

      preorders.forEach(order => {
        // Total revenue (only count paid orders)
        if (order.paymentStatus === 'paid') {
          stats.totalRevenue += order.finalAmount
        }

        // Status count
        stats.ordersByStatus[order.status]++

        // Product aggregation
        order.items.forEach(item => {
          const existing = productMap.get(item.productId) || {
            productName: item.product.name,
            quantity: 0,
            revenue: 0
          }
          
          existing.quantity += item.quantity
          existing.revenue += item.discountedPrice * item.quantity
          
          productMap.set(item.productId, existing)
        })
      })

      // Calculate average order value
      if (stats.totalOrders > 0) {
        stats.averageOrderValue = stats.totalRevenue / stats.totalOrders
      }

      // Get top products (top 10)
      stats.topProducts = Array.from(productMap.entries())
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      return stats
    } catch (error) {
      console.error('Error calculating campaign stats:', error)
      throw error
    }
  }

  // Process pre-orders when campaign date arrives
  async processPreorders(campaignId: string): Promise<void> {
    try {
      const preorders = await this.getPreordersByCampaign(campaignId)
      
      // Process each paid pre-order
      for (const preorder of preorders) {
        if (preorder.paymentStatus === 'paid' && preorder.status === 'pending') {
          await this.updatePreorderStatus(preorder.id, 'processing')
          // Here you would integrate with order fulfillment system
        }
      }
      
      // Update campaign status
      await this.updateCampaign(campaignId, { status: 'completed' })
    } catch (error) {
      console.error('Error processing preorders:', error)
      throw error
    }
  }
}

export const firebasePreorderService = new PreorderService()