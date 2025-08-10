import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Container, Section, Grid } from '../../components/layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '../../components/ui'
import { useAuthStore } from '../../stores/auth.store'
import { orderService } from '../../services'
import { Order } from '../../types'
import { Package, Clock, Truck, CreditCard } from 'lucide-react'

interface RetailerMetrics {
  totalOrders: number
  pendingOrders: number
  inTransitOrders: number
  deliveredOrders: number
  totalSpent: number
  averageOrderValue: number
  recentOrders: Order[]
  topBrands: Array<{ brandId: string; brandName: string; orderCount: number; totalSpent: number }>
}

export const RetailerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [metrics, setMetrics] = useState<RetailerMetrics>({
    totalOrders: 0,
    pendingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    recentOrders: [],
    topBrands: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadRetailerData()
    }
  }, [user])

  const loadRetailerData = async () => {
    try {
      setLoading(true)
      
      // Get all orders for this retailer
      const allOrders = await orderService.getOrders()
      const retailerOrders = allOrders.filter(order => 
        order.retailerId === user?.id && order.userType === 'retailer'
      )
      
      // Calculate metrics
      const pendingOrders = retailerOrders.filter(o => 
        ['pending', 'confirmed', 'processing', 'invoiced'].includes(o.status)
      )
      const inTransitOrders = retailerOrders.filter(o => 
        ['preparing', 'shipped'].includes(o.status)
      )
      const deliveredOrders = retailerOrders.filter(o => 
        ['delivered', 'completed'].includes(o.status)
      )
      
      const totalSpent = retailerOrders.reduce((sum, order) => 
        sum + (order.totalAmount?.total || 0), 0
      )
      
      // Group by brand
      const brandMap = new Map<string, { brandName: string; orderCount: number; totalSpent: number }>()
      retailerOrders.forEach(order => {
        const existing = brandMap.get(order.brandId) || {
          brandName: order.brandName,
          orderCount: 0,
          totalSpent: 0
        }
        existing.orderCount++
        existing.totalSpent += order.totalAmount?.total || 0
        brandMap.set(order.brandId, existing)
      })
      
      const topBrands = Array.from(brandMap.entries())
        .map(([brandId, data]) => ({ brandId, ...data }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
      
      setMetrics({
        totalOrders: retailerOrders.length,
        pendingOrders: pendingOrders.length,
        inTransitOrders: inTransitOrders.length,
        deliveredOrders: deliveredOrders.length,
        totalSpent,
        averageOrderValue: retailerOrders.length > 0 ? totalSpent / retailerOrders.length : 0,
        recentOrders: retailerOrders.slice(0, 5),
        topBrands
      })
    } catch (error) {
      console.error('Failed to load retailer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout mode="b2b">
        <Section>
          <Container>
            <div className="text-center py-20">Loading retailer dashboard...</div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout mode="b2b">
      <Section>
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light mb-2">Retailer Dashboard</h1>
            <p className="text-text-secondary">
              Welcome back, {user?.name || user?.email}! Manage your B2B orders and track shipments.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 mb-8">
            <Button onClick={() => navigate('/brands')}>
              Browse Brands
            </Button>
            <Button variant="secondary" onClick={() => navigate('/retailer/orders')}>
              View All Orders
            </Button>
            <Button variant="secondary" onClick={() => navigate('/messages')}>
              Messages
            </Button>
          </div>

          {/* Metrics Grid */}
          <Grid cols={4} gap="md" className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Orders</p>
                    <p className="text-2xl font-semibold">{metrics.totalOrders}</p>
                  </div>
                  <Package className="w-8 h-8 text-rose-gold opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Pending Orders</p>
                    <p className="text-2xl font-semibold">{metrics.pendingOrders}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">In Transit</p>
                    <p className="text-2xl font-semibold">{metrics.inTransitOrders}</p>
                  </div>
                  <Truck className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Spent</p>
                    <p className="text-2xl font-semibold">{formatCurrency(metrics.totalSpent)}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-rose-gold opacity-50" />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest B2B purchase orders</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.recentOrders.map(order => (
                      <div 
                        key={order.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/retailer/orders/${order.id}`)}
                      >
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-text-secondary">
                            {order.brandName} • {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${statusColors[order.status]} text-white mb-1`}>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium">{formatCurrency(order.totalAmount.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-secondary mb-4">No orders yet</p>
                    <Button onClick={() => navigate('/brands')} size="small">
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Brands */}
            <Card>
              <CardHeader>
                <CardTitle>Your Top Brands</CardTitle>
                <CardDescription>Brands you purchase from most</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.topBrands.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.topBrands.map((brand, index) => (
                      <div key={brand.brandId} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-light text-text-secondary">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{brand.brandName}</p>
                            <p className="text-sm text-text-secondary">
                              {brand.orderCount} {brand.orderCount === 1 ? 'order' : 'orders'}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">{formatCurrency(brand.totalSpent)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-text-secondary py-8">
                    Start ordering to see your top brands
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}

const statusColors: Record<string, string> = {
  pending: 'bg-gray-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-yellow-500',
  invoiced: 'bg-purple-500',
  paid: 'bg-green-500',
  preparing: 'bg-orange-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-success-green',
  completed: 'bg-success-green'
}