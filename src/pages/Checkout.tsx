import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge } from '../components/ui'
import { useCartStore } from '../stores/cart.store'
import { useAuthStore } from '../stores/auth.store'
import { useCurrencyStore } from '../stores/currency.store'
import { orderService, discountService, brandService } from '../services'
import { getProductName } from '../utils/product-helpers'
import { formatConvertedPrice } from '../utils/currency'
import toast from 'react-hot-toast'
import { AlertTriangle } from 'lucide-react'

export const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { currentCurrency } = useCurrencyStore()
  const {
    brands,
    setBrands,
    appliedDiscounts,
    applyDiscountCode,
    removeDiscountCode,
    clearDiscountCodes,
    getAllBrandCartSummaries,
    getFilteredCartItems,
    clearBrandItems
  } = useCartStore()
  
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
  const [filteredBrandIds, setFilteredBrandIds] = useState<string[] | null>(null)
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
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
  
  // Parse URL parameters for brand filtering
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const brandParam = searchParams.get('brand')
    const brandsParam = searchParams.get('brands')
    
    if (brandParam) {
      setFilteredBrandIds([brandParam])
    } else if (brandsParam) {
      setFilteredBrandIds(brandsParam.split(','))
    } else {
      setFilteredBrandIds(null) // All brands
    }
  }, [location.search])
  
  // Load brand data
  useEffect(() => {
    const loadBrandData = async () => {
      try {
        const allBrands = await brandService.getBrands()
        setBrands(allBrands)
      } catch (error) {
        console.error('Failed to load brand data:', error)
        toast.error('Failed to load brand information')
      }
    }
    
    if (brands.length === 0) {
      loadBrandData()
    }
  }, [brands.length, setBrands])
  
  // Get eligible items for checkout (filtered by URL params if provided)
  const checkoutItems = getFilteredCartItems(filteredBrandIds || undefined)
  const brandSummaries = getAllBrandCartSummaries()
    .filter(summary => {
      if (!filteredBrandIds) return summary.canCheckout
      return filteredBrandIds.includes(summary.brandId) && summary.canCheckout
    })
  
  const excludedBrandSummaries = getAllBrandCartSummaries()
    .filter(summary => {
      if (!filteredBrandIds) return false
      return !filteredBrandIds.includes(summary.brandId) || !summary.canCheckout
    })
  
  const subtotal = brandSummaries.reduce((sum, summary) => sum + summary.subtotal, 0)
  const totalDiscounts = brandSummaries.reduce((sum, summary) => {
    const volumeDiscountSavings = summary.volumeDiscount?.savings || 0
    const codeDiscountSavings = summary.appliedDiscountCodes.reduce(
      (codeSum, discount) => codeSum + (discount.discountAmount || 0), 0
    )
    return sum + volumeDiscountSavings + codeDiscountSavings
  }, 0)
  const taxRate = 0.2 // 20% VAT
  const discountedSubtotal = subtotal - totalDiscounts
  const tax = discountedSubtotal * taxRate
  const total = discountedSubtotal + tax
  
  // Validate discount code
  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return
    
    setIsValidatingDiscount(true)
    try {
      // Get brand IDs from eligible items
      const brandIds = [...new Set(checkoutItems.map(item => item.product.brandId))]
      
      // Check if this is a new customer
      const isNewCustomer = !user?.createdAt ||
        (new Date().getTime() - new Date(user.createdAt).getTime()) < 24 * 60 * 60 * 1000
      
      const validation = await discountService.validateDiscountCode(discountCode, {
        customerId: user?.id,
        orderValue: subtotal,
        brandIds: brandIds,
        isNewCustomer: isNewCustomer,
        cartItems: checkoutItems,
        isB2BOrder: true
      })
      
      if (validation.valid) {
        applyDiscountCode(validation)
        setDiscountCode('')
        toast.success(`Discount code "${validation.discountCode?.code}" applied successfully!`)
      } else {
        toast.error(validation.error || 'Invalid discount code')
      }
    } catch (error) {
      console.error('Error validating discount code:', error)
      toast.error('Failed to validate discount code')
    } finally {
      setIsValidatingDiscount(false)
    }
  }
  
  const handleRemoveDiscountCode = (discountCodeId: string) => {
    removeDiscountCode(discountCodeId)
    toast.success('Discount code removed')
  }
  
  const canProceed = () => {
    if (currentStep === 1) {
      return (
        companyInfo.companyName.trim().length > 0 &&
        companyInfo.companyRegistrationNumber.trim().length > 0 &&
        shippingAddress.street.trim().length > 0 &&
        shippingAddress.city.trim().length > 0 &&
        shippingAddress.postalCode.trim().length > 0 &&
        brandSummaries.length > 0
      )
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
      submitOrders()
    }
  }
  
  const submitOrders = async () => {
    setIsProcessing(true)
    
    try {
      const createdOrderIds: string[] = []
      
      // Create separate order for each brand
      for (const brandSummary of brandSummaries) {
        const brand = brands.find(b => b.id === brandSummary.brandId)
        if (!brand) continue
        
        const orderData = {
          userId: user?.id || '',
          userType: 'retailer' as const,
          retailerId: user?.id || '',
          retailerName: companyInfo.companyName,
          retailerCompanyId: companyInfo.companyRegistrationNumber,
          brandId: brandSummary.brandId,
          brandName: brandSummary.brandName,
          items: brandSummary.items.map(item => {
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
              quantity: item.quantity,
              pricePerItem,
              pricePerCarton,
              totalPrice: pricePerCarton * item.quantity
            }
          }),
          status: 'pending' as const,
          totalAmount: {
            items: brandSummary.subtotal,
            shipping: 0,
            tax: (brandSummary.total - brandSummary.subtotal) * taxRate, // Calculate tax portion
            discount: brandSummary.subtotal - brandSummary.total + ((brandSummary.total - brandSummary.subtotal) * taxRate),
            total: brandSummary.total,
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
          messageThreadId: `order-${Date.now()}-${brandSummary.brandId}`,
          notes: additionalNotes,
          // Include discount information if applicable
          ...(brandSummary.appliedDiscountCodes.length > 0 && {
            discountCodes: brandSummary.appliedDiscountCodes.map(discount => ({
              code: discount.discountCode?.code || '',
              id: discount.discountCode?.id || '',
              amount: discount.discountAmount || 0,
              type: discount.discountCode?.discountType || 'percentage'
            }))
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const order = await orderService.createOrder(orderData)
        createdOrderIds.push(order.id)
        
        // Clear items from this brand from cart
        await clearBrandItems(brandSummary.brandId)
      }
      
      // Record discount usage if applicable
      for (const discount of appliedDiscounts) {
        if (discount.valid && discount.discountCode) {
          try {
            await discountService.recordDiscountUsage({
              discountCodeId: discount.discountCode.id,
              discountCode: discount.discountCode.code,
              customerId: user?.id,
              customerEmail: user?.email || '',
              orderId: createdOrderIds.join(','),
              orderValue: subtotal,
              discountAmount: discount.discountAmount || 0
            })
          } catch (error) {
            console.error('Error recording discount usage:', error)
          }
        }
      }
      
      // Clear applied discount codes
      clearDiscountCodes()
      
      setOrderIds(createdOrderIds)
    } catch (error) {
      console.error('Failed to submit orders:', error)
      toast.error('Failed to submit orders. Please try again.')
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
  
  // Redirect if no eligible items
  if (checkoutItems.length === 0 && currentStep !== 3) {
    navigate('/cart')
    return null
  }
  
  return (
    <Layout>
      <Section>
        <Container size="md">
          <h1 className="text-3xl font-light text-center mb-8">Checkout</h1>
          
          <StepIndicator />
          
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Filtered checkout warning */}
                {filteredBrandIds && excludedBrandSummaries.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-orange-600 mt-1" size={20} />
                        <div>
                          <h3 className="font-medium text-orange-800 mb-2">
                            Partial Checkout
                          </h3>
                          <p className="text-sm text-orange-700 mb-3">
                            Some brands in your cart don't meet checkout requirements and have been excluded.
                          </p>
                          {excludedBrandSummaries.map(summary => (
                            <div key={summary.brandId} className="text-sm text-orange-600 mb-1">
                              • {summary.brandName} - {!summary.canCheckout ? 'MOQ not met' : 'Not selected'}
                            </div>
                          ))}
                          <p className="text-xs text-orange-600 mt-2">
                            You can complete these orders separately or add more items to meet requirements.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Order Items by Brand */}
                {brandSummaries.map(brandSummary => (
                  <Card key={brandSummary.brandId}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{brandSummary.brandName}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="success">Ready for Checkout</Badge>
                          {brandSummary.moqStatus.moaExceeded && (
                            <Badge variant="info">MOA Exceeded</Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Volume Discount Applied */}
                      {brandSummary.volumeDiscount?.discount && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 text-sm font-medium">
                            Volume Discount Applied: {brandSummary.volumeDiscount.discount.discountPercentage}% off!
                            Save {formatConvertedPrice(brandSummary.volumeDiscount.savings, currentCurrency)}
                          </p>
                        </div>
                      )}

                      {/* Applied Discount Codes */}
                      {brandSummary.appliedDiscountCodes.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-blue-800 text-sm font-medium mb-2">Discount Codes Applied:</p>
                          {brandSummary.appliedDiscountCodes.map((discount, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-blue-700 text-sm">
                                {discount.discountCode?.code} - {formatConvertedPrice(discount.discountAmount || 0, currentCurrency)} off
                              </span>
                              <button
                                onClick={() => handleRemoveDiscountCode(discount.discountCode?.id || '')}
                                className="text-red-600 hover:underline text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Brand Items */}
                      <div className="space-y-3">
                        {brandSummary.items.map(item => {
                          const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice ||
                            item.product.price?.wholesale ||
                            item.product.price?.retail ||
                            item.product.retailPrice?.item || 0
                          const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton ||
                            item.product.itemsPerCarton || 1
                          const pricePerCarton = pricePerItem * unitsPerCarton

                          return (
                            <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                              <div className="flex-1">
                                <h4 className="font-medium">{getProductName(item.product)}</h4>
                                <p className="text-sm text-gray-600">
                                  {item.product.volume} • {unitsPerCarton} items per carton
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatConvertedPrice(pricePerItem, currentCurrency)} per item
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {item.quantity} carton{item.quantity !== 1 ? 's' : ''}
                                </p>
                                <p className="text-rose-gold font-medium">
                                  {formatConvertedPrice(pricePerCarton * item.quantity, currentCurrency)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Discount Code Section */}
                <Card>
                  <CardContent>
                    <h3 className="font-medium mb-4">Discount Code</h3>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && validateDiscountCode()}
                      />
                      <Button
                        variant="secondary"
                        onClick={validateDiscountCode}
                        disabled={!discountCode.trim() || isValidatingDiscount}
                      >
                        {isValidatingDiscount ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Company Name *</label>
                      <Input
                        value={companyInfo.companyName}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Your company name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Company Registration Number *</label>
                      <Input
                        value={companyInfo.companyRegistrationNumber}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, companyRegistrationNumber: e.target.value }))}
                        placeholder="Registration number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">VAT Number (optional)</label>
                      <Input
                        value={companyInfo.vatNumber}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, vatNumber: e.target.value }))}
                        placeholder="VAT number"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Contact Name *</label>
                        <Input
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Contact person name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Company</label>
                        <Input
                          value={shippingAddress.company}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Company name (if different)"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Street Address *</label>
                      <Input
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">City *</label>
                        <Input
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Postal Code *</label>
                        <Input
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="Postal code"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <select
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-gold"
                        >
                          <option value="UK">United Kingdom</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="IT">Italy</option>
                          <option value="ES">Spain</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <Input
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone number"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card>
                  <CardContent>
                    <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any special instructions or notes for your order..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-gold"
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary Sidebar */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Brand Summaries */}
                    {brandSummaries.map(summary => (
                      <div key={summary.brandId} className="pb-3 border-b border-gray-200 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{summary.brandName}</span>
                          <span className="text-sm text-gray-600">({summary.items.length} products)</span>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatConvertedPrice(summary.subtotal, currentCurrency)}</span>
                          </div>
                          
                          {summary.volumeDiscount && summary.volumeDiscount.savings > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Volume Discount ({summary.volumeDiscount.discount?.discountPercentage}%)</span>
                              <span>-{formatConvertedPrice(summary.volumeDiscount.savings, currentCurrency)}</span>
                            </div>
                          )}
                          
                          {summary.appliedDiscountCodes.map((discount, index) => (
                            <div key={index} className="flex justify-between text-blue-600">
                              <span>{discount.discountCode?.code}</span>
                              <span>-{formatConvertedPrice(discount.discountAmount || 0, currentCurrency)}</span>
                            </div>
                          ))}
                          
                          <div className="flex justify-between font-medium">
                            <span>Brand Total</span>
                            <span>{formatConvertedPrice(summary.total, currentCurrency)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Overall Totals */}
                    <div className="space-y-2 pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatConvertedPrice(subtotal, currentCurrency)}</span>
                      </div>
                      
                      {totalDiscounts > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Total Discounts</span>
                          <span>-{formatConvertedPrice(totalDiscounts, currentCurrency)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span>VAT (20%)</span>
                        <span>{formatConvertedPrice(tax, currentCurrency)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">Total</span>
                          <span className="text-xl font-bold text-rose-gold">
                            {formatConvertedPrice(total, currentCurrency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      fullWidth
                      onClick={handleProcessStep1}
                      disabled={!canProceed()}
                    >
                      Continue to Review
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Prices shown in {currentCurrency}. Final invoicing in GBP.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Review and Confirm Order</CardTitle>
                  <p className="text-gray-600">Please review your order details before submitting</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Processing Steps */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-lg mb-3">Order Processing Timeline</h3>
                    
                    {[
                      { key: 'step1', label: 'Order submitted and confirmed', time: 'Immediate' },
                      { key: 'step2', label: 'Invoice generated and sent', time: 'Within 24 hours' },
                      { key: 'step3', label: 'Payment processed', time: '3-5 business days' },
                      { key: 'step4', label: 'Order prepared for shipping', time: '1-2 business days after payment' },
                      { key: 'step5', label: 'Shipped to your address', time: '5-7 business days' },
                      { key: 'step6', label: 'Order delivered', time: '1-2 business days after shipping' }
                    ].map((step, index) => (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          processSteps[step.key as keyof typeof processSteps]
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {processSteps[step.key as keyof typeof processSteps] ? '✓' : index + 1}
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className={processSteps[step.key as keyof typeof processSteps] ? 'text-green-700 font-medium' : 'text-gray-700'}>
                            {step.label}
                          </span>
                          <span className="text-sm text-gray-500">{step.time}</span>
                        </div>
                        <button
                          onClick={() => setProcessSteps(prev => ({ ...prev, [step.key]: !prev[step.key as keyof typeof prev] }))}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            processSteps[step.key as keyof typeof processSteps]
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {processSteps[step.key as keyof typeof processSteps] ? 'Confirmed' : 'Confirm'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Company:</span>
                        <span>{companyInfo.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Brands:</span>
                        <span>{brandSummaries.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Items:</span>
                        <span>{brandSummaries.reduce((sum, s) => sum + s.items.length, 0)} products</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total Amount:</span>
                        <span className="text-rose-gold">{formatConvertedPrice(total, currentCurrency)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Back to Details
                    </Button>
                    <Button
                      onClick={handleProcessStep2}
                      disabled={!canProceed() || isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? 'Processing...' : 'Submit Orders'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto text-center">
              <Card>
                <CardContent className="py-12">
                  <div className="text-green-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4 text-green-700">Orders Submitted Successfully!</h2>
                  
                  <p className="text-gray-600 mb-6">
                    Thank you for your order. We've created {orderIds.length} separate {orderIds.length === 1 ? 'order' : 'orders'} for your brands.
                  </p>

                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium mb-2">What happens next?</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• You'll receive email confirmation for each order</li>
                      <li>• Invoices will be generated within 24 hours</li>
                      <li>• Our team will contact you for payment arrangements</li>
                      <li>• Orders will be prepared once payment is confirmed</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/orders')}
                      className="flex-1"
                    >
                      View Orders
                    </Button>
                    <Button
                      onClick={() => navigate('/brands')}
                      className="flex-1"
                    >
                      Continue Shopping
                    </Button>
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
