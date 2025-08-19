import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../components/ui'
import { useCartStore } from '../stores/cart.store'
import { useAuthStore } from '../stores/auth.store'
import { orderService, discountService } from '../services'
import { getProductName } from '../utils/product-helpers'
import { DiscountValidationResult } from '../types/discount'
import toast from 'react-hot-toast'

export const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cart, moqStatuses, getTotalPrice, clearBrandItems } = useCartStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
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
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [discountValidation, setDiscountValidation] = useState<DiscountValidationResult | null>(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  
  // Company information
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    companyRegistrationNumber: '',
    vatNumber: ''
  })
  
  // Shipping address as separate fields
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    company: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'UK',
    phone: ''
  })
  
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
  
  // Calculate discount
  const discountAmount = discountValidation?.valid ? (discountValidation.discountAmount || 0) : 0
  const discountedSubtotal = subtotal - discountAmount
  const tax = discountedSubtotal * taxRate
  const total = discountedSubtotal + tax
  
  // Validate discount code
  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountValidation(null)
      return
    }
    
    setIsValidatingDiscount(true)
    try {
      // Get unique brand IDs from cart
      const brandIds = Object.keys(brandGroups)
      
      // Check if this is a new customer (simplified check - you might want to improve this)
      const isNewCustomer = !user?.createdAt || 
        (new Date().getTime() - new Date(user.createdAt).getTime()) < 24 * 60 * 60 * 1000 // Less than 24 hours old
      
      const validation = await discountService.validateDiscountCode(discountCode, {
        customerId: user?.id,
        orderValue: subtotal,
        brandIds: brandIds,
        isNewCustomer: isNewCustomer
      })
      
      setDiscountValidation(validation)
      
      if (validation.valid) {
        toast.success('Discount code applied successfully!')
      } else {
        toast.error(validation.error || 'Invalid discount code')
      }
    } catch (error) {
      console.error('Error validating discount code:', error)
      toast.error('Failed to validate discount code')
      setDiscountValidation(null)
    } finally {
      setIsValidatingDiscount(false)
    }
  }
  
  const removeDiscountCode = () => {
    setDiscountCode('')
    setDiscountValidation(null)
  }
  
  const canProceed = () => {
    if (currentStep === 1) {
      // Validate company info and shipping address
      return companyInfo.companyName.trim().length > 0 &&
             companyInfo.companyRegistrationNumber.trim().length > 0 &&
             shippingAddress.street.trim().length > 0 &&
             shippingAddress.city.trim().length > 0 &&
             shippingAddress.postalCode.trim().length > 0
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
        
        // Calculate proportional discount for this brand
        const brandDiscountAmount = discountAmount > 0 
          ? (brandSubtotal / subtotal) * discountAmount 
          : 0
        
        const discountedBrandSubtotal = brandSubtotal - brandDiscountAmount
        const brandTax = discountedBrandSubtotal * taxRate
        const brandTotal = discountedBrandSubtotal + brandTax
        
        const orderData = {
          userId: user?.id || '',
          userType: 'retailer' as const,
          retailerId: user?.id || '',
          retailerName: companyInfo.companyName,
          retailerCompanyId: companyInfo.companyRegistrationNumber,
          brandId: brandGroup.brandId,
          brandName: brandGroup.brandName,
          items: brandItems.map(item => {
            const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                               item.product.price?.wholesale || 
                               item.product.price?.retail ||
                               item.product.retailPrice?.item || 0
            const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                 item.product.itemsPerCarton || 1
            const pricePerCarton = pricePerItem * unitsPerCarton
            return {
              productId: item.product.id,
              productName: getProductName(item.product),
              quantity: item.quantity, // This is in cartons
              pricePerItem,
              pricePerCarton,
              totalPrice: pricePerCarton * item.quantity
            }
          }),
          status: 'pending' as const,
          totalAmount: {
            items: brandSubtotal,
            shipping: 0,
            tax: brandTax,
            discount: brandDiscountAmount,
            total: brandTotal,
            currency: 'GBP' as const
          },
          shippingAddress: {
            name: shippingAddress.name,
            company: shippingAddress.company || companyInfo.companyName,
            street: shippingAddress.street,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            phone: shippingAddress.phone
          },
          paymentMethod: 'bank_transfer' as const,
          paymentStatus: 'pending' as const,
          timeline: [{
            status: 'pending' as const,
            timestamp: new Date(),
            description: 'Order created'
          }],
          documents: [],
          messageThreadId: `order-${Date.now()}-${brandGroup.brandId}`,
          notes: additionalNotes,
          // Include discount information if applicable
          ...(discountValidation?.valid && discountValidation.discountCode && {
            discountCode: discountValidation.discountCode.code,
            discountCodeId: discountValidation.discountCode.id,
            affiliateCode: discountValidation.affiliate ? discountValidation.discountCode.code : undefined,
            affiliateUserId: discountValidation.affiliate?.id
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const order = await orderService.createOrder(orderData)
        createdOrderIds.push(order.id)
        
        // Clear items from this brand from cart
        await clearBrandItems(brandGroup.brandId)
      }
      
      // Record discount usage if applicable
      if (discountValidation?.valid && discountValidation.discountCode) {
        try {
          await discountService.recordDiscountUsage({
            discountCodeId: discountValidation.discountCode.id,
            discountCode: discountValidation.discountCode.code,
            customerId: user?.id,
            customerEmail: user?.email || '',
            orderId: createdOrderIds.join(','), // Join all order IDs
            orderValue: subtotal,
            discountAmount: discountAmount
          })
        } catch (error) {
          console.error('Error recording discount usage:', error)
          // Don't fail the order if recording discount usage fails
        }
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
                <div className="space-y-4">
                  <h3 className="font-medium">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Company Name <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyInfo.companyName}
                        onChange={(e) => setCompanyInfo({...companyInfo, companyName: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                        placeholder="Your company name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Company Registration Number <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyInfo.companyRegistrationNumber}
                        onChange={(e) => setCompanyInfo({...companyInfo, companyRegistrationNumber: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                        placeholder="Company registration number"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        VAT Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={companyInfo.vatNumber}
                        onChange={(e) => setCompanyInfo({...companyInfo, vatNumber: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                        placeholder="VAT number (if applicable)"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div className="space-y-4">
                  <h3 className="font-medium">Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                        placeholder="Contact person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Company Name (if different)
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.company}
                        onChange={(e) => setShippingAddress({...shippingAddress, company: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                        placeholder="Shipping company name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Street Address <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        City <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Postal Code <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                        placeholder="Postal code"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Country
                      </label>
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                      >
                        <option value="UK">United Kingdom</option>
                        <option value="FR">France</option>
                        <option value="DE">Germany</option>
                        <option value="IT">Italy</option>
                        <option value="ES">Spain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className="w-full p-3 border border-border-gray rounded-lg"
                        placeholder="Contact phone number"
                      />
                    </div>
                  </div>
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
                
                {/* Discount Code Section */}
                <div className="bg-soft-pink p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Discount Code</h3>
                  {!discountValidation?.valid ? (
                    <div className="flex gap-3">
                      <Input
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Enter discount code"
                        disabled={isValidatingDiscount}
                      />
                      <Button
                        onClick={validateDiscountCode}
                        disabled={!discountCode.trim() || isValidatingDiscount}
                        loading={isValidatingDiscount}
                      >
                        Apply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-success-green">
                          ✓ {discountValidation.discountCode?.name}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {discountValidation.discountCode?.discountType === 'percentage' 
                            ? `${discountValidation.discountCode.discountValue}% off`
                            : `$${discountValidation.discountCode?.discountValue} off`
                          }
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={removeDiscountCode}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
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
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-success-green">
                        <span>Discount</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
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
                
                {discountValidation?.valid && (
                  <div className="bg-soft-pink p-4 rounded-lg mb-6">
                    <p className="text-sm font-medium text-success-green">
                      ✓ Discount code "{discountValidation.discountCode?.code}" applied successfully
                    </p>
                    <p className="text-sm text-text-secondary">
                      You saved ${discountAmount.toFixed(2)} on this order
                    </p>
                  </div>
                )}
                
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