import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Container, Section } from '../../components/layout'
import { Card, CardContent, Badge, Button } from '../../components/ui'
import { orderService } from '../../services'
import { Order, OrderStatus } from '../../types'
import { useAuthStore } from '../../stores/auth.store'
import { CheckCircle, Clock, Package, Truck } from 'lucide-react'

const statusColors: Record<OrderStatus, string> = {
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

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending Review',
  confirmed: 'Confirmed',
  processing: 'Processing',
  invoiced: 'Invoiced',
  paid: 'Paid',
  preparing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed'
}

const statusActions: Record<OrderStatus, string> = {
  pending: 'Review & Confirm',
  confirmed: 'Process Order',
  processing: 'Generate Invoice',
  invoiced: 'Awaiting Payment',
  paid: 'Prepare for Shipping',
  preparing: 'Ship Order',
  shipped: 'Track Delivery',
  delivered: 'Complete Order',
  completed: 'View Details'
}

export const BrandOrders: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [urgentOrders, setUrgentOrders] = useState<Order[]>([])
  
  useEffect(() => {
    if (user?.brandId || user?.companyId) {
      loadOrders()
    }
  }, [statusFilter, user])
  
  const loadOrders = async () => {
    const brandId = user?.brandId || user?.companyId
    if (!brandId) return
    
    setLoading(true)
    try {
      let data = await orderService.getOrders()
      
      // Filter for orders received by this brand
      data = data.filter(order => 
        order.brandId === brandId && order.userType === 'retailer'
      )
      
      // Identify urgent orders (pending or need action)
      const urgent = data.filter(order => 
        ['pending', 'confirmed', 'paid'].includes(order.status)
      )
      setUrgentOrders(urgent)
      
      // Apply status filter
      if (statusFilter !== 'all') {
        data = data.filter(order => order.status === statusFilter)
      }
      
      // Sort by date (newest first) with urgent orders prioritized
      data.sort((a, b) => {
        // Urgent orders first
        const aUrgent = ['pending', 'confirmed', 'paid'].includes(a.status)
        const bUrgent = ['pending', 'confirmed', 'paid'].includes(b.status)
        if (aUrgent && !bUrgent) return -1
        if (!aUrgent && bUrgent) return 1
        
        // Then by date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getOrderAge = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }
  
  const getActionIcon = (status: OrderStatus) => {
    switch(status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="w-4 h-4" />
      case 'processing':
      case 'invoiced':
      case 'paid':
      case 'preparing':
        return <Package className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }
  
  if (loading) {
    return (
      <Layout mode="b2b">
        <Section>
          <Container>
            <div className="text-center py-20">Loading orders...</div>
          </Container>
        </Section>
      </Layout>
    )
  }
  
  return (
    <Layout mode="b2b">
      <Section>
        <Container>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-light">Orders Received</h1>
              <p className="text-text-secondary mt-2">Manage B2B orders from retailers</p>
              {urgentOrders.length > 0 && (
                <p className="text-warning-amber mt-2">
                  ⚠️ {urgentOrders.length} order{urgentOrders.length > 1 ? 's' : ''} need{urgentOrders.length === 1 ? 's' : ''} your attention
                </p>
              )}
            </div>
            
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => navigate('/brand/dashboard')}>
                Dashboard
              </Button>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="px-4 py-2 border border-border-gray rounded-lg bg-white text-text-primary"
              >
                <option value="all">All Orders ({orders.length})</option>
                {Object.entries(statusLabels).map(([value, label]) => {
                  const count = orders.filter(o => o.status === value).length
                  return (
                    <option key={value} value={value}>
                      {label} ({count})
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          
          {/* Urgent Orders Alert */}
          {statusFilter === 'all' && urgentOrders.length > 0 && (
            <Card className="mb-6 border-warning-amber bg-amber-50">
              <CardContent className="py-4">
                <h3 className="font-medium mb-2 text-warning-amber">Orders Requiring Action</h3>
                <div className="space-y-2">
                  {urgentOrders.slice(0, 3).map(order => (
                    <div 
                      key={order.id}
                      className="flex justify-between items-center p-2 bg-white rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/brand/orders/${order.id}`)}
                    >
                      <div>
                        <span className="font-medium">{order.orderNumber}</span>
                        <span className="text-sm text-text-secondary ml-2">
                          from {order.retailerName || 'Retailer'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusColors[order.status]} text-white`}>
                          {statusLabels[order.status]}
                        </Badge>
                        <Button size="small" variant="primary">
                          {statusActions[order.status]}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-20">
                <h3 className="text-xl font-light mb-4">No orders found</h3>
                <p className="text-text-secondary mb-6">
                  {statusFilter === 'all' 
                    ? 'You haven\'t received any orders yet'
                    : `No ${statusLabels[statusFilter as OrderStatus]?.toLowerCase()} orders`
                  }
                </p>
                <Button onClick={() => navigate('/brand/dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card 
                  key={order.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    ['pending', 'confirmed', 'paid'].includes(order.status) 
                      ? 'border-l-4 border-l-warning-amber' 
                      : ''
                  }`}
                  onClick={() => navigate(`/brand/orders/${order.id}`)}
                >
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-medium">{order.orderNumber}</h3>
                          <Badge className={`${statusColors[order.status]} text-white`}>
                            {statusLabels[order.status]}
                          </Badge>
                          {['pending', 'confirmed', 'paid'].includes(order.status) && (
                            <span className="text-warning-amber text-sm font-medium">
                              Action Required
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-lg font-medium">{order.retailerName || 'Unknown Retailer'}</p>
                          <p className="text-sm text-text-secondary">
                            Retailer ID: {order.retailerId}
                          </p>
                        </div>
                        
                        <p className="text-sm text-text-secondary mb-3">
                          {order.items.length} product{order.items.length > 1 ? 's' : ''} • 
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-text-secondary">
                          <span>Received: {getOrderAge(order.createdAt)}</span>
                          <span>Last updated: {formatDate(order.updatedAt)}</span>
                        </div>
                        
                        {/* Action Button for urgent orders */}
                        {['pending', 'confirmed', 'paid'].includes(order.status) && (
                          <div className="mt-3">
                            <Button 
                              size="small" 
                              variant="primary"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/brand/orders/${order.id}`)
                              }}
                            >
                              {getActionIcon(order.status)}
                              <span className="ml-2">{statusActions[order.status]}</span>
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-medium text-rose-gold mb-2">
                          £{order.totalAmount.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-text-secondary mb-2">
                          {order.paymentMethod || 'Bank Transfer'}
                        </p>
                        {order.documents && order.documents.length > 0 && (
                          <p className="text-sm text-text-secondary">
                            📎 {order.documents.length} document{order.documents.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Order Items Preview */}
                    <div className="mt-4 pt-4 border-t border-border-gray">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-text-secondary truncate mr-2">
                              {item.product?.name || 'Product'}
                            </span>
                            <span className="font-medium">
                              {item.quantity} × £{item.pricePerItem.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="text-text-secondary">
                            ...and {order.items.length - 4} more items
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Timeline preview */}
                    <div className="mt-4 pt-4 border-t border-border-gray">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {['pending', 'confirmed', 'processing', 'invoiced', 'paid', 'preparing', 'shipped', 'delivered', 'completed'].map((status, index) => {
                          const isCompleted = order.timeline && order.timeline.some(t => t.status === status)
                          const isCurrent = order.status === status
                          
                          return (
                            <React.Fragment key={status}>
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                                ${isCompleted ? 'bg-success-green text-white' : 
                                  isCurrent ? `${statusColors[status as OrderStatus]} text-white` : 
                                  'bg-gray-200 text-gray-500'}
                              `}>
                                {isCompleted ? '✓' : index + 1}
                              </div>
                              {index < 8 && (
                                <div className={`flex-1 h-0.5 ${
                                  isCompleted ? 'bg-success-green' : 'bg-gray-200'
                                }`} />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}