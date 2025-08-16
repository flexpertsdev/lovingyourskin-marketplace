import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Card, CardContent, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../stores/auth.store'
import { orderService, preorderService } from '../services'
import { Order } from '../types'
import { Preorder } from '../types/preorder'
import { Package, Clock, CheckCircle, Truck, AlertCircle, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

type CombinedOrder = {
  type: 'regular' | 'preorder'
  data: Order | Preorder
  date: Date
}

export const ConsumerOrderHistory: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [regularOrders, setRegularOrders] = useState<Order[]>([])
  const [preorders, setPreorders] = useState<Preorder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!user) {
      navigate('/shop/login')
      return
    }
    loadAllOrders()
  }, [user, navigate])

  const loadAllOrders = async () => {
    try {
      setLoading(true)
      
      // Load both order types in parallel
      const [ordersData, preordersData] = await Promise.all([
        orderService.getOrders(),
        preorderService.getUserPreorders(user!.id)
      ])
      
      // Filter regular orders for current user
      const userOrders = ordersData.filter(order => 
        order.userId === user!.id || order.consumerId === user!.id
      )
      
      setRegularOrders(userOrders)
      setPreorders(preordersData)
    } catch (error) {
      console.error('Failed to load orders:', error)
      toast.error('Failed to load your order history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Combine and sort orders by date
  const getCombinedOrders = (): CombinedOrder[] => {
    const combined: CombinedOrder[] = []
    
    // Add regular orders
    regularOrders.forEach(order => {
      combined.push({
        type: 'regular',
        data: order,
        date: new Date(order.createdAt)
      })
    })
    
    // Add pre-orders
    preorders.forEach(preorder => {
      const date = preorder.placedAt?.toDate ? preorder.placedAt.toDate() : new Date(preorder.placedAt)
      combined.push({
        type: 'preorder',
        data: preorder,
        date
      })
    })
    
    // Sort by date (newest first)
    return combined.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const getOrderStatusBadge = (status: string, type: 'regular' | 'preorder') => {
    if (type === 'regular') {
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
      
      return (
        <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    } else {
      const statusConfig = {
        pending: { className: 'bg-yellow-500 text-white', label: 'Pending' },
        confirmed: { className: 'bg-blue-500 text-white', label: 'Confirmed' },
        processing: { className: 'bg-orange-500 text-white', label: 'Processing' },
        processed: { className: 'bg-purple-500 text-white', label: 'Processed' },
        packed: { className: 'bg-indigo-500 text-white', label: 'Packed' },
        shipped: { className: 'bg-blue-600 text-white', label: 'Shipped' },
        delivered: { className: 'bg-success-green text-white', label: 'Delivered' },
        cancelled: { className: 'bg-red-500 text-white', label: 'Cancelled' }
      }
      
      const config = statusConfig[status as keyof typeof statusConfig] || 
                     { className: 'bg-gray-500 text-white', label: status }
      
      return <Badge className={config.className}>{config.label}</Badge>
    }
  }

  const renderOrderCard = (combinedOrder: CombinedOrder) => {
    const { type, data } = combinedOrder
    const isPreorder = type === 'preorder'
    
    if (isPreorder) {
      const preorder = data as Preorder
      return (
        <Card key={`preorder-${preorder.id}`} className="border-rose-gold/30 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {/* Order Header */}
            <div className={`px-6 py-4 border-b ${isPreorder ? 'bg-rose-gold/5' : 'bg-gray-50'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant="info" className="bg-rose-gold text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      Pre-order
                    </Badge>
                    <p className="font-medium text-lg">
                      #{preorder.id.slice(-8).toUpperCase()}
                    </p>
                    {getOrderStatusBadge(preorder.status, 'preorder')}
                  </div>
                  <p className="text-sm text-text-secondary">
                    Placed on {formatDate(preorder.placedAt || preorder.createdAt)}
                  </p>
                  {preorder.campaignName && (
                    <p className="text-sm text-rose-gold mt-1">
                      Campaign: {preorder.campaignName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-light text-rose-gold">
                    {formatPrice(preorder.finalAmount || preorder.totalAmount)}
                  </p>
                  {preorder.discountAmount && preorder.discountAmount > 0 && (
                    <p className="text-sm text-success-green">
                      Saved {formatPrice(preorder.discountAmount)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-4 mb-3">
                <Package className="w-5 h-5 text-text-secondary" />
                <p className="text-sm">
                  {preorder.items.length} item{preorder.items.length > 1 ? 's' : ''} • 
                  {' '}{preorder.items.reduce((sum, item) => sum + item.quantity, 0)} total quantity
                </p>
              </div>
              
              {/* Show first 2 items */}
              <div className="space-y-2 mb-3">
                {preorder.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {item.product?.images?.primary && (
                      <img 
                        src={item.product.images.primary} 
                        alt={item.product?.name || 'Product'}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">
                        {item.product?.name || 'Product Name'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Qty: {item.quantity} × {formatPrice(item.discountedPrice)}
                      </p>
                    </div>
                  </div>
                ))}
                {preorder.items.length > 2 && (
                  <p className="text-sm text-text-secondary">
                    +{preorder.items.length - 2} more item{preorder.items.length - 2 > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-6 text-sm text-text-secondary pt-3 border-t">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Processing: {formatDate(preorder.preorderDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Est. Delivery: {preorder.estimatedDelivery || 'TBD'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    } else {
      const order = data as Order
      return (
        <Card key={`order-${order.id}`} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {/* Order Header */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant="default">
                      <Package className="w-3 h-3 mr-1" />
                      Order
                    </Badge>
                    <p className="font-medium text-lg">
                      #{order.orderNumber}
                    </p>
                    {getOrderStatusBadge(order.status, 'regular')}
                  </div>
                  <p className="text-sm text-text-secondary">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                  {order.brandName && (
                    <p className="text-sm text-gray-600 mt-1">
                      Brand: {order.brandName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-light text-deep-charcoal">
                    {formatPrice(order.totalAmount.total)}
                  </p>
                  {order.totalAmount.discount && order.totalAmount.discount > 0 && (
                    <p className="text-sm text-success-green">
                      Saved {formatPrice(order.totalAmount.discount)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-4 mb-3">
                <Package className="w-5 h-5 text-text-secondary" />
                <p className="text-sm">
                  {order.items.length} product{order.items.length > 1 ? 's' : ''} • 
                  {' '}{order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
              </div>
              
              {/* Show first 2 items */}
              <div className="space-y-2 mb-3">
                {order.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {item.product?.images?.primary && (
                      <img 
                        src={item.product.images.primary} 
                        alt={item.productName}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-text-secondary">
                        Qty: {item.quantity} × {formatPrice(item.pricePerItem)}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-text-secondary">
                    +{order.items.length - 2} more product{order.items.length - 2 > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Order Status Info */}
              <div className="flex items-center gap-6 text-sm text-text-secondary pt-3 border-t">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Updated: {formatDate(order.updatedAt)}
                </span>
                {order.status === 'shipped' && (
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    In Transit
                  </span>
                )}
                {order.status === 'delivered' && (
                  <span className="flex items-center gap-1 text-success-green">
                    <CheckCircle className="w-4 h-4" />
                    Delivered
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  }

  if (loading) {
    return (
      <Layout mode="consumer">
        <Section>
          <Container>
            <div className="flex justify-center items-center h-96">
              <Spinner size="large" />
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  const combinedOrders = getCombinedOrders()
  const hasOrders = regularOrders.length > 0 || preorders.length > 0

  if (!hasOrders) {
    return (
      <Layout mode="consumer">
        <Section>
          <Container>
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="w-24 h-24 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-rose-gold" />
              </div>
              <h1 className="text-3xl font-light mb-4">No Orders Yet</h1>
              <p className="text-text-secondary text-lg mb-8">
                You haven't placed any orders yet. Start shopping to see your order history here!
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/shop')}
                >
                  Shop Now
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => navigate('/shop/preorders')}
                >
                  View Pre-order Campaigns
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout mode="consumer">
      <Section>
        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-light mb-2">Order History</h1>
              <p className="text-text-secondary">
                Track and manage all your orders and pre-orders in one place
              </p>
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-soft-pink rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-2xl font-light">{combinedOrders.length}</p>
                      <p className="text-sm text-text-secondary">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-light">{regularOrders.length}</p>
                      <p className="text-sm text-text-secondary">Regular Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-gold/10 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-2xl font-light">{preorders.length}</p>
                      <p className="text-sm text-text-secondary">Pre-orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for filtering */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="regular">Regular</TabsTrigger>
                <TabsTrigger value="preorder">Pre-orders</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {combinedOrders.map(order => renderOrderCard(order))}
              </TabsContent>

              <TabsContent value="regular" className="space-y-4 mt-6">
                {regularOrders.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-text-secondary">No regular orders yet</p>
                      <Button 
                        variant="primary" 
                        className="mt-4"
                        onClick={() => navigate('/shop')}
                      >
                        Shop Now
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  regularOrders.map(order => renderOrderCard({
                    type: 'regular',
                    data: order,
                    date: new Date(order.createdAt)
                  }))
                )}
              </TabsContent>

              <TabsContent value="preorder" className="space-y-4 mt-6">
                {preorders.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-text-secondary">No pre-orders yet</p>
                      <Button 
                        variant="primary" 
                        className="mt-4"
                        onClick={() => navigate('/shop/preorders')}
                      >
                        View Pre-order Campaigns
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  preorders.map(preorder => {
                    const date = preorder.placedAt?.toDate ? preorder.placedAt.toDate() : new Date(preorder.placedAt)
                    return renderOrderCard({
                      type: 'preorder',
                      data: preorder,
                      date
                    })
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}