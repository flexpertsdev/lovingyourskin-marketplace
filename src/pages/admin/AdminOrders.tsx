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
import { collection, query, getDocs, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase/config'

interface OrderItem {
  productId: string
  productName: string
  brandName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  variant?: string
  isPreorder?: boolean
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

// Helper function to convert Firestore order to our Order type
const convertFirestoreOrder = (data: any, id: string): Order => {
  return {
    id,
    orderNumber: data.orderNumber || `ORD-${id.slice(0, 8)}`,
    type: data.userType === 'consumer' ? 'b2c' : 'b2b',
    customerName: data.shippingAddress?.name || data.retailerName || 'Unknown',
    customerEmail: data.customerEmail || '',
    customerType: data.userType || 'consumer',
    status: data.status || 'pending',
    items: (data.items || []).map((item: any) => ({
      productId: item.productId,
      productName: item.productName,
      brandName: item.brandName || data.brandName || '',
      quantity: item.quantity,
      unitPrice: item.pricePerItem || item.unitPrice || 0,
      totalPrice: item.totalPrice || (item.quantity * (item.pricePerItem || 0)),
      variant: item.variant,
      isPreorder: item.product?.isPreorder || false
    })),
    subtotal: data.totalAmount?.items || data.subtotal || 0,
    tax: data.totalAmount?.tax || data.tax || 0,
    shipping: data.totalAmount?.shipping || data.shipping || 0,
    total: data.totalAmount?.total || data.total || 0,
    shippingAddress: data.shippingAddress || {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    orderDate: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
    estimatedDelivery: data.estimatedDelivery?.toDate ? data.estimatedDelivery.toDate().toISOString() : data.estimatedDelivery,
    trackingNumber: data.trackingNumber,
    notes: data.notes
  }
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showPreordersOnly, setShowPreordersOnly] = useState(false)
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
      // Fetch orders from Firestore
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      )
      const ordersSnapshot = await getDocs(ordersQuery)
      
      let fetchedOrders: Order[] = []
      ordersSnapshot.forEach((doc) => {
        const order = convertFirestoreOrder(doc.data(), doc.id)
        fetchedOrders.push(order)
      })
      
      // Apply filters
      let filtered = [...fetchedOrders]
      
      // Apply status filter
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(order => order.status === selectedStatus)
      }
      
      // Apply type filter
      if (selectedType !== 'all') {
        filtered = filtered.filter(order => order.type === selectedType)
      }
      
      // Apply preorder filter
      if (showPreordersOnly) {
        filtered = filtered.filter(order => 
          order.items.some(item => item.isPreorder)
        )
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

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Update order status in Firestore
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      })
      
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
              
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                <input
                  type="checkbox"
                  checked={showPreordersOnly}
                  onChange={(e) => setShowPreordersOnly(e.target.checked)}
                  className="h-4 w-4 text-rose-gold focus:ring-rose-gold"
                />
                <span>Pre-orders Only</span>
              </label>
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
                          <div>
                            <span>{order.items.length} items</span>
                            {order.items.some(item => item.isPreorder) && (
                              <Badge variant="warning" className="ml-2 text-xs">Pre-order</Badge>
                            )}
                          </div>
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
                <TableHead>Status</TableHead>
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
                  <TableCell>
                    {item.isPreorder ? (
                      <Badge variant="warning">Pre-order</Badge>
                    ) : (
                      <Badge variant="success">In Stock</Badge>
                    )}
                  </TableCell>
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