import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent, Input, Select, Badge } from '../components/ui'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import { usePreorderStore } from '../stores/preorder.store'
import { useAuthStore } from '../stores/auth.store'
import { stripeService } from '../services/stripe/stripe.service'
import { preorderService } from '../services'
import { DiscountCodeInput } from '../components/features/DiscountCodeInput'
import { PriceDisplay } from '../components/features/PriceDisplay'
import { ConsumerCartItem } from '../types'
import toast from 'react-hot-toast'

export const ConsumerCheckout: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  // Check if this is a preorder checkout
  const isPreorderCheckout = searchParams.get('mode') === 'preorder'
  
  // Regular cart store
  const { 
    items: regularItems, 
    getSubtotal: getRegularSubtotal, 
    getTotalAmount: getRegularTotal, 
    getAffiliateDiscount,
    affiliateCode,
    affiliateDiscount 
  } = useConsumerCartStore()
  
  // Preorder store
  const {
    preorderItems,
    getTotalWithDiscount: getPreorderTotal,
    activeCampaign,
    clearPreorderCart
  } = usePreorderStore()
  
  // Use appropriate items based on checkout mode
  const items = isPreorderCheckout ? preorderItems : regularItems
  const getSubtotal = isPreorderCheckout 
    ? () => preorderItems.reduce((total, item) => total + (item.pricePerItem * item.quantity), 0)
    : getRegularSubtotal
  const getTotalAmount = isPreorderCheckout ? getPreorderTotal : getRegularTotal
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Shipping information
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
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
      navigate(isPreorderCheckout ? '/shop/preorders' : '/shop')
    }
  }, [items, navigate, isPreorderCheckout])
  
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
      // For preorders, create draft preorder first
      let preorderId = undefined
      if (isPreorderCheckout && activeCampaign) {
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
          shippingAddress: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            street: formData.address.street,
            city: formData.address.city,
            postalCode: formData.address.postalCode,
            country: formData.address.country
          },
          paymentMethod: 'stripe',
          totalAmount: getTotalAmount()
        })
        
        if (!draftPreorder) {
          throw new Error('Failed to create pre-order')
        }
        preorderId = draftPreorder.id
      }
      
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

      // Transform items for Stripe (handle both regular and preorder items)
      const stripeItems = isPreorderCheckout 
        ? preorderItems.map(item => ({
            id: item.productId,
            product: item.product,
            quantity: item.quantity,
            productId: item.productId,
            productName: item.product.name,
            productDescription: item.product.description || '',
            brandId: item.product.brandId,
            pricePerItem: item.discountedPrice,
            images: item.product.images?.primary ? [item.product.images.primary] : [],
            addedAt: new Date(),
            preOrderDiscount: item.discountPercentage
          } as ConsumerCartItem))
        : items

      // Build metadata for Stripe
      const metadata: Record<string, string> = {
        orderType: isPreorderCheckout ? 'preorder' : 'b2c'
      }
      
      if (isPreorderCheckout && activeCampaign && preorderId) {
        metadata.preorderId = preorderId
        metadata.campaignId = activeCampaign.id
        metadata.campaignName = activeCampaign.name
        metadata.preorderDate = activeCampaign.preorderDate.toDate ? 
          activeCampaign.preorderDate.toDate().toISOString() : 
          activeCampaign.preorderDate
        metadata.deliveryTimeframe = activeCampaign.deliveryTimeframe
        metadata.discountPercentage = activeCampaign.discountPercentage.toString()
      }

      // Create Stripe checkout session
      const { sessionUrl } = await stripeService.createB2CCheckoutSession({
        items: stripeItems as ConsumerCartItem[],
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
        successUrl: isPreorderCheckout && preorderId
          ? `${window.location.origin}/shop/checkout-success?session_id={CHECKOUT_SESSION_ID}&preorder_id=${preorderId}`
          : `${window.location.origin}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: isPreorderCheckout 
          ? `${window.location.origin}/shop/preorder-cart`
          : `${window.location.origin}/shop/cart`,
        affiliateCode: !isPreorderCheckout ? affiliateCode : undefined,
        affiliateDiscount: !isPreorderCheckout ? affiliateDiscount : undefined,
        metadata
      })

      // Clear appropriate cart before redirecting
      if (isPreorderCheckout) {
        clearPreorderCart()
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
  const discount = isPreorderCheckout 
    ? subtotal - getTotalAmount() // Preorder discount
    : getAffiliateDiscount() // Affiliate discount
  const total = getTotalAmount()
  // VAT is included in prices - calculate the VAT portion for display
  const vatIncluded = total - (total / 1.2)
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    })
  }
  
  return (
    <Layout>
      <Section>
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-light mb-2">
              {isPreorderCheckout ? 'Pre-order Checkout' : 'Checkout'}
            </h1>
            {isPreorderCheckout && activeCampaign && (
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
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Contact & Shipping */}
              <div className="lg:col-span-2 space-y-6">
                {/* Campaign Info for Preorders */}
                {isPreorderCheckout && activeCampaign && (
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
                            { value: 'Spain', label: 'Spain' },
                            { value: 'Netherlands', label: 'Netherlands' },
                            { value: 'Belgium', label: 'Belgium' },
                            { value: 'Austria', label: 'Austria' },
                            { value: 'Ireland', label: 'Ireland' },
                            { value: 'Portugal', label: 'Portugal' },
                            { value: 'Poland', label: 'Poland' },
                            { value: 'Sweden', label: 'Sweden' },
                            { value: 'Denmark', label: 'Denmark' },
                            { value: 'Finland', label: 'Finland' },
                            { value: 'Norway', label: 'Norway' },
                            { value: 'Switzerland', label: 'Switzerland' },
                            { value: 'Czech Republic', label: 'Czech Republic' },
                            { value: 'Greece', label: 'Greece' },
                            { value: 'Hungary', label: 'Hungary' },
                            { value: 'Romania', label: 'Romania' }
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
                      {isPreorderCheckout ? (
                        // Preorder items display
                        preorderItems.map((item) => (
                          <div key={item.productId} className="flex justify-between text-sm">
                            <div>
                              <p>{item.product.name}</p>
                              <p className="text-text-secondary">Qty: {item.quantity}</p>
                              <p className="text-success-green text-xs">
                                Pre-order: {item.discountPercentage}% off
                              </p>
                            </div>
                            <PriceDisplay amountUSD={item.discountedPrice * item.quantity} />
                          </div>
                        ))
                      ) : (
                        // Regular items display
                        regularItems.map((item) => {
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
                              <PriceDisplay amountUSD={price * item.quantity} />
                            </div>
                          )
                        })
                      )}
                    </div>
                    
                    {/* Discount Code Input - only for regular checkout */}
                    {!isPreorderCheckout && (
                      <div className="mb-4">
                        <DiscountCodeInput />
                      </div>
                    )}
                    
                    {/* Totals */}
                    <div className="border-t border-border-gray pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <PriceDisplay amountUSD={subtotal} size="small" />
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>{isPreorderCheckout ? 'Pre-order Discount' : 'Discount'}</span>
                          <span className="text-green-600">-<PriceDisplay amountUSD={discount} size="small" /></span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Shipping</span>
                        <span>FREE</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>VAT included</span>
                        <PriceDisplay amountUSD={vatIncluded} size="small" />
                      </div>
                    </div>
                    
                    <div className="border-t border-border-gray pt-4 mt-4">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-medium">Total</span>
                        <PriceDisplay amountUSD={total} size="large" />
                      </div>
                      
                      <Button 
                        type="submit"
                        fullWidth
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : isPreorderCheckout ? 'Place Pre-order' : 'Continue to Payment'}
                      </Button>
                      
                      <p className="text-xs text-text-secondary text-center mt-4">
                        {isPreorderCheckout 
                          ? 'By placing this pre-order, you agree to our pre-order terms. Your card will be charged immediately to secure your discount.'
                          : 'By placing this order, you agree to our terms and conditions'}
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