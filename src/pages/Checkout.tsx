import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent, Textarea } from '../components/ui'
import { useCartStore } from '../stores/cart.store'
import { useAuthStore } from '../stores/auth.store'
import { useBrands } from '../hooks/useBrands'

type CheckoutStep = 'details' | 'process' | 'confirmation'

interface StepIndicatorProps {
  currentStep: CheckoutStep
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: 'details', label: '1', name: 'Details' },
    { id: 'process', label: '2', name: 'Process' },
    { id: 'confirmation', label: '3', name: 'Confirmation' }
  ]
  
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  
  return (
    <div className="flex justify-center mb-10">
      <div className="flex items-center gap-3">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all
              ${index <= currentIndex ? 'bg-rose-gold text-white' : 'bg-gray-200 text-text-secondary'}
              ${index < currentIndex ? 'bg-success-green' : ''}
            `}>
              {index < currentIndex ? '✓' : step.label}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 transition-all ${
                index < currentIndex ? 'bg-rose-gold' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { cart, moqStatuses } = useCartStore()
  const { user } = useAuthStore()
  const { brands } = useBrands()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('details')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    additionalNotes: '',
    processSteps: {
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      step5: false,
      step6: false
    }
  })
  
  // Group cart items by brand and filter only those meeting MOQ
  const brandGroups = React.useMemo(() => {
    const groups: Record<string, any> = {}
    
    cart.items.forEach(item => {
      if (!groups[item.product.brandId]) {
        const brand = brands.find(b => b.id === item.product.brandId)
        const moqStatus = moqStatuses.find(s => s.brandId === item.product.brandId)
        
        groups[item.product.brandId] = {
          brandId: item.product.brandId,
          brandName: brand?.name.en || 'Unknown Brand',
          items: [],
          subtotal: 0,
          totalItems: 0,
          moq: brand?.minimumOrder || 0,
          moqStatus: moqStatus?.status || 'error'
        }
      }
      
      groups[item.product.brandId].items.push(item)
      groups[item.product.brandId].subtotal += item.product.price.item * item.quantity
      groups[item.product.brandId].totalItems += item.quantity
    })
    
    // Filter only brands meeting MOQ
    return Object.values(groups).filter((g: any) => g.moqStatus === 'met')
  }, [cart.items, brands, moqStatuses])
  
  useEffect(() => {
    if (brandGroups.length > 0 && !selectedBrand) {
      setSelectedBrand(brandGroups[0].brandId)
    }
  }, [brandGroups, selectedBrand])
  
  const selectedBrandGroup = brandGroups.find((g: any) => g.brandId === selectedBrand)
  
  const handleProceedToProcess = () => {
    if (!orderData.shippingAddress.trim()) {
      alert('Please enter a shipping address')
      return
    }
    setCurrentStep('process')
  }
  
  const handleProceedToConfirmation = () => {
    const allChecked = Object.values(orderData.processSteps).every(v => v)
    if (!allChecked) {
      alert('Please check all process steps to continue')
      return
    }
    setCurrentStep('confirmation')
  }
  
  
  if (brandGroups.length === 0) {
    return (
      <Layout>
        <Section className="text-center py-20">
          <Container size="sm">
            <h2 className="text-3xl font-light mb-4">No brands meet minimum order requirements</h2>
            <p className="text-text-secondary mb-8">Add more items to proceed with checkout</p>
            <Button onClick={() => navigate('/cart')}>Return to Cart</Button>
          </Container>
        </Section>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <Section>
        <Container size="md">
          <StepIndicator currentStep={currentStep} />
          
          <h1 className="text-3xl font-light text-center mb-8">
            Checkout: {selectedBrandGroup?.brandName || ''} Order
          </h1>
          
          {/* Brand selector if multiple brands */}
          {brandGroups.length > 1 && (
            <div className="mb-8 text-center">
              <p className="text-text-secondary mb-3">Select brand to checkout:</p>
              <div className="flex justify-center gap-3">
                {brandGroups.map((group: any) => (
                  <Button
                    key={group.brandId}
                    variant={selectedBrand === group.brandId ? 'primary' : 'secondary'}
                    onClick={() => setSelectedBrand(group.brandId)}
                  >
                    {group.brandName}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 1: Order Details */}
          {currentStep === 'details' && selectedBrandGroup && (
            <Card>
              <CardContent>
                <h3 className="text-xl font-medium mb-6">Step 1: Confirm Your Order Details</h3>
                
                {/* Company Info */}
                <div className="bg-soft-pink p-5 rounded-lg mb-6">
                  <p className="font-medium mb-2">Company Information</p>
                  <p>{user?.name || 'Beauty Store Ltd.'}</p>
                  <p>123 High Street, London, UK</p>
                  <p>VAT: GB123456789</p>
                </div>
                
                {/* Shipping Address */}
                <div className="mb-6">
                  <Textarea
                    label="Shipping Address"
                    value={orderData.shippingAddress}
                    onChange={(e) => setOrderData({ ...orderData, shippingAddress: e.target.value })}
                    rows={3}
                    placeholder="Enter your shipping address..."
                    required
                  />
                </div>
                
                {/* Additional Notes */}
                <div className="mb-6">
                  <Textarea
                    label="Additional Notes"
                    value={orderData.additionalNotes}
                    onChange={(e) => setOrderData({ ...orderData, additionalNotes: e.target.value })}
                    rows={3}
                    placeholder="Any special delivery instructions or requirements..."
                  />
                </div>
                
                {/* Order Summary */}
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h4 className="font-medium mb-3">Order Summary</h4>
                  {selectedBrandGroup.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between mb-2 text-sm">
                      <span>{item.product.name} ({item.quantity} items)</span>
                      <span>£{(item.product.price.item * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>£{selectedBrandGroup.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button fullWidth onClick={handleProceedToProcess}>
                  Confirm and Continue
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Understanding the Process */}
          {currentStep === 'process' && (
            <Card>
              <CardContent>
                <h3 className="text-xl font-medium mb-6">Step 2: Understanding Your Order Process</h3>
                
                <p className="text-text-secondary mb-6">
                  Please review and acknowledge each step of the order process:
                </p>
                
                {[
                  {
                    key: 'step1',
                    title: '1. Order Confirmation (Now)',
                    desc: 'Your order details will be sent to the brand for processing.'
                  },
                  {
                    key: 'step2',
                    title: '2. Manufacturer Confirmation (24-48 hours)',
                    desc: 'The brand will confirm stock availability and prepare your order.'
                  },
                  {
                    key: 'step3',
                    title: '3. Final Invoice Generation',
                    desc: 'We\'ll generate your final invoice including all shipping costs and documentation.'
                  },
                  {
                    key: 'step4',
                    title: '4. Document Signing & Payment',
                    desc: 'You\'ll receive an email to sign documents and pay the final invoice.'
                  },
                  {
                    key: 'step5',
                    title: '5. Shipment Arrangement',
                    desc: 'Once payment is received, we\'ll arrange shipment with the brand.'
                  },
                  {
                    key: 'step6',
                    title: '6. Order Tracking',
                    desc: 'Track your order status through the LYS platform and receive updates.'
                  }
                ].map((step) => (
                  <div key={step.key} className="bg-soft-pink p-4 rounded-lg mb-4 flex gap-3">
                    <input
                      type="checkbox"
                      checked={orderData.processSteps[step.key as keyof typeof orderData.processSteps]}
                      onChange={(e) => setOrderData({
                        ...orderData,
                        processSteps: {
                          ...orderData.processSteps,
                          [step.key]: e.target.checked
                        }
                      })}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-text-secondary mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
                
                <div className="bg-warning-amber bg-opacity-10 border border-warning-amber p-4 rounded-lg mb-6">
                  <p className="text-sm">
                    <strong>Important:</strong> All checkboxes must be checked to proceed
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setCurrentStep('details')}>
                    Back
                  </Button>
                  <Button onClick={handleProceedToConfirmation} className="flex-1">
                    I Understand - Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Order Confirmation */}
          {currentStep === 'confirmation' && selectedBrandGroup && (
            <Card>
              <CardContent className="text-center py-10">
                <div className="w-20 h-20 bg-success-green rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6">
                  ✓
                </div>
                
                <h2 className="text-2xl font-medium mb-4">Order Submitted Successfully!</h2>
                
                <p className="text-text-secondary mb-8">
                  Your order has been submitted to {selectedBrandGroup.brandName} for processing.
                </p>
                
                <div className="bg-soft-pink p-6 rounded-lg mb-8 text-left max-w-md mx-auto">
                  <h4 className="font-medium mb-3">Order Reference: #ORD-{Date.now()}</h4>
                  <p className="text-sm text-text-secondary">Brand: {selectedBrandGroup.brandName}</p>
                  <p className="text-sm text-text-secondary">Total Items: {selectedBrandGroup.totalItems}</p>
                  <p className="text-sm text-text-secondary">
                    Estimated Total: £{selectedBrandGroup.subtotal.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-gray-100 p-6 rounded-lg mb-8 text-left max-w-md mx-auto">
                  <h4 className="font-medium mb-3">What Happens Next?</h4>
                  <ol className="text-sm text-left space-y-2">
                    <li>1. You'll receive email confirmation within minutes</li>
                    <li>2. {selectedBrandGroup.brandName} will confirm within 24-48 hours</li>
                    <li>3. Final invoice will be sent for payment</li>
                    <li>4. Track all updates in the order messages</li>
                  </ol>
                </div>
                
                <div className="flex gap-3 max-w-md mx-auto">
                  <Button variant="secondary" onClick={() => navigate('/cart')}>
                    Back to Cart
                  </Button>
                  <Button onClick={() => navigate('/orders')}>
                    View Orders
                  </Button>
                </div>
                
                {brandGroups.length > 1 && (
                  <p className="text-text-secondary text-sm mt-6">
                    You have {brandGroups.length - 1} more brand order(s) to process
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </Container>
      </Section>
    </Layout>
  )
}