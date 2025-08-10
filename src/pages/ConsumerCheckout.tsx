import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent, Input, Select } from '../components/ui'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import { useAuthStore } from '../stores/auth.store'
import { stripeService } from '../services/stripe/stripe.service'
import { useAffiliateTracking } from '../hooks/useAffiliateTracking'
import { formatCurrency } from '../utils/currency'
import toast from 'react-hot-toast'

export const ConsumerCheckout: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    items, 
    getSubtotal, 
    getTotalAmount, 
    getAffiliateDiscount,
    affiliateCode,
    affiliateDiscount 
  } = useConsumerCartStore()
  const { trackPurchase } = useAffiliateTracking()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Shipping information
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'United Kingdom'
    },
    // Payment method
    paymentMethod: 'stripe_card' as const
  })
  
  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      navigate('/shop')
    }
  }, [items, navigate])
  
  useEffect(() => {
    // Pre-fill with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone
      }))
      
      // If user has saved addresses, use the default one
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0]
        setFormData(prev => ({
          ...prev,
          address: {
            street: defaultAddress.street,
            city: defaultAddress.city,
            postalCode: defaultAddress.postalCode,
            country: defaultAddress.country
          }
        }))
      }
    }
  }, [user])
  
  const handleInputChange = (field: string, value: string | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const targetValue = typeof value === 'string' ? value : value.target.value;
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: targetValue
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: targetValue
      }))
    }
  }
  
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all contact information')
      return false
    }
    
    if (!formData.address.street || !formData.address.city || !formData.address.postalCode) {
      toast.error('Please fill in all shipping address fields')
      return false
    }
    
    return true
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      // Create or update Stripe customer
      let stripeCustomerId = undefined
      if (user) {
        const customer = await stripeService.createOrUpdateCustomer({
          email: formData.email,
          name: formData.name,
          metadata: {
            userId: user.id,
            userType: 'consumer'
          }
        })
        stripeCustomerId = customer.customerId
      }

      // Create Stripe checkout session
      const { sessionUrl } = await stripeService.createB2CCheckoutSession({
        items,
        customer: {
          email: formData.email,
          name: formData.name,
          id: stripeCustomerId
        },
        shippingAddress: {
          id: `address-${Date.now()}`,
          name: formData.name,
          street: formData.address.street,
          city: formData.address.city,
          postalCode: formData.address.postalCode,
          country: formData.address.country,
          phone: formData.phone
        },
        successUrl: `${window.location.origin}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/shop/cart`,
        affiliateCode: affiliateCode,
        affiliateDiscount: affiliateDiscount
      })

      // Track affiliate conversion if applicable
      if (affiliateCode) {
        const orderValue = getTotalAmount()
        await trackPurchase(`stripe-${Date.now()}`, orderValue)
      }

      // Redirect to Stripe Checkout
      window.location.href = sessionUrl
      
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      toast.error('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }
  
  // Calculate totals
  const subtotal = getSubtotal()
  const discount = getAffiliateDiscount()
  const total = getTotalAmount()
  // VAT is included in prices - calculate the VAT portion for display
  const vatIncluded = (subtotal - discount) - ((subtotal - discount) / 1.2)
  
  return (
    <Layout>
      <Section>
        <Container>
          <h1 className="text-3xl font-light mb-8">Checkout</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Contact & Shipping */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardContent>
                    <h2 className="text-xl font-medium mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+44 20 1234 5678"
                        required
                        className="md:col-span-2"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Shipping Address */}
                <Card>
                  <CardContent>
                    <h2 className="text-xl font-medium mb-4">Shipping Address</h2>
                    <div className="space-y-4">
                      <Input
                        label="Street Address"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        placeholder="123 Main Street"
                        required
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="City"
                          value={formData.address.city}
                          onChange={(e) => handleInputChange('address.city', e.target.value)}
                          required
                        />
                        <Input
                          label="Postal Code"
                          value={formData.address.postalCode}
                          onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                          required
                        />
                        <Select
                          label="Country"
                          value={formData.address.country}
                          onChange={(e) => handleInputChange('address.country', e.target.value)}
                          options={[
                            { value: 'United Kingdom', label: 'United Kingdom' },
                            { value: 'France', label: 'France' },
                            { value: 'Germany', label: 'Germany' },
                            { value: 'Italy', label: 'Italy' },
                            { value: 'Spain', label: 'Spain' }
                          ]}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment Method */}
                <Card>
                  <CardContent>
                    <h2 className="text-xl font-medium mb-4">Payment Method</h2>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-border-gray rounded-lg cursor-pointer hover:bg-soft-pink-hover transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe_card"
                          checked={formData.paymentMethod === 'stripe_card'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-text-secondary">Secure payment via Stripe</p>
                        </div>
                      </label>
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
                    <div className="space-y-3 mb-6">
                      {items.map((item) => {
                        const basePrice = item.product.retailPrice?.item || item.product.price?.retail || 0
                        const price = item.product.isPreorder && item.product.preorderDiscount
                          ? basePrice * (1 - item.product.preorderDiscount / 100)
                          : basePrice
                        
                        return (
                          <div key={`${item.product.id}-${item.id}`} className="flex justify-between text-sm">
                            <div>
                              <p>{item.product.name}</p>
                              <p className="text-text-secondary">Qty: {item.quantity}</p>
                              {item.product.isPreorder && item.product.preorderDiscount && (
                                <p className="text-success-green text-xs">Pre-order: {item.product.preorderDiscount}% off</p>
                              )}
                            </div>
                            <p>{formatCurrency(price * item.quantity)}</p>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Totals */}
                    <div className="border-t border-border-gray pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Shipping</span>
                        <span>FREE</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>VAT included</span>
                        <span>{formatCurrency(vatIncluded)}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-border-gray pt-4 mt-4">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-medium">Total</span>
                        <span className="text-2xl font-medium text-rose-gold">
                          {formatCurrency(total)}
                        </span>
                      </div>
                      
                      <Button 
                        type="submit"
                        fullWidth
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Continue to Payment'}
                      </Button>
                      
                      <p className="text-xs text-text-secondary text-center mt-4">
                        By placing this order, you agree to our terms and conditions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Container>
      </Section>
    </Layout>
  )
}