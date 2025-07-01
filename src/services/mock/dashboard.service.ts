// Mock dashboard service with analytics and metrics
import { Order, Brand } from '../../types'
import { orderService } from './order.service'
import { productService } from './product.service'
import { cartService } from './cart.service'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface DashboardMetrics {
  activeOrders: number
  inTransitOrders: number
  cartItems: number
  totalSpent: number
  pendingInvoices: number
  recentOrders: Order[]
  featuredBrands: Brand[]
}

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
  status?: 'pending' | 'completed' | 'urgent'
}

// Mock recent activity
const mockRecentActivity: ActivityItem[] = [
  {
    id: 'activity-1',
    type: 'registration',
    title: 'New Retailer Registration',
    description: 'Beauty Boutique Ltd.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'completed'
  },
  {
    id: 'activity-2',
    type: 'order',
    title: 'Order #12345 Shipped',
    description: 'Innisfree',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    status: 'completed'
  },
  {
    id: 'activity-3',
    type: 'brand',
    title: 'New Brand Application',
    description: 'COSRX - Pending Review',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    status: 'pending'
  },
  {
    id: 'activity-4',
    type: 'message',
    title: 'Urgent: Payment Issue',
    description: 'Order #12344 - LANEIGE',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    status: 'urgent'
  },
  {
    id: 'activity-5',
    type: 'order',
    title: 'Large Order Placed',
    description: '£5,430 - Multiple Brands',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    status: 'completed'
  }
]

export const dashboardService = {
  // Get retailer dashboard metrics
  getRetailerMetrics: async (_userId: string): Promise<DashboardMetrics> => {
    await delay(300)
    
    // Get user's orders
    const orders = await orderService.getOrders()
    const activeOrders = orders.filter(o => 
      ['pending', 'confirmed', 'processing', 'invoiced', 'paid', 'preparing'].includes(o.status)
    )
    const inTransitOrders = orders.filter(o => o.status === 'shipped')
    
    // Get cart items
    const cart = await cartService.getCart()
    const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    
    // Calculate total spent
    const totalSpent = orders
      .filter(o => ['paid', 'shipped', 'delivered', 'completed'].includes(o.status))
      .reduce((sum, order) => sum + order.totalAmount.total, 0)
    
    // Get pending invoices
    const pendingInvoices = orders.filter(o => o.status === 'invoiced').length
    
    // Get featured brands
    const brands = await productService.getBrands()
    const featuredBrands = brands.filter(b => b.featured).slice(0, 4)
    
    return {
      activeOrders: activeOrders.length,
      inTransitOrders: inTransitOrders.length,
      cartItems: cartItemCount,
      totalSpent,
      pendingInvoices,
      recentOrders: orders.slice(0, 5),
      featuredBrands
    }
  },
  
  // Get admin dashboard metrics
  getAdminMetrics: async (): Promise<AdminMetrics> => {
    await delay(300)
    
    // Mock aggregated data
    const totalOrders = 47
    const lastWeekOrders = 42
    const weeklyGrowth = ((totalOrders - lastWeekOrders) / lastWeekOrders) * 100
    
    return {
      totalOrders,
      totalRetailers: 234,
      activeBrands: 89,
      unreadMessages: 12,
      weeklyGrowth,
      pendingInvites: 15,
      newBrandsThisMonth: 3,
      urgentMessages: 5,
      recentActivity: mockRecentActivity
    }
  },
  
  // Get sales analytics
  getSalesAnalytics: async (period: 'week' | 'month' | 'year' = 'month'): Promise<{
    labels: string[]
    datasets: {
      label: string
      data: number[]
      color: string
    }[]
  }> => {
    await delay(200)
    
    // Mock sales data
    const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const monthlyData = [24500, 28300, 32100, 29800, 35200, 38900]
    
    const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const weeklyData = [3200, 4100, 3800, 4500, 5200, 6100, 4300]
    
    const yearlyLabels = ['2021', '2022', '2023', '2024']
    const yearlyData = [185000, 245000, 312000, 198000] // 2024 is partial
    
    const periodData = {
      week: { labels: weeklyLabels, data: weeklyData },
      month: { labels: monthlyLabels, data: monthlyData },
      year: { labels: yearlyLabels, data: yearlyData }
    }
    
    return {
      labels: periodData[period].labels,
      datasets: [{
        label: 'Sales (£)',
        data: periodData[period].data,
        color: '#D4A5A5'
      }]
    }
  },
  
  // Get brand performance
  getBrandPerformance: async (): Promise<{
    brandId: string
    brandName: string
    orders: number
    revenue: number
    growth: number
  }[]> => {
    await delay(200)
    
    return [
      { brandId: 'innisfree', brandName: 'INNISFREE', orders: 124, revenue: 45230, growth: 15.2 },
      { brandId: 'laneige', brandName: 'LANEIGE', orders: 98, revenue: 38900, growth: 8.7 },
      { brandId: 'etude', brandName: 'ETUDE', orders: 87, revenue: 31200, growth: -2.3 },
      { brandId: 'cosrx', brandName: 'COSRX', orders: 76, revenue: 28700, growth: 22.1 },
      { brandId: 'missha', brandName: 'MISSHA', orders: 65, revenue: 24500, growth: 11.3 }
    ]
  },
  
  // Get order status distribution
  getOrderStatusDistribution: async (): Promise<{
    status: string
    count: number
    percentage: number
  }[]> => {
    await delay(200)
    
    return [
      { status: 'Completed', count: 156, percentage: 66.7 },
      { status: 'In Transit', count: 28, percentage: 12.0 },
      { status: 'Processing', count: 23, percentage: 9.8 },
      { status: 'Pending', count: 15, percentage: 6.4 },
      { status: 'Invoiced', count: 12, percentage: 5.1 }
    ]
  },
  
  // Get quick actions based on user role
  getQuickActions: async (userRole: 'retailer' | 'admin'): Promise<{
    label: string
    icon: string
    action: string
    badge?: number
  }[]> => {
    await delay(100)
    
    if (userRole === 'retailer') {
      return [
        { label: 'View Cart', icon: '🛒', action: '/cart', badge: 7 },
        { label: 'Track Orders', icon: '📦', action: '/orders' },
        { label: 'Browse Brands', icon: '🏪', action: '/brands' },
        { label: 'Messages', icon: '💬', action: '/messages', badge: 3 }
      ]
    }
    
    return [
      { label: 'Pending Orders', icon: '📋', action: '/admin/orders?status=pending', badge: 15 },
      { label: 'Messages', icon: '💬', action: '/admin/messages', badge: 12 },
      { label: 'New Retailers', icon: '👥', action: '/admin/retailers?status=new', badge: 5 },
      { label: 'Brand Applications', icon: '🏢', action: '/admin/brands?status=pending', badge: 3 }
    ]
  }
}