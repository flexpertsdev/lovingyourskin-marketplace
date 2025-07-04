import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent, Badge } from '../components/ui'
import { orderService } from '../services'
import { Order, OrderStatus } from '../types'

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
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  invoiced: 'Invoiced',
  paid: 'Paid',
  preparing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed'
}

export const Orders: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  
  useEffect(() => {
    loadOrders()
  }, [statusFilter])
  
  const loadOrders = async () => {
    setLoading(true)
    try {
      const filters = statusFilter === 'all' ? undefined : { status: statusFilter }
      const data = await orderService.getOrders(filters)
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
      year: 'numeric'
    })
  }
  
  const getLatestUpdate = (order: Order) => {
    const latest = order.timeline[order.timeline.length - 1]
    return latest ? latest.description : 'No updates'
  }
  
  if (loading) {
    return (
      <Layout>
        <Section>
          <Container>
            <div className="text-center py-20">Loading orders...</div>
          </Container>
        </Section>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <Section>
        <Container>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-light">My Orders</h1>
            
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="px-4 py-2 border border-border-gray rounded-lg bg-white text-text-primary"
              >
                <option value="all">All Orders</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              
              <Button onClick={() => navigate('/brands')}>
                New Order
              </Button>
            </div>
          </div>
          
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-20">
                <h3 className="text-xl font-light mb-4">No orders found</h3>
                <p className="text-text-secondary mb-6">
                  {statusFilter === 'all' 
                    ? 'Start by browsing our verified Korean beauty brands'
                    : `No ${statusLabels[statusFilter as OrderStatus]?.toLowerCase()} orders`
                  }
                </p>
                <Button onClick={() => navigate('/brands')}>
                  Browse Brands
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card 
                  key={order.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-medium">{order.orderNumber}</h3>
                          <Badge className={`${statusColors[order.status]} text-white`}>
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                        
                        <p className="text-lg mb-1">{order.brandName}</p>
                        <p className="text-sm text-text-secondary mb-3">
                          {order.items.length} product{order.items.length > 1 ? 's' : ''} • 
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-text-secondary">
                          <span>Created: {formatDate(order.createdAt)}</span>
                          <span>Updated: {formatDate(order.updatedAt)}</span>
                          <span>{getLatestUpdate(order)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-medium text-rose-gold mb-2">
                          £{order.totalAmount.total.toFixed(2)}
                        </p>
                        {order.documents.length > 0 && (
                          <p className="text-sm text-text-secondary">
                            📎 {order.documents.length} document{order.documents.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Timeline preview */}
                    <div className="mt-4 pt-4 border-t border-border-gray">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {['pending', 'confirmed', 'processing', 'invoiced', 'paid', 'preparing', 'shipped', 'delivered', 'completed'].map((status, index) => {
                          const isCompleted = order.timeline.some(t => t.status === status)
                          const isCurrent = order.status === status
                          
                          return (
                            <React.Fragment key={status}>
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
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