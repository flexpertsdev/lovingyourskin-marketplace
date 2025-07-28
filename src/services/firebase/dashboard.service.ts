import { 
  collection, 
  query, 
  where, 
  orderBy,
  getDocs,
  Timestamp,
  limit
} from 'firebase/firestore'
import { db } from '../../lib/firebase/config'
import { Order, Brand, User, Product } from '../../types'

// Define admin metrics interface
export interface AdminMetrics {
  totalOrders: number
  totalRetailers: number
  activeBrands: number
  unreadMessages: number
  weeklyGrowth: number
  pendingInvites: number
  newBrandsThisMonth: number
  urgentMessages: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'registration' | 'order' | 'brand' | 'message'
  title: string
  description: string
  timestamp: Date
  userId?: string
  link?: string
}

// Dashboard analytics service
class FirebaseDashboardService {
  // ============================================
  // ADMIN METRICS
  // ============================================
  
  // Get admin dashboard metrics (main dashboard method)
  async getAdminMetrics(): Promise<AdminMetrics> {
    try {
      // Get various counts in parallel
      const [
        ordersSnapshot,
        retailersSnapshot,
        brandsSnapshot,
        messagesSnapshot,
        invitesSnapshot,
        recentActivity
      ] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'retailer'))),
        getDocs(query(collection(db, 'brands'), where('active', '==', true))),
        getDocs(query(collection(db, 'messages'), where('status', '==', 'unread'))),
        getDocs(query(collection(db, 'invites'), where('status', '==', 'pending'))),
        this.getRecentActivity(10)
      ])
      
      const totalOrders = ordersSnapshot.size
      const totalRetailers = retailersSnapshot.size
      const activeBrands = brandsSnapshot.size
      const unreadMessages = messagesSnapshot.size
      const pendingInvites = invitesSnapshot.size
      
      // Calculate weekly growth
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const lastWeekOrdersSnapshot = await getDocs(
        query(
          collection(db, 'orders'),
          where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo))
        )
      )
      
      const currentWeekOrders = lastWeekOrdersSnapshot.size
      const previousWeekOrders = totalOrders - currentWeekOrders
      const weeklyGrowth = previousWeekOrders > 0 
        ? ((currentWeekOrders - previousWeekOrders) / previousWeekOrders) * 100 
        : 0
      
      // Count new brands this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const newBrandsSnapshot = await getDocs(
        query(
          collection(db, 'brands'),
          where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
        )
      )
      const newBrandsThisMonth = newBrandsSnapshot.size
      
      // Count urgent messages
      const urgentMessagesSnapshot = await getDocs(
        query(
          collection(db, 'messages'),
          where('priority', '==', 'urgent'),
          where('status', '==', 'unread')
        )
      )
      const urgentMessages = urgentMessagesSnapshot.size
      
      return {
        totalOrders,
        totalRetailers,
        activeBrands,
        unreadMessages,
        weeklyGrowth,
        pendingInvites,
        newBrandsThisMonth,
        urgentMessages,
        recentActivity
      }
    } catch (error) {
      console.error('Error fetching admin metrics:', error)
      throw new Error('Failed to fetch admin metrics')
    }
  }
  
  // Get recent activity items
  async getRecentActivity(limitCount: number = 10): Promise<ActivityItem[]> {
    try {
      // Fetch recent items from various collections
      const [recentOrders, recentMessages, recentUsers] = await Promise.all([
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5))),
        getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(5))),
        getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5)))
      ])
      
      const activities: ActivityItem[] = []
      
      // Add recent orders
      recentOrders.docs.forEach(doc => {
        const order = doc.data() as Order
        activities.push({
          id: doc.id,
          type: 'order',
          title: `New order #${order.orderNumber}`,
          description: `Order from ${order.shippingAddress.company} - £${order.totalAmount.total.toFixed(2)}`,
          timestamp: order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt),
          userId: order.retailerId,
          link: `/admin/orders/${doc.id}`
        })
      })
      
      // Add recent messages
      recentMessages.docs.forEach(doc => {
        const message = doc.data()
        activities.push({
          id: doc.id,
          type: 'message',
          title: `New message from ${message.senderName || 'Unknown'}`,
          description: message.content.substring(0, 100) + '...',
          timestamp: message.createdAt.toDate(),
          userId: message.senderId,
          link: `/admin/messages/${doc.id}`
        })
      })
      
      // Add recent registrations
      recentUsers.docs.forEach(doc => {
        const user = doc.data() as User
        if (user.role === 'retailer') {
          activities.push({
            id: doc.id,
            type: 'registration',
            title: `New retailer registered`,
            description: `${user.name} - ${user.email}`,
            timestamp: user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt),
            userId: doc.id,
            link: `/admin/users/${doc.id}`
          })
        }
      })
      
      // Sort all activities by timestamp and take the most recent
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limitCount)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }
  
  // ============================================
  // OVERVIEW STATS
  // ============================================
  
  // Get dashboard overview stats
  async getOverviewStats(filters?: {
    startDate?: Date
    endDate?: Date
    brandId?: string
    userId?: string
  }): Promise<{
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    pendingOrders: number
    processingOrders: number
    completedOrders: number
    growthRate: number
  }> {
    try {
      // Build query with filters
      let ordersQuery = query(collection(db, 'orders'))
      
      if (filters?.startDate) {
        ordersQuery = query(ordersQuery, where('createdAt', '>=', Timestamp.fromDate(filters.startDate)))
      }
      if (filters?.endDate) {
        ordersQuery = query(ordersQuery, where('createdAt', '<=', Timestamp.fromDate(filters.endDate)))
      }
      if (filters?.brandId) {
        ordersQuery = query(ordersQuery, where('brandId', '==', filters.brandId))
      }
      if (filters?.userId) {
        ordersQuery = query(ordersQuery, where('retailerId', '==', filters.userId))
      }
      
      const ordersSnapshot = await getDocs(ordersQuery)
      const orders = ordersSnapshot.docs.map(doc => doc.data() as Order)
      
      // Calculate stats
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount.total, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      
      // Count by status
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const processingOrders = orders.filter(o => ['confirmed', 'processing', 'invoiced', 'paid', 'preparing', 'shipped'].includes(o.status)).length
      const completedOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status)).length
      
      // Calculate growth rate (compare to previous period)
      let growthRate = 0
      if (filters?.startDate && filters?.endDate) {
        const periodLength = filters.endDate.getTime() - filters.startDate.getTime()
        const previousStart = new Date(filters.startDate.getTime() - periodLength)
        const previousEnd = filters.startDate
        
        const previousOrders = await this.getOrdersInPeriod(previousStart, previousEnd, filters?.brandId, filters?.userId)
        const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount.total, 0)
        
        if (previousRevenue > 0) {
          growthRate = ((totalRevenue - previousRevenue) / previousRevenue) * 100
        }
      }
      
      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        pendingOrders,
        processingOrders,
        completedOrders,
        growthRate
      }
    } catch (error) {
      console.error('Error fetching overview stats:', error)
      throw new Error('Failed to fetch overview statistics')
    }
  }
  
  // Helper to get orders in a specific period
  private async getOrdersInPeriod(
    startDate: Date, 
    endDate: Date, 
    brandId?: string, 
    userId?: string
  ): Promise<Order[]> {
    let ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate))
    )
    
    if (brandId) {
      ordersQuery = query(ordersQuery, where('brandId', '==', brandId))
    }
    if (userId) {
      ordersQuery = query(ordersQuery, where('retailerId', '==', userId))
    }
    
    const ordersSnapshot = await getDocs(ordersQuery)
    return ordersSnapshot.docs.map(doc => doc.data() as Order)
  }
  
  // ============================================
  // SALES ANALYTICS
  // ============================================
  
  // Get sales by period (daily, weekly, monthly)
  async getSalesByPeriod(
    period: 'day' | 'week' | 'month',
    startDate: Date,
    endDate: Date,
    brandId?: string
  ): Promise<{
    labels: string[]
    revenue: number[]
    orders: number[]
  }> {
    try {
      const orders = await this.getOrdersInPeriod(startDate, endDate, brandId)
      
      // Group orders by period
      const periodData = new Map<string, { revenue: number, count: number }>()
      
      orders.forEach(order => {
        const orderDate = order.createdAt instanceof Date ? order.createdAt : order.createdAt
        const periodKey = this.getPeriodKey(orderDate, period)
        
        const existing = periodData.get(periodKey) || { revenue: 0, count: 0 }
        periodData.set(periodKey, {
          revenue: existing.revenue + order.totalAmount.total,
          count: existing.count + 1
        })
      })
      
      // Convert to arrays for chart
      const sortedKeys = Array.from(periodData.keys()).sort()
      const labels = sortedKeys.map(key => this.formatPeriodLabel(key, period))
      const revenue = sortedKeys.map(key => periodData.get(key)?.revenue || 0)
      const orderCounts = sortedKeys.map(key => periodData.get(key)?.count || 0)
      
      return { labels, revenue, orders: orderCounts }
    } catch (error) {
      console.error('Error fetching sales by period:', error)
      throw new Error('Failed to fetch sales data')
    }
  }
  
  // Get period key for grouping
  private getPeriodKey(date: Date, period: 'day' | 'week' | 'month'): string {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    switch (period) {
      case 'day':
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      case 'week':
        const week = Math.ceil(day / 7)
        return `${year}-${month.toString().padStart(2, '0')}-W${week}`
      case 'month':
        return `${year}-${month.toString().padStart(2, '0')}`
    }
  }
  
  // Format period label for display
  private formatPeriodLabel(key: string, period: 'day' | 'week' | 'month'): string {
    const parts = key.split('-')
    
    switch (period) {
      case 'day':
        return `${parts[2]}/${parts[1]}`
      case 'week':
        return `${parts[2]} ${parts[1]}/${parts[0]}`
      case 'month':
        return `${parts[1]}/${parts[0]}`
    }
  }
  
  // ============================================
  // TOP PERFORMERS
  // ============================================
  
  // Get top selling products
  async getTopProducts(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
    brandId?: string
  ): Promise<{
    productId: string
    productName: string
    brandName: string
    quantity: number
    revenue: number
  }[]> {
    try {
      const orders = await this.getOrdersInPeriod(
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default 30 days
        endDate || new Date(),
        brandId
      )
      
      // Aggregate product sales
      const productSales = new Map<string, {
        productName: string
        brandName: string
        quantity: number
        revenue: number
      }>()
      
      orders.forEach(order => {
        order.items.forEach(item => {
          const existing = productSales.get(item.productId) || {
            productName: item.productName,
            brandName: order.brandName,
            quantity: 0,
            revenue: 0
          }
          
          productSales.set(item.productId, {
            productName: item.productName,
            brandName: order.brandName,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.totalPrice
          })
        })
      })
      
      // Sort by revenue and take top N
      return Array.from(productSales.entries())
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching top products:', error)
      throw new Error('Failed to fetch top products')
    }
  }
  
  // Get top brands
  async getTopBrands(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    brandId: string
    brandName: string
    orderCount: number
    revenue: number
  }[]> {
    try {
      const orders = await this.getOrdersInPeriod(
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default 30 days
        endDate || new Date()
      )
      
      // Aggregate brand sales
      const brandSales = new Map<string, {
        brandName: string
        orderCount: number
        revenue: number
      }>()
      
      orders.forEach(order => {
        const existing = brandSales.get(order.brandId) || {
          brandName: order.brandName,
          orderCount: 0,
          revenue: 0
        }
        
        brandSales.set(order.brandId, {
          brandName: order.brandName,
          orderCount: existing.orderCount + 1,
          revenue: existing.revenue + order.totalAmount.total
        })
      })
      
      // Sort by revenue and take top N
      return Array.from(brandSales.entries())
        .map(([brandId, data]) => ({ brandId, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching top brands:', error)
      throw new Error('Failed to fetch top brands')
    }
  }
  
  // Get top customers
  async getTopCustomers(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
    brandId?: string
  ): Promise<{
    userId: string
    userEmail: string
    companyName: string
    orderCount: number
    totalSpent: number
  }[]> {
    try {
      const orders = await this.getOrdersInPeriod(
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default 30 days
        endDate || new Date(),
        brandId
      )
      
      // Aggregate customer sales
      const customerSales = new Map<string, {
        userEmail: string
        companyName: string
        orderCount: number
        totalSpent: number
      }>()
      
      orders.forEach(order => {
        const existing = customerSales.get(order.retailerId || '') || {
          userEmail: order.retailerCompanyId, // Should fetch from user data
          companyName: order.shippingAddress.company,
          orderCount: 0,
          totalSpent: 0
        }
        
        customerSales.set(order.retailerId || '', {
          userEmail: existing.userEmail || '',
          companyName: existing.companyName || '',
          orderCount: existing.orderCount + 1,
          totalSpent: existing.totalSpent + order.totalAmount.total
        })
      })
      
      // Sort by total spent and take top N
      return Array.from(customerSales.entries())
        .map(([userId, data]) => ({ userId, ...data }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching top customers:', error)
      throw new Error('Failed to fetch top customers')
    }
  }
  
  // ============================================
  // RECENT ACTIVITY
  // ============================================
  
  // Get recent orders
  async getRecentOrders(
    limitCount: number = 10,
    brandId?: string,
    userId?: string
  ): Promise<Order[]> {
    try {
      let ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      if (brandId) {
        ordersQuery = query(ordersQuery, where('brandId', '==', brandId))
      }
      if (userId) {
        ordersQuery = query(ordersQuery, where('retailerId', '==', userId))
      }
      
      const ordersSnapshot = await getDocs(ordersQuery)
      return ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Order[]
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      throw new Error('Failed to fetch recent orders')
    }
  }
  
  // Get low stock products
  async getLowStockProducts(): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('active', '==', true),
        where('stockLevel', 'in', ['low', 'out'])
      )
      
      const productsSnapshot = await getDocs(productsQuery)
      return productsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as Product)
        .filter(() => {
          // Additional filtering based on actual stock numbers if available
          return true // Implement based on your stock tracking
        })
    } catch (error) {
      console.error('Error fetching low stock products:', error)
      throw new Error('Failed to fetch low stock products')
    }
  }
  
  // ============================================
  // CONVERSION METRICS
  // ============================================
  
  // Get conversion funnel data
  async getConversionFunnel(): Promise<{
    visits: number
    addedToCart: number
    checkoutStarted: number
    ordersCompleted: number
    conversionRate: number
  }> {
    try {
      // Note: This would require analytics tracking implementation
      // For now, returning mock data structure
      // In production, integrate with Google Analytics or similar
      
      return {
        visits: 0,
        addedToCart: 0,
        checkoutStarted: 0,
        ordersCompleted: 0,
        conversionRate: 0
      }
    } catch (error) {
      console.error('Error fetching conversion funnel:', error)
      throw new Error('Failed to fetch conversion data')
    }
  }

  // ============================================
  // RETAILER METRICS
  // ============================================
  
  // Get retailer dashboard metrics
  async getRetailerMetrics(retailerId: string): Promise<{
    activeOrders: number
    inTransitOrders: number
    cartItems: number
    totalSpent: number
    pendingInvoices: number
    recentOrders: Order[]
    featuredBrands: Brand[]
  }> {
    try {
      // Get retailer's orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('retailerId', '==', retailerId),
        orderBy('createdAt', 'desc')
      )
      
      const ordersSnapshot = await getDocs(ordersQuery)
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Order[]
      
      // Calculate metrics
      const activeOrders = orders.filter(o => 
        ['pending', 'confirmed', 'processing', 'invoiced', 'paid', 'preparing'].includes(o.status)
      ).length
      const inTransitOrders = orders.filter(o => o.status === 'shipped').length
      const pendingInvoices = orders.filter(o => o.status === 'invoiced').length
      
      // Calculate total spent (only paid/delivered orders)
      const totalSpent = orders
        .filter(o => ['paid', 'shipped', 'delivered', 'completed'].includes(o.status))
        .reduce((sum, order) => sum + order.totalAmount.total, 0)
      
      // Get recent orders (top 5)
      const recentOrders = orders.slice(0, 5)
      
      // Get featured brands
      const brandsQuery = query(
        collection(db, 'brands'),
        where('featured', '==', true),
        where('active', '==', true),
        limit(4)
      )
      
      const brandsSnapshot = await getDocs(brandsQuery)
      const featuredBrands = brandsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Brand[]
      
      // TODO: Get cart items count from cart service
      // For now, return 0 as cart is handled locally
      const cartItems = 0
      
      return {
        activeOrders,
        inTransitOrders,
        cartItems,
        totalSpent,
        pendingInvoices,
        recentOrders,
        featuredBrands
      }
    } catch (error) {
      console.error('Error fetching retailer metrics:', error)
      throw new Error('Failed to fetch retailer metrics')
    }
  }
}

export const firebaseDashboardService = new FirebaseDashboardService()