import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section, Grid } from '../components/layout'
import { Card, CardContent, Button } from '../components/ui'
import { dashboardService } from '../services'
import { useAuthStore } from '../stores/auth.store'
import { BrandDashboard } from '../components/dashboard'
import type { DashboardMetrics } from '../services/firebase/dashboard.service'
import { getLocalizedString } from '../lib/utils/cn'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Check if user is a brand
  if (user?.role === 'brand') {
    return (
      <Layout>
        <BrandDashboard />
      </Layout>
    )
  }
  
  // Otherwise, load retailer dashboard
  useEffect(() => {
    if (user?.role === 'retailer' || user?.role === 'admin') {
      loadDashboard()
    }
  }, [user])
  
  const loadDashboard = async () => {
    setLoading(true)
    try {
      const data = await dashboardService.getRetailerMetrics(user?.id || 'user-1')
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading || !metrics) {
    return (
      <Layout>
        <Section>
          <Container>
            <div className="text-center py-20">Loading dashboard...</div>
          </Container>
        </Section>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <Section>
        <Container>
          <h1 className="text-3xl font-light mb-8">Welcome back!</h1>
          
          {/* Key Metrics */}
          <Grid cols={4} gap="md" className="mb-10">
            <Card className="text-center">
              <CardContent className="py-8">
                <p className="text-sm text-text-secondary mb-2">Active Orders</p>
                <p className="text-4xl font-light text-deep-charcoal">{metrics.activeOrders}</p>
                {metrics.activeOrders > 0 && (
                  <Button 
                    variant="ghost" 
                    size="small" 
                    className="mt-3"
                    onClick={() => navigate('/orders?status=active')}
                  >
                    View Orders →
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="py-8">
                <p className="text-sm text-text-secondary mb-2">In Transit</p>
                <p className="text-4xl font-light text-deep-charcoal">{metrics.inTransitOrders}</p>
                {metrics.inTransitOrders > 0 && (
                  <Button 
                    variant="ghost" 
                    size="small" 
                    className="mt-3"
                    onClick={() => navigate('/orders?status=shipped')}
                  >
                    Track Shipments →
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="py-8">
                <p className="text-sm text-text-secondary mb-2">Cart Items</p>
                <p className="text-4xl font-light text-deep-charcoal">{metrics.cartItems}</p>
                {metrics.cartItems > 0 && (
                  <Button 
                    variant="ghost" 
                    size="small" 
                    className="mt-3"
                    onClick={() => navigate('/cart')}
                  >
                    View Cart →
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="py-8">
                <p className="text-sm text-text-secondary mb-2">Pending Invoices</p>
                <p className="text-4xl font-light text-deep-charcoal">{metrics.pendingInvoices}</p>
                {metrics.pendingInvoices > 0 && (
                  <p className="text-warning-amber text-sm mt-2">Action Required</p>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Quick Actions */}
          <div className="mb-10">
            <h2 className="text-xl font-light mb-4">Quick Actions</h2>
            <Grid cols={4} gap="md">
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => navigate('/brands')}
              >
                🏪 Browse Brands
              </Button>
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => navigate('/cart')}
              >
                🛒 View Cart ({metrics.cartItems})
              </Button>
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => navigate('/orders')}
              >
                📦 Track Orders
              </Button>
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => navigate('/messages')}
              >
                💬 Messages
              </Button>
            </Grid>
          </div>
          
          {/* Featured Brands */}
          <div>
            <h2 className="text-xl font-light mb-6">Featured Brands</h2>
            <Grid cols={4} gap="md">
              {metrics.featuredBrands.map((brand) => (
                <Card 
                  key={brand.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/brands/${brand.id}`)}
                >
                  <div className="h-48 bg-soft-pink flex items-center justify-center text-2xl font-light text-text-secondary">
                    {getLocalizedString(brand.name)}
                  </div>
                  <CardContent>
                    <h3 className="font-medium mb-2">{getLocalizedString(brand.name)}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {brand.tagline}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-text-secondary">
                        {brand.productCount} products
                      </span>
                      <span className="text-xs text-rose-gold">
                        MOQ: {brand.minimumOrder} items
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </div>
          
          {/* Recent Orders */}
          {metrics.recentOrders.length > 0 && (
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light">Recent Orders</h2>
                <Button variant="ghost" size="small" onClick={() => navigate('/orders')}>
                  View All →
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="border-b border-border-gray">
                      <tr>
                        <th className="text-left p-4 font-medium">Order</th>
                        <th className="text-left p-4 font-medium">Brand</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentOrders.slice(0, 5).map((order) => (
                        <tr 
                          key={order.id} 
                          className="border-b border-border-gray hover:bg-soft-pink-hover cursor-pointer"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <td className="p-4">{order.orderNumber}</td>
                          <td className="p-4">{order.brandName}</td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                              order.status === 'delivered' ? 'bg-success-green text-white' :
                              order.status === 'shipped' ? 'bg-blue-500 text-white' :
                              order.status === 'processing' ? 'bg-yellow-500 text-white' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-right font-medium">
                            £{order.totalAmount.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Summary Stats */}
          <div className="mt-10 bg-soft-pink rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Your Business Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Total Spent (All Time)</p>
                <p className="text-2xl font-light">£{metrics.totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Active Brands</p>
                <p className="text-2xl font-light">{metrics.featuredBrands.length}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Average Order Value</p>
                <p className="text-2xl font-light">
                  £{metrics.recentOrders.length > 0 
                    ? (metrics.totalSpent / metrics.recentOrders.length).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}