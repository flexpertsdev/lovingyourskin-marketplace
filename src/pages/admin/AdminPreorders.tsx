import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Container, Section } from '../../components/layout'
import { Card, CardContent, Button, Badge } from '../../components/ui'
import { preorderService } from '../../services'
import { PreorderCampaign, Preorder } from '../../types/preorder'
import toast from 'react-hot-toast'

export const AdminPreorders: React.FC = () => {
  const { campaignId } = useParams<{ campaignId?: string }>()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<PreorderCampaign | null>(null)
  const [preorders, setPreorders] = useState<Preorder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Preorder | null>(null)

  useEffect(() => {
    loadData()
  }, [campaignId])

  const loadData = async () => {
    setLoading(true)
    try {
      if (campaignId) {
        const [campaignData, preordersData] = await Promise.all([
          preorderService.getCampaign(campaignId),
          preorderService.getPreordersByCampaign(campaignId)
        ])
        setCampaign(campaignData)
        setPreorders(preordersData)
      } else {
        // Load all preorders (you might want to implement this in the service)
        toast.error('Campaign ID required')
        navigate('/admin/preorders/manage')
      }
    } catch (error) {
      console.error('Failed to load preorders:', error)
      toast.error('Failed to load preorders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: Preorder['status']) => {
    try {
      await preorderService.updatePreorderStatus(orderId, status)
      toast.success(`Order status updated to ${status}`)
      loadData()
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-GB')
  }

  const getStatusColor = (status: Preorder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-amber text-white'
      case 'processing':
        return 'bg-blue-500 text-white'
      case 'processed':
        return 'bg-purple-500 text-white'
      case 'shipped':
        return 'bg-indigo-500 text-white'
      case 'delivered':
        return 'bg-success-green text-white'
      case 'cancelled':
        return 'bg-error-red text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getPaymentStatusColor = (status: Preorder['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-success-green text-white'
      case 'pending':
        return 'bg-warning-amber text-white'
      case 'failed':
        return 'bg-error-red text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  if (loading) {
    return (
      <Layout>
        <Section>
          <Container>
            <div className="text-center py-20">Loading pre-orders...</div>
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
                <h1 className="text-3xl font-light mb-2">
                  Pre-orders {campaign && `- ${campaign.name}`}
                </h1>
                <p className="text-text-secondary">
                  Manage and track pre-order fulfillment
                </p>
              </div>
              <Button
                onClick={() => navigate('/admin/preorders/manage')}
                variant="secondary"
              >
                Back to Campaigns
              </Button>
            </div>
          </div>

          {/* Pre-orders List */}
          {!selectedOrder && (
            <div className="space-y-4">
              {preorders.map(order => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">Order #{order.id.slice(-8)}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-text-secondary">Customer</p>
                            <p className="font-medium">{order.userEmail}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Order Date</p>
                            <p>{formatDate(order.placedAt)}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Pre-order Date</p>
                            <p>{formatDate(order.preorderDate)}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Items</p>
                            <p>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Total</p>
                            <p className="font-medium">${order.finalAmount.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="small"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {preorders.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-text-secondary">No pre-orders for this campaign yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Order Details */}
          {selectedOrder && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-light">
                  Order Details - #{selectedOrder.id.slice(-8)}
                </h2>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Back to Orders
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <Card>
                  <CardContent>
                    <h3 className="font-medium mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Status:</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Payment:</span>
                        <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Placed:</span>
                        <span>{formatDate(selectedOrder.placedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Pre-order Date:</span>
                        <span>{formatDate(selectedOrder.preorderDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Est. Delivery:</span>
                        <span>{formatDate(selectedOrder.estimatedDelivery)}</span>
                      </div>
                      {selectedOrder.processedAt && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Processed:</span>
                          <span>{formatDate(selectedOrder.processedAt)}</span>
                        </div>
                      )}
                      {selectedOrder.shippedAt && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Shipped:</span>
                          <span>{formatDate(selectedOrder.shippedAt)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Info */}
                <Card>
                  <CardContent>
                    <h3 className="font-medium mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-text-secondary text-sm">Email</p>
                        <p>{selectedOrder.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-sm">Shipping Address</p>
                        <p>{selectedOrder.shippingAddress.name}</p>
                        <p>{selectedOrder.shippingAddress.street}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                        {selectedOrder.shippingAddress.phone && (
                          <p>Tel: {selectedOrder.shippingAddress.phone}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card className="mt-6">
                <CardContent>
                  <h3 className="font-medium mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-4 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-text-secondary">
                            {item.product.brandId} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.discountedPrice * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-text-secondary">
                            ${item.discountedPrice.toFixed(2)} each ({item.discountPercentage}% off)
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-success-green">
                        <span>Discount:</span>
                        <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total:</span>
                        <span>${selectedOrder.finalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Actions */}
              <Card className="mt-6">
                <CardContent>
                  <h3 className="font-medium mb-4">Order Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedOrder.status === 'pending' && (
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      >
                        Mark as Processing
                      </Button>
                    )}
                    {selectedOrder.status === 'processing' && (
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'processed')}
                      >
                        Mark as Processed
                      </Button>
                    )}
                    {selectedOrder.status === 'processed' && (
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    {selectedOrder.status === 'shipped' && (
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                      <Button
                        variant="secondary"
                        className="text-error-red"
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this order?')) {
                            updateOrderStatus(selectedOrder.id, 'cancelled')
                          }
                        }}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}