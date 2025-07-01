import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Container, Section, Grid } from '../../components/layout'
import { Card, CardContent, Button, Badge } from '../../components/ui'
import { dashboardService } from '../../services'
import type { AdminMetrics } from '../../services/mock/dashboard.service'

const activityIcons: Record<string, string> = {
  registration: '👥',
  order: '📦',
  brand: '🏢',
  message: '💬'
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
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
            <h1 className="text-3xl font-light mb-2">Admin Dashboard</h1>
            <p className="text-text-secondary">System overview and management</p>
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
                onClick={() => navigate('/admin/orders?status=pending')}
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
                onClick={() => navigate('/admin/retailers?status=new')}
              >
                <CardContent className="text-center py-6">
                  <div className="text-3xl mb-2">👥</div>
                  <p className="font-medium">New Retailers</p>
                  <Badge className="bg-blue-500 text-white mt-2">
                    5 this week
                  </Badge>
                </CardContent>
              </Card>
              
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/admin/brands?status=pending')}
              >
                <CardContent className="text-center py-6">
                  <div className="text-3xl mb-2">🏢</div>
                  <p className="font-medium">Brand Applications</p>
                  <Badge className="bg-purple-500 text-white mt-2">
                    3 pending
                  </Badge>
                </CardContent>
              </Card>
            </Grid>
          </div>
          
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      {activity.status && (
                        <Badge className={
                          activity.status === 'urgent' ? 'bg-error-red text-white' :
                          activity.status === 'pending' ? 'bg-warning-amber text-white' :
                          'bg-success-green text-white'
                        }>
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            {/* System Health */}
            <div>
              <h2 className="text-xl font-light mb-4">System Health</h2>
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Order Processing</span>
                        <span className="text-sm font-medium text-success-green">Healthy</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-success-green" style={{ width: '92%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Message Response Time</span>
                        <span className="text-sm font-medium text-warning-amber">Delayed</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-warning-amber" style={{ width: '65%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Platform Uptime</span>
                        <span className="text-sm font-medium text-success-green">99.9%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-success-green" style={{ width: '99.9%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Payment Processing</span>
                        <span className="text-sm font-medium text-success-green">Operational</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-success-green" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Admin Actions */}
              <Card className="mt-4">
                <CardContent>
                  <h3 className="font-medium mb-4">Admin Actions</h3>
                  <div className="space-y-3">
                    <Button variant="secondary" fullWidth>
                      📊 View Full Analytics
                    </Button>
                    <Button variant="secondary" fullWidth>
                      📧 Send Invite Codes
                    </Button>
                    <Button variant="secondary" fullWidth>
                      🔧 System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}