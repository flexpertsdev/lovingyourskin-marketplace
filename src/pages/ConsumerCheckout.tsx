import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent, Input, Select } from '../components/ui'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import { useAuthStore } from '../stores/auth.store'
import { orderService } from '../services'
import toast from 'react-hot-toast'

export const ConsumerCheckout: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, getSubtotal, getTotalAmount, clearCart } = useConsumerCartStore()
  
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
      // Group items by brand
      const itemsByBrand = items.reduce((acc, item) => {
        const brandId = item.product.brandId
        if (!acc[brandId]) {
          acc[brandId] = []
        }
        acc[brandId].push(item)
        return acc
      }, {} as Record<string, typeof items>)
      
      // Create an order for each brand
      const orderPromises = Object.entries(itemsByBrand).map(async ([brandId, brandItems]) => {
        const brandName = brandItems[0].product.brand?.name
        const brandNameStr = brandName || 'Unknown Brand'
        
        const orderData = {
          userId: user?.id || 'consumer-' + Date.now(),
          userType: 'consumer' as const,
          consumerId: user?.id || 'consumer-' + Date.now(),
          brandId,
          brandName: brandNameStr,
          status: 'pending' as const,
          items: brandItems.map(item => {
            const basePrice = item.product.retailPrice?.item || item.product.price?.retail || 0
            const price = item.product.isPreorder && item.product.preorderDiscount
              ? basePrice * (1 - item.product.preorderDiscount / 100)
              : basePrice
            
            return {
              productId: item.product.id,
              productName: item.product.name,
              quantity: item.quantity,
              pricePerItem: price,
              pricePerCarton: price, // For B2C, price per item and carton are the same
              totalPrice: price * item.quantity
            }
          }),
          totalAmount: {
            items: brandItems.reduce((sum, item) => {
              const basePrice = item.product.retailPrice?.item || item.product.price?.retail || 0
              const price = item.product.isPreorder && item.product.preorderDiscount
                ? basePrice * (1 - item.product.preorderDiscount / 100)
                : basePrice
              return sum + (price * item.quantity)
            }, 0),
            shipping: 0, // Calculate based on location
            tax: 0, // Will be calculated
            total: 0, // Will be calculated
            currency: 'GBP' as const
          },
          shippingAddress: {
            name: formData.name,
            street: formData.address.street,
            city: formData.address.city,
            postalCode: formData.address.postalCode,
            country: formData.address.country,
            phone: formData.phone
          },
          paymentMethod: formData.paymentMethod,
          paymentStatus: 'pending' as const,
          timeline: [],
          documents: [],
          messageThreadId: ''
        }
        
        // Calculate tax and total
        orderData.totalAmount.tax = orderData.totalAmount.items * 0.2 // 20% VAT
        orderData.totalAmount.total = orderData.totalAmount.items + orderData.totalAmount.tax + orderData.totalAmount.shipping
        
        return orderService.create(orderData)
      })
      
      await Promise.all(orderPromises)
      
      // Clear cart after successful order creation
      clearCart()
      
      toast.success('Order placed successfully!')
      navigate('/shop/orders')
    } catch (error) {
      console.error('Failed to create order:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Calculate totals
  const subtotal = getSubtotal()
  const taxRate = 0.2 // 20% VAT
  const tax = subtotal * taxRate
  const shipping: number = 0 // Free shipping for now
  const total = getTotalAmount() + shipping
  
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
                            <p>£{(price * item.quantity).toFixed(2)}</p>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Totals */}
                    <div className="border-t border-border-gray pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>£{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (VAT 20%)</span>
                        <span>£{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-border-gray pt-4 mt-4">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-medium">Total</span>
                        <span className="text-2xl font-medium text-rose-gold">
                          £{total.toFixed(2)}
                        </span>
                      </div>
                      
                      <Button 
                        type="submit"
                        fullWidth
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Place Order'}
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