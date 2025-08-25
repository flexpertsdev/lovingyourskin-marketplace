import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Container, Section, Grid } from '../../components/layout'
import { Card, CardContent, Button, Badge } from '../../components/ui'
import { dashboardService } from '../../services'
import { useAuthStore } from '../../stores/auth.store'
import type { AdminMetrics } from '../../services/firebase/dashboard.service'

const activityIcons: Record<string, string> = {
  registration: '👥',
  order: '📦',
  brand: '🏢',
  message: '💬'
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadDashboard()
  }, [])
  
  const loadDashboard = async () => {
    setLoading(true)
    try {
      const data = await dashboardService.getAdminMetrics()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load admin dashboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const formatActivityTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} days ago`
    }
  }
  
  if (loading || !metrics) {
    return (
      <Layout>
        <Section>
          <Container>
            <div className="text-center py-20">Loading admin dashboard...</div>
          </Container>
        </Section>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <Section>
        <Container>
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-light mb-2">Admin Dashboard</h1>
                <p className="text-text-secondary">System overview and management</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Logged in as</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Key Metrics */}
          <Grid cols={4} gap="md" className="mb-10">
            <Card>
              <CardContent>
                <p className="text-sm text-text-secondary mb-2">Active Orders</p>
                <p className="text-4xl font-light text-deep-charcoal mb-2">{metrics.totalOrders}</p>
                <p className={`text-sm font-medium ${metrics.weeklyGrowth > 0 ? 'text-success-green' : 'text-error-red'}`}>
                  {metrics.weeklyGrowth > 0 ? '+' : ''}{metrics.weeklyGrowth.toFixed(1)}% this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <p className="text-sm text-text-secondary mb-2">Total Retailers</p>
                <p className="text-4xl font-light text-deep-charcoal mb-2">{metrics.totalRetailers}</p>
                <p className="text-sm text-text-secondary">
                  {metrics.pendingInvites} pending invites
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <p className="text-sm text-text-secondary mb-2">Active Brands</p>
                <p className="text-4xl font-light text-deep-charcoal mb-2">{metrics.activeBrands}</p>
                <p className="text-sm text-text-secondary">
                  {metrics.newBrandsThisMonth} new this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <p className="text-sm text-text-secondary mb-2">Unread Messages</p>
                <p className="text-4xl font-light text-deep-charcoal mb-2">{metrics.unreadMessages}</p>
                <p className="text-sm font-medium text-warning-amber">
                  {metrics.urgentMessages} urgent
                </p>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Quick Actions */}
          <div className="mb-10">
            <h2 className="text-xl font-light mb-4">Quick Actions</h2>
            <Grid cols={4} gap="md">
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/admin/orders')}
              >
                <CardContent className="text-center py-6">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="font-medium">Pending Orders</p>
                  {metrics.totalOrders > 0 && (
                    <Badge className="bg-rose-gold text-white mt-2">
                      15 to review
                    </Badge>
                  )}
                </CardContent>
              </Card>
              
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/admin/messages')}
              >
                <CardContent className="text-center py-6">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="font-medium">Messages</p>
                  {metrics.unreadMessages > 0 && (
                    <Badge className="bg-warning-amber text-white mt-2">
                      {metrics.unreadMessages} unread
                    </Badge>
                  )}
                </CardContent>
              </Card>
              
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/admin/brands')}
              >
                <CardContent className="text-center py-6">
                  <div className="text-3xl mb-2">🏢</div>
                  <p className="font-medium">Brand Applications</p>
                  <Badge className="bg-purple-500 text-white mt-2">
                    3 pending
                  </Badge>
                </CardContent>
              </Card>
              
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/admin/affiliates')}
              >
                <CardContent className="text-center py-6">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="font-medium">Affiliate Management</p>
                  <Badge className="bg-green-500 text-white mt-2">
                    Manage Affiliates
                  </Badge>
                </CardContent>
              </Card>
            </Grid>
          </div>
          
          {/* Admin Actions */}
          <div className="mb-10">
            <h2 className="text-xl font-light mb-4">Admin Actions</h2>
            <Grid cols={3} gap="md">
              <Button 
                variant="secondary" 
                className="h-16 text-left justify-start"
                onClick={() => navigate('/admin/users')}
              >
                👤 Manage Users & Invites
              </Button>
              <Button 
                variant="secondary" 
                className="h-16 text-left justify-start"
                onClick={() => navigate('/admin/products')}
              >
                📦 Product Management
              </Button>
              <Button 
                variant="secondary" 
                className="h-16 text-left justify-start"
                onClick={() => navigate('/admin/preorders/manage')}
              >
                🎯 Pre-order Campaigns
              </Button>
              <Button 
                variant="secondary" 
                className="h-16 text-left justify-start"
                onClick={() => navigate('/admin/discounts')}
              >
                🎫 Manage Discount Codes
              </Button>
            </Grid>
          </div>
          
          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-light mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-0">
                {metrics.recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`p-4 flex items-start gap-3 hover:bg-soft-pink-hover cursor-pointer ${
                      index < metrics.recentActivity.length - 1 ? 'border-b border-border-gray' : ''
                    }`}
                  >
                    <div className="text-2xl">{activityIcons[activity.type]}</div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-text-secondary">{activity.description}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}