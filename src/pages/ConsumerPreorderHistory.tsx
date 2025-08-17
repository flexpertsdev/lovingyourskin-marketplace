import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Card, CardContent, Badge, Button } from '../components/ui'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../stores/auth.store'
import { preorderService } from '../services'
import { Preorder } from '../types/preorder'

export const ConsumerPreorderHistory: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [preorders, setPreorders] = useState<Preorder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/shop/login')
      return
    }
    loadPreorders()
  }, [user, navigate])

  const loadPreorders = async () => {
    try {
      setLoading(true)
      const userPreorders = await preorderService.getUserPreorders(user!.id)
      setPreorders(userPreorders)
    } catch (error) {
      console.error('Failed to load pre-orders:', error)
      console.error('Failed to load your pre-orders')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, label: 'Pending' },
      processing: { variant: 'info' as const, label: 'Processing' },
      packed: { variant: 'info' as const, label: 'Packed' },
      shipped: { variant: 'success' as const, label: 'Shipped' },
      delivered: { variant: 'success' as const, label: 'Delivered' },
      cancelled: { variant: 'error' as const, label: 'Cancelled' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { variant: 'default' as const, label: status }
    
    return <Badge variant={config.variant}>{config.label}</Badge>
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

  if (preorders.length === 0) {
    return (
      <Layout mode="consumer">
        <Section>
          <Container>
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="w-24 h-24 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📦</span>
              </div>
              <h1 className="text-3xl font-light mb-4">No Pre-orders Yet</h1>
              <p className="text-text-secondary text-lg mb-8">
                You haven't placed any pre-orders yet. Check out our active campaigns!
              </p>
              <Button 
                variant="primary" 
                size="large"
                onClick={() => navigate('/shop/preorders')}
              >
                View Pre-order Campaigns
              </Button>
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
              <h1 className="text-3xl font-light mb-2">My Pre-orders</h1>
              <p className="text-text-secondary">
                Track and manage your pre-order purchases
              </p>
            </div>

            {/* Pre-orders List */}
            <div className="space-y-6">
              {preorders.map((preorder) => (
                <Card key={preorder.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Pre-order Header */}
                    <div className="bg-soft-pink/30 px-6 py-4 border-b">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-medium text-lg">
                              Order #{preorder.id.slice(-8).toUpperCase()}
                            </p>
                            {getStatusBadge(preorder.status)}
                          </div>
                          <p className="text-sm text-text-secondary">
                            Placed on {formatDate(preorder.placedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-light text-rose-gold">
                            ${preorder.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pre-order Items */}
                    <div className="p-6">
                      <div className="space-y-4 mb-6">
                        {preorder.items.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <img
                              src={item.product?.images?.primary || '/placeholder-product.png'}
                              alt={item.product?.name || 'Product'}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium">
                                {item.product?.name || 'Product Name Unavailable'}
                              </h3>
                              <p className="text-sm text-text-secondary">
                                Quantity: {item.quantity} × ${item.discountedPrice.toFixed(2)}
                              </p>
                              {item.discountPercentage > 0 && (
                                <p className="text-xs text-success-green">
                                  {item.discountPercentage}% pre-order discount
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ${(item.discountedPrice * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Campaign & Delivery Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-text-secondary mb-1">
                              Campaign
                            </p>
                            <p className="text-sm">
                              {preorder.campaignName || 'Pre-order Campaign'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-secondary mb-1">
                              Expected Delivery
                            </p>
                            <p className="text-sm">
                              {preorder.estimatedDelivery || 'TBD'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-text-secondary mb-2">
                          Shipping Address
                        </p>
                        <div className="text-sm">
                          <p>{preorder.shippingAddress.name}</p>
                          <p>{preorder.shippingAddress.street}</p>
                          <p>
                            {preorder.shippingAddress.city}, {preorder.shippingAddress.postalCode}
                          </p>
                          <p>{preorder.shippingAddress.country}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      {preorder.status === 'pending' && (
                        <div className="border-t pt-4 mt-4">
                          <p className="text-sm text-text-secondary mb-3">
                            You can cancel this pre-order before processing begins
                          </p>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this pre-order?')) {
                                // Handle cancellation
                                console.log('Cancellation feature coming soon')
                              }
                            }}
                          >
                            Cancel Pre-order
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Back to Shopping */}
            <div className="mt-8 text-center">
              <Button
                variant="secondary"
                onClick={() => navigate('/shop/preorders')}
              >
                View Active Pre-order Campaigns
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}