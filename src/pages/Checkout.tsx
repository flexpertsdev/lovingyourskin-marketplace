import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui'
import { useCartStore } from '../stores/cart.store'
import { useAuthStore } from '../stores/auth.store'
import { orderService } from '../services'
import { getProductName } from '../utils/product-helpers'

export const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cart, moqStatuses, getTotalPrice, clearBrandItems } = useCartStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [processSteps, setProcessSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false
  })
  const [orderIds, setOrderIds] = useState<string[]>([])
  
  // Group cart items by brand
  const brandGroups = cart.items.reduce((acc, item) => {
    const brandId = item.product.brandId
    if (!acc[brandId]) {
      acc[brandId] = {
        brandId,
        brandName: moqStatuses.find(s => s.brandId === brandId)?.brandName || brandId,
        items: []
      }
    }
    acc[brandId].items.push(item)
    return acc
  }, {} as Record<string, { brandId: string; brandName: string; items: typeof cart.items }>)
  
  const subtotal = getTotalPrice()
  const taxRate = 0.2 // 20% VAT
  const tax = subtotal * taxRate
  const total = subtotal + tax
  
  const canProceed = () => {
    if (currentStep === 1) {
      return shippingAddress.trim().length > 0
    }
    if (currentStep === 2) {
      return Object.values(processSteps).every(step => step)
    }
    return true
  }
  
  const handleProcessStep1 = () => {
    if (canProceed()) {
      setCurrentStep(2)
    }
  }
  
  const handleProcessStep2 = () => {
    if (canProceed()) {
      setCurrentStep(3)
      // Submit orders
      submitOrders()
    }
  }
  
  const submitOrders = async () => {
    setIsProcessing(true)
    
    try {
      const createdOrderIds: string[] = []
      
      // Create separate order for each brand
      for (const brandGroup of Object.values(brandGroups)) {
        const brandItems = brandGroup.items
        const brandSubtotal = brandItems.reduce((sum, item) => {
          const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                       item.product.price?.wholesale || 
                       item.product.price?.retail ||
                       item.product.retailPrice?.item || 0
          const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                item.product.itemsPerCarton || 1
          const pricePerCarton = pricePerItem * unitsPerCarton
          return sum + (pricePerCarton * item.quantity)
        }, 0)
        
        const brandTax = brandSubtotal * taxRate
        const brandTotal = brandSubtotal + brandTax
        
        const orderData = {
          userId: user?.id || '',
          brandId: brandGroup.brandId,
          brandName: brandGroup.brandName,
          items: brandItems.map(item => ({
            productId: item.product.id,
            productName: getProductName(item.product),
            quantity: item.quantity, // This is in cartons
            pricePerItem: item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                         item.product.price?.wholesale || 
                         item.product.price?.retail ||
                         item.product.retailPrice?.item || 0,
            unitsPerCarton: item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                           item.product.itemsPerCarton || 1
          })),
          status: 'pending' as const,
          subtotal: brandSubtotal,
          tax: brandTax,
          shipping: 0, // Calculated later
          total: brandTotal,
          shippingAddress,
          notes: additionalNotes,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const orderId = await orderService.createOrder(orderData)
        createdOrderIds.push(orderId)
        
        // Clear items from this brand from cart
        await clearBrandItems(brandGroup.brandId)
      }
      
      setOrderIds(createdOrderIds)
    } catch (error) {
      console.error('Failed to submit orders:', error)
      alert('Failed to submit orders. Please try again.')
      setCurrentStep(2)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
          currentStep >= 1 ? 'bg-rose-gold text-white' : 'bg-light-gray text-medium-gray'
        }`}>
          {currentStep > 1 ? '✓' : '1'}
        </div>
        <div className={`w-16 h-0.5 transition-colors ${
          currentStep >= 2 ? 'bg-rose-gold' : 'bg-light-gray'
        }`} />
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
          currentStep >= 2 ? 'bg-rose-gold text-white' : 'bg-light-gray text-medium-gray'
        }`}>
          {currentStep > 2 ? '✓' : '2'}
        </div>
        <div className={`w-16 h-0.5 transition-colors ${
          currentStep >= 3 ? 'bg-rose-gold' : 'bg-light-gray'
        }`} />
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
          currentStep >= 3 ? 'bg-rose-gold text-white' : 'bg-light-gray text-medium-gray'
        }`}>
          {currentStep > 3 ? '✓' : '3'}
        </div>
      </div>
    </div>
  )
  
  if (cart.items.length === 0 && currentStep !== 3) {
    navigate('/cart')
    return null
  }
  
  return (
    <Layout>
      <Section>
        <Container size="md">
          <h1 className="text-3xl font-light text-center mb-8">Checkout</h1>
          
          <StepIndicator />
          
          {/* Step 1: Order Details Confirmation */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Confirm Your Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Information */}
                <div className="bg-soft-pink p-4 rounded-lg">
                  <p className="font-medium mb-2">Company Information</p>
                  <p>{user?.companyName || 'Your Company'}</p>
                  <p>{user?.email}</p>
                  {user?.vatNumber && <p>VAT: {user.vatNumber}</p>}
                </div>
                
                {/* Shipping Address */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Shipping Address <span className="text-error-red">*</span>
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-3 border border-border-gray rounded-lg"
                    rows={3}
                    placeholder="Enter your complete shipping address..."
                    required
                  />
                </div>
                
                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="w-full p-3 border border-border-gray rounded-lg"
                    rows={3}
                    placeholder="Any special delivery instructions or requirements..."
                  />
                </div>
                
                {/* Order Summary by Brand */}
                {Object.values(brandGroups).map(brandGroup => {
                  const brandSubtotal = brandGroup.items.reduce((sum, item) => {
                    const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                                 item.product.price?.wholesale || 
                                 item.product.price?.retail ||
                                 item.product.retailPrice?.item || 0
                    const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                          item.product.itemsPerCarton || 1
                    const pricePerCarton = pricePerItem * unitsPerCarton
                    return sum + (pricePerCarton * item.quantity)
                  }, 0)
                  
                  return (
                    <div key={brandGroup.brandId} className="bg-light-gray p-4 rounded-lg">
                      <h4 className="font-medium mb-3">{brandGroup.brandName} Order</h4>
                      {brandGroup.items.map(item => {
                        const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                                     item.product.price?.wholesale || 
                                     item.product.price?.retail ||
                                     item.product.retailPrice?.item || 0
                        const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                              item.product.itemsPerCarton || 1
                        const pricePerCarton = pricePerItem * unitsPerCarton
                        const totalItems = item.quantity * unitsPerCarton
                        
                        return (
                          <div key={item.id} className="flex justify-between mb-2">
                            <span className="text-sm">
                              {getProductName(item.product)} ({totalItems} items)
                            </span>
                            <span className="text-sm font-medium">
                              ${(pricePerCarton * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        )
                      })}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span>Brand Total</span>
                          <span>${brandSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Total Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (20%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-medium">
                      <span>Total</span>
                      <span className="text-rose-gold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  fullWidth
                  onClick={handleProcessStep1}
                  disabled={!canProceed()}
                >
                  Confirm and Continue
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Understanding the Process */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Understanding Your Order Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-text-secondary mb-6">
                  Please review and acknowledge each step of the order process:
                </p>
                
                {/* Process Steps */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 bg-soft-pink rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={processSteps.step1}
                      onChange={(e) => setProcessSteps({...processSteps, step1: e.target.checked})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">1. Order Confirmation (Now)</p>
                      <p className="text-sm text-text-secondary mt-1">
                        Your order details will be sent to each brand for processing.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 bg-soft-pink rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={processSteps.step2}
                      onChange={(e) => setProcessSteps({...processSteps, step2: e.target.checked})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">2. Manufacturer Confirmation (24-48 hours)</p>
                      <p className="text-sm text-text-secondary mt-1">
                        Each brand will confirm stock availability and prepare your order.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 bg-soft-pink rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={processSteps.step3}
                      onChange={(e) => setProcessSteps({...processSteps, step3: e.target.checked})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">3. Final Invoice Generation</p>
                      <p className="text-sm text-text-secondary mt-1">
                        We'll generate your final invoice including all shipping costs and documentation. 
                        Any changes to shipping details may require invoice updates.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 bg-soft-pink rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={processSteps.step4}
                      onChange={(e) => setProcessSteps({...processSteps, step4: e.target.checked})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">4. Document Signing & Payment</p>
                      <p className="text-sm text-text-secondary mt-1">
                        You'll receive an email to sign documents and pay the final invoice 
                        (inclusive of all costs).
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 bg-soft-pink rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={processSteps.step5}
                      onChange={(e) => setProcessSteps({...processSteps, step5: e.target.checked})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">5. Shipment Arrangement</p>
                      <p className="text-sm text-text-secondary mt-1">
                        Once payment is received, we'll arrange shipment with each brand.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 bg-soft-pink rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={processSteps.step6}
                      onChange={(e) => setProcessSteps({...processSteps, step6: e.target.checked})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">6. Order Tracking</p>
                      <p className="text-sm text-text-secondary mt-1">
                        Track your order status through the LYS platform and receive updates 
                        via the order messaging system.
                      </p>
                    </div>
                  </label>
                </div>
                
                {!canProceed() && (
                  <div className="p-4 bg-warning-light rounded-lg">
                    <p className="text-sm font-medium">All checkboxes must be checked to proceed</p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleProcessStep2}
                    disabled={!canProceed() || isProcessing}
                    loading={isProcessing}
                  >
                    I Understand - Submit Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Order Submitted */}
          {currentStep === 3 && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="w-20 h-20 bg-success-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl">✓</span>
                </div>
                
                <h2 className="text-2xl font-light mb-4">Orders Submitted Successfully!</h2>
                
                <p className="text-text-secondary mb-8">
                  Your orders have been submitted to the respective brands for processing.
                </p>
                
                {orderIds.length > 0 && (
                  <div className="space-y-3 mb-8">
                    {orderIds.map((orderId, index) => {
                      const brandGroup = Object.values(brandGroups)[index]
                      return (
                        <div key={orderId} className="bg-soft-pink p-4 rounded-lg text-left">
                          <h4 className="font-medium mb-2">
                            Order #{orderId.slice(-8).toUpperCase()}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            Brand: {brandGroup?.brandName}
                          </p>
                          <p className="text-sm text-text-secondary">
                            Total Items: {brandGroup?.items.reduce((sum, item) => {
                              const units = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                           item.product.itemsPerCarton || 1
                              return sum + (item.quantity * units)
                            }, 0)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                <div className="bg-light-gray p-6 rounded-lg mb-8 text-left">
                  <h4 className="font-medium mb-3">What Happens Next?</h4>
                  <ol className="space-y-2 text-sm">
                    <li>1. You'll receive email confirmation within minutes</li>
                    <li>2. Each brand will confirm within 24-48 hours</li>
                    <li>3. Final invoices will be sent for payment</li>
                    <li>4. Track all updates in the order messages</li>
                  </ol>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/cart')}
                  >
                    Back to Cart
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => navigate('/orders')}
                  >
                    View Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </Container>
      </Section>
    </Layout>
  )
}