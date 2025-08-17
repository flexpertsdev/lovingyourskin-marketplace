import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Card, CardContent, Button, Input, Badge } from '../components/ui'
import { Spinner } from '../components/ui/Spinner'
import { usePreorderStore } from '../stores/preorder.store'
import { useAuthStore } from '../stores/auth.store'
import { preorderService } from '../services'
import { stripeService } from '../services/stripe/stripe.service'
import { PriceDisplay } from '../components/features/PriceDisplay'
import toast from 'react-hot-toast'

interface ShippingAddress {
  name: string
  email: string
  phone: string
  street: string
  city: string
  postalCode: string
  country: string
}

export const ConsumerPreorderCheckout: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    preorderItems, 
    getTotalWithDiscount, 
    getItemCount,
    clearPreorderCart,
    activeCampaign 
  } = usePreorderStore()
  
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Singapore'
  })

  useEffect(() => {
    // Redirect if no items in cart
    if (getItemCount() === 0) {
      navigate('/shop/preorders')
    }
  }, [getItemCount, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    const required = ['name', 'email', 'phone', 'street', 'city', 'postalCode', 'country']
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        toast.error(`Please fill in ${field}`)
        return false
      }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingAddress.email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    
    return true
  }

  const handleCheckout = async () => {
    if (!validateForm()) return
    if (!activeCampaign) {
      toast.error('No active pre-order campaign')
      return
    }
    
    setProcessing(true)
    
    try {
      // Create draft pre-order in Firebase first (to store details)
      const draftPreorder = await preorderService.createPreorder({
        campaignId: activeCampaign.id,
        items: preorderItems.map(item => ({
          ...item,
          product: {
            id: item.productId,
            name: item.product.name,
            brandId: item.product.brandId,
            images: item.product.images
          }
        })),
        shippingAddress,
        paymentMethod: 'stripe',
        totalAmount: getTotalWithDiscount()
      })

      if (!draftPreorder) {
        throw new Error('Failed to create pre-order')
      }

      // Create Stripe checkout session for pre-order
      const { sessionUrl } = await stripeService.createB2CCheckoutSession({
        items: preorderItems.map(item => ({
          id: item.productId,
          product: item.product,
          quantity: item.quantity,
          productId: item.productId,
          productName: item.product.name,
          productDescription: item.product.description || '',
          brandId: item.product.brandId,
          pricePerItem: item.discountedPrice, // Use discounted price
          images: item.product.images?.primary ? [item.product.images.primary] : [],
          addedAt: new Date()
        })),
        customer: {
          email: shippingAddress.email,
          name: shippingAddress.name,
          id: user?.id
        },
        shippingAddress: {
          id: `address-${Date.now()}`,
          name: shippingAddress.name,
          street: shippingAddress.street,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone
        },
        successUrl: `${window.location.origin}/shop/checkout-success?session_id={CHECKOUT_SESSION_ID}&preorder_id=${draftPreorder.id}`,
        cancelUrl: `${window.location.origin}/shop/preorder-checkout`,
        // Add pre-order specific metadata
        metadata: {
          orderType: 'preorder',
          preorderId: draftPreorder.id,
          campaignId: activeCampaign.id,
          campaignName: activeCampaign.name,
          preorderDate: activeCampaign.preorderDate.toDate ? 
            activeCampaign.preorderDate.toDate().toISOString() : 
            activeCampaign.preorderDate,
          deliveryTimeframe: activeCampaign.deliveryTimeframe,
          discountPercentage: activeCampaign.discountPercentage.toString()
        }
      })

      // Clear the pre-order cart before redirecting
      clearPreorderCart()
      
      // Redirect to Stripe Checkout
      window.location.href = sessionUrl
      
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process pre-order. Please try again.')
      setProcessing(false)
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

  const subtotal = preorderItems.reduce((total, item) => 
    total + (item.pricePerItem * item.quantity), 0
  )
  const discount = subtotal - getTotalWithDiscount()
  const total = getTotalWithDiscount()

  return (
    <Layout mode="consumer">
      <Section>
        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-light mb-2">Pre-order Checkout</h1>
              {activeCampaign && (
                <div className="flex items-center gap-4">
                  <Badge variant="info" className="bg-rose-gold text-white">
                    {activeCampaign.name}
                  </Badge>
                  <span className="text-sm text-text-secondary">
                    {activeCampaign.discountPercentage}% discount applied
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Shipping Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Campaign Info */}
                {activeCampaign && (
                  <Card className="bg-soft-pink/50 border-rose-gold">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🎯</span>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">Pre-order Campaign Details</h3>
                          <p className="text-sm text-text-secondary">
                            Processing date: {formatDate(activeCampaign.preorderDate)}
                          </p>
                          <p className="text-sm text-text-secondary">
                            Estimated delivery: {activeCampaign.deliveryTimeframe} after processing
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Shipping Address */}
                <Card>
                  <CardContent>
                    <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <Input
                          type="text"
                          name="name"
                          value={shippingAddress.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Email Address *</label>
                        <Input
                          type="email"
                          name="email"
                          value={shippingAddress.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number *</label>
                        <Input
                          type="tel"
                          name="phone"
                          value={shippingAddress.phone}
                          onChange={handleInputChange}
                          placeholder="+65 9123 4567"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Country *</label>
                        <Input
                          type="text"
                          name="country"
                          value={shippingAddress.country}
                          onChange={handleInputChange}
                          placeholder="Singapore"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Street Address *</label>
                        <Input
                          type="text"
                          name="street"
                          value={shippingAddress.street}
                          onChange={handleInputChange}
                          placeholder="123 Main Street, Unit #01-01"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">City *</label>
                        <Input
                          type="text"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleInputChange}
                          placeholder="Singapore"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Postal Code *</label>
                        <Input
                          type="text"
                          name="postalCode"
                          value={shippingAddress.postalCode}
                          onChange={handleInputChange}
                          placeholder="123456"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardContent>
                    <h2 className="text-xl font-medium mb-4">Payment Method</h2>
                    <div className="bg-soft-pink/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">STRIPE</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Secure Payment with Stripe</p>
                          <p className="text-sm text-text-secondary">
                            You'll be redirected to complete payment securely
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div>
                <Card className="sticky top-4">
                  <CardContent>
                    <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                    
                    {/* Items */}
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {preorderItems.map((item) => (
                        <div key={item.productId} className="flex gap-3">
                          <img
                            src={item.product.images?.primary || '/placeholder-product.png'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-text-secondary">
                              Qty: {item.quantity} × <PriceDisplay amountUSD={item.discountedPrice} size="small" />
                            </p>
                            <p className="text-xs text-success-green">
                              {item.discountPercentage}% off applied
                            </p>
                          </div>
                          <p className="text-sm font-medium">
                            <PriceDisplay amountUSD={item.discountedPrice * item.quantity} size="small" />
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <PriceDisplay amountUSD={subtotal} size="small" />
                      </div>
                      <div className="flex justify-between text-sm text-success-green">
                        <span>Pre-order Discount</span>
                        <span>-<PriceDisplay amountUSD={discount} size="small" /></span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span className="text-success-green">FREE</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="text-xl font-medium text-rose-gold">
                          <PriceDisplay amountUSD={total} size="large" />
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-6"
                      size="large"
                      onClick={handleCheckout}
                      disabled={processing}
                    >
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="small" />
                          Processing...
                        </span>
                      ) : (
                        <>Place Pre-order • <PriceDisplay amountUSD={total} /></>
                      )}
                    </Button>

                    <p className="text-xs text-text-secondary text-center mt-4">
                      By placing this order, you agree to our pre-order terms. 
                      Your card will be charged immediately to secure your discount.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}