import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Container, Section, Grid } from '../../components/layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '../../components/ui'
import { useAuthStore } from '../../stores/auth.store'
import { orderService, brandService } from '../../services'
import { Order, Brand } from '../../types'
import { Package, TrendingUp, Clock, Truck, CreditCard, Users, Eye } from 'lucide-react'

interface BrandMetrics {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalRetailers: number
  recentOrders: Order[]
  topRetailers: Array<{ retailerId: string; retailerName: string; orderCount: number; totalSpent: number }>
  topProducts: Array<{ productId: string; productName: string; quantity: number; revenue: number }>
}

export const BrandDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [metrics, setMetrics] = useState<BrandMetrics>({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalRetailers: 0,
    recentOrders: [],
    topRetailers: [],
    topProducts: []
  })
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.brandId || user?.companyId) {
      loadBrandData()
    }
  }, [user])

  const loadBrandData = async () => {
    try {
      setLoading(true)
      
      // Get brand info
      const brandId = user?.brandId || user?.companyId || ''
      const brands = await brandService.getBrands()
      const userBrand = brands.find(b => b.id === brandId)
      if (userBrand) {
        setBrand(userBrand)
      }
      
      // Get all orders for this brand
      const allOrders = await orderService.getOrders()
      const brandOrders = allOrders.filter(order => 
        order.brandId === brandId && order.userType === 'retailer'
      )
      
      // Calculate metrics
      const pendingOrders = brandOrders.filter(o => 
        ['pending', 'confirmed'].includes(o.status)
      )
      const processingOrders = brandOrders.filter(o => 
        ['processing', 'invoiced', 'paid', 'preparing', 'shipped'].includes(o.status)
      )
      const completedOrders = brandOrders.filter(o => 
        ['delivered', 'completed'].includes(o.status)
      )
      
      const totalRevenue = brandOrders.reduce((sum, order) => 
        sum + (order.totalAmount?.total || 0), 0
      )
      
      // Group by retailer
      const retailerMap = new Map<string, { retailerName: string; orderCount: number; totalSpent: number }>()
      const uniqueRetailers = new Set<string>()
      
      brandOrders.forEach(order => {
        if (order.retailerId) uniqueRetailers.add(order.retailerId)
        const existing = retailerMap.get(order.retailerId || '') || {
          retailerName: order.retailerName || 'Unknown Retailer',
          orderCount: 0,
          totalSpent: 0
        }
        existing.orderCount++
        existing.totalSpent += order.totalAmount?.total || 0
        if (order.retailerId) retailerMap.set(order.retailerId, existing)
      })
      
      const topRetailers = Array.from(retailerMap.entries())
        .map(([retailerId, data]) => ({ retailerId, ...data }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
      
      // Group by product
      const productMap = new Map<string, { productName: string; quantity: number; revenue: number }>()
      brandOrders.forEach(order => {
        order.items.forEach(item => {
          const productId = item.product?.id || ''
          const existing = productMap.get(productId) || {
            productName: item.product?.name || 'Unknown Product',
            quantity: 0,
            revenue: 0
          }
          existing.quantity += item.quantity
          existing.revenue += item.quantity * item.pricePerItem
          productMap.set(productId, existing)
        })
      })
      
      const topProducts = Array.from(productMap.entries())
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
      
      setMetrics({
        totalOrders: brandOrders.length,
        pendingOrders: pendingOrders.length,
        processingOrders: processingOrders.length,
        completedOrders: completedOrders.length,
        totalRevenue,
        averageOrderValue: brandOrders.length > 0 ? totalRevenue / brandOrders.length : 0,
        totalRetailers: uniqueRetailers.size,
        recentOrders: brandOrders.slice(0, 5),
        topRetailers,
        topProducts
      })
    } catch (error) {
      console.error('Failed to load brand data:', error)
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
            <div className="text-center py-20">Loading brand dashboard...</div>
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
            <h1 className="text-3xl font-light mb-2">Brand Dashboard</h1>
            <p className="text-text-secondary">
              Welcome back! Manage your B2B orders and track retailer relationships.
            </p>
            {brand && (
              <div className="mt-4 flex items-center gap-4">
                <h2 className="text-xl font-medium">{brand.name}</h2>
                {brand.isExclusivePartner && (
                  <Badge className="bg-gold text-white">Exclusive Partner</Badge>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 mb-8">
            <Button onClick={() => navigate('/brand/orders')}>
              View All Orders
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/brands/${user?.brandId || user?.companyId}`)}>
              View My Catalog
            </Button>
            <Button variant="secondary" onClick={() => navigate('/brand/products')}>
              Manage Products
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
                    <p className="text-sm text-text-secondary mb-1">Pending Review</p>
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
                    <p className="text-sm text-text-secondary mb-1">Processing</p>
                    <p className="text-2xl font-semibold">{metrics.processingOrders}</p>
                  </div>
                  <Truck className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Revenue</p>
                    <p className="text-2xl font-semibold">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-rose-gold opacity-50" />
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Secondary Metrics */}
          <Grid cols={3} gap="md" className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Active Retailers</p>
                    <p className="text-2xl font-semibold">{metrics.totalRetailers}</p>
                    <p className="text-xs text-text-secondary mt-1">Partner stores</p>
                  </div>
                  <Users className="w-8 h-8 text-indigo-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Avg Order Value</p>
                    <p className="text-2xl font-semibold">{formatCurrency(metrics.averageOrderValue)}</p>
                    <p className="text-xs text-text-secondary mt-1">Per order</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Products Listed</p>
                    <p className="text-2xl font-semibold">{brand?.productCount || 0}</p>
                    <p className="text-xs text-text-secondary mt-1">Active items</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Received */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders Received</CardTitle>
                <CardDescription>Latest B2B orders from retailers</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.recentOrders.map(order => (
                      <div 
                        key={order.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/brand/orders/${order.id}`)}
                      >
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-text-secondary">
                            {order.retailerName || 'Retailer'} • {formatDate(order.createdAt)}
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
                    <p className="text-text-secondary">No orders received yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Retailers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Retailers</CardTitle>
                <CardDescription>Your biggest customers</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.topRetailers.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.topRetailers.map((retailer, index) => (
                      <div key={retailer.retailerId} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-light text-text-secondary">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{retailer.retailerName}</p>
                            <p className="text-sm text-text-secondary">
                              {retailer.orderCount} {retailer.orderCount === 1 ? 'order' : 'orders'}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">{formatCurrency(retailer.totalSpent)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-text-secondary py-8">
                    No retailer data yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Best Selling Products</CardTitle>
                <CardDescription>Your most popular items</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.topProducts.map((product, index) => (
                      <div key={product.productId} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-light text-text-secondary">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{product.productName}</p>
                            <p className="text-sm text-text-secondary">
                              {product.quantity} units sold
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-sm">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-text-secondary py-8">
                    No sales data yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Brand Info */}
            {brand && (
              <Card>
                <CardHeader>
                  <CardTitle>Brand Information</CardTitle>
                  <CardDescription>Your brand profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-text-secondary">Categories:</dt>
                      <dd className="font-medium text-sm">{brand.categories.join(', ')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-secondary">Min. Order:</dt>
                      <dd className="font-medium">{brand.minimumOrder} units</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-secondary">Products:</dt>
                      <dd className="font-medium">{brand.productCount} items</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-secondary">Status:</dt>
                      <dd>
                        <Badge className="bg-success-green text-white">Active</Badge>
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-text-secondary mb-3">Certifications:</p>
                    <div className="flex flex-wrap gap-1">
                      {brand.certifications.map((cert, i) => (
                        <Badge key={i} variant="default" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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