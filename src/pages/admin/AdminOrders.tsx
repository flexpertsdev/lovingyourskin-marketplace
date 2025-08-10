import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Label } from '../../components/ui/label'
import toast from 'react-hot-toast'
import { Search, Eye, Package, Truck, Check, X } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'

interface OrderItem {
  productId: string
  productName: string
  brandName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  variant?: string
}

interface Order {
  id: string
  orderNumber: string
  type: 'b2b' | 'b2c'
  customerName: string
  customerEmail: string
  customerType: 'retailer' | 'consumer'
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  orderDate: string
  estimatedDelivery?: string
  trackingNumber?: string
  notes?: string
}

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    type: 'b2b',
    customerName: 'Beauty Boutique',
    customerEmail: 'orders@beautyboutique.com',
    customerType: 'retailer',
    status: 'processing',
    items: [
      {
        productId: '1',
        productName: 'Hydrating Serum',
        brandName: 'Baohlab',
        quantity: 24,
        unitPrice: 25.00,
        totalPrice: 600.00
      },
      {
        productId: '2',
        productName: 'Vitamin C Cream',
        brandName: 'Lalucell',
        quantity: 12,
        unitPrice: 35.00,
        totalPrice: 420.00
      }
    ],
    subtotal: 1020.00,
    tax: 102.00,
    shipping: 50.00,
    total: 1172.00,
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    orderDate: '2024-01-15T10:30:00Z',
    estimatedDelivery: '2024-01-22T00:00:00Z'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    type: 'b2c',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@email.com',
    customerType: 'consumer',
    status: 'shipped',
    items: [
      {
        productId: '3',
        productName: 'Sun Protection Cushion',
        brandName: 'Sunnicorn',
        quantity: 1,
        unitPrice: 45.00,
        totalPrice: 45.00
      }
    ],
    subtotal: 45.00,
    tax: 4.50,
    shipping: 10.00,
    total: 59.50,
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'USA'
    },
    orderDate: '2024-01-14T15:45:00Z',
    estimatedDelivery: '2024-01-18T00:00:00Z',
    trackingNumber: 'TRACK123456789'
  }
]

export default function AdminOrders() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Using mock data for now
      let filtered = [...mockOrders]
      
      // Apply status filter
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(order => order.status === selectedStatus)
      }
      
      // Apply type filter
      if (selectedType !== 'all') {
        filtered = filtered.filter(order => order.type === selectedType)
      }
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(order => 
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      setOrders(filtered)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus, selectedType, searchTerm])

  const getStatusBadge = (status: Order['status']) => {
    const variants: Record<Order['status'], 'warning' | 'info' | 'success' | 'error' | 'default'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error'
    }
    
    const icons: Record<Order['status'], React.ReactNode> = {
      pending: '⏳',
      processing: <Package className="w-3 h-3" />,
      shipped: <Truck className="w-3 h-3" />,
      delivered: <Check className="w-3 h-3" />,
      cancelled: <X className="w-3 h-3" />
    }

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleUpdateStatus = async (_orderId: string, newStatus: Order['status']) => {
    try {
      // Mock update - in real app, this would update the database using orderId
      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by order number, customer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
              >
                <option value="all">All Types</option>
                <option value="b2b">B2B Orders</option>
                <option value="b2c">B2C Orders</option>
              </select>
            </div>

            {/* Orders Table */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.type === 'b2b' ? 'info' : 'default'}>
                            {order.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(order.orderDate)}
                        </TableCell>
                        <TableCell>
                          {order.items.length} items
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => {
                              setSelectedOrder(order)
                              setDetailDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <OrderDetailView
                order={selectedOrder}
                onUpdateStatus={handleUpdateStatus}
                onClose={() => setDetailDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

// Order Detail View Component
function OrderDetailView({
  order,
  onUpdateStatus,
  onClose
}: {
  order: Order
  onUpdateStatus: (orderId: string, status: Order['status']) => void
  onClose: () => void
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Order Number</Label>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <Label>Order Type</Label>
              <Badge variant={order.type === 'b2b' ? 'info' : 'default'}>
                {order.type.toUpperCase()}
              </Badge>
            </div>
            <div>
              <Label>Customer</Label>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-sm text-gray-500">{order.customerEmail}</p>
            </div>
            <div>
              <Label>Customer Type</Label>
              <p className="capitalize">{order.customerType}</p>
            </div>
            <div>
              <Label>Order Date</Label>
              <p>{formatDate(order.orderDate)}</p>
            </div>
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item.productName}
                    {item.variant && (
                      <span className="text-sm text-gray-500 block">{item.variant}</span>
                    )}
                  </TableCell>
                  <TableCell>{item.brandName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 space-y-4">
          <div>
            <Label>Shipping Address</Label>
            <Card className="mt-2">
              <CardContent className="pt-4">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
              </CardContent>
            </Card>
          </div>

          {order.estimatedDelivery && (
            <div>
              <Label>Estimated Delivery</Label>
              <p>{formatDate(order.estimatedDelivery)}</p>
            </div>
          )}

          {order.trackingNumber && (
            <div>
              <Label>Tracking Number</Label>
              <p className="font-mono">{order.trackingNumber}</p>
            </div>
          )}

          {order.notes && (
            <div>
              <Label>Order Notes</Label>
              <Card className="mt-2">
                <CardContent className="pt-4">
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}