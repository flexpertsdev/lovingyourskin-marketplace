import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent, Badge, Input } from '../components/ui'
import { useCartStore } from '../stores/cart.store'
import { useCurrencyStore } from '../stores/currency.store'
import { formatConvertedPrice } from '../utils/currency'
import { getProductName, getProductPrimaryImage } from '../utils/product-helpers'
import { discountService } from '../services'
import { brandService } from '../services'
import toast from 'react-hot-toast'
import { DiscountCode, Brand } from '../types'

interface BrandCart {
  brandId: string
  brandName: string
  items: typeof cart.items
  subtotal: number
  moqMet: boolean
  moaExceeded: boolean // If total exceeds MOA, MOQ is waived
  volumeDiscount?: {
    percentage: number
    amount: number
    threshold: number
  }
  discountCodes: DiscountCode[] // Applied discount codes
  total: number // After all discounts
  canCheckout: boolean
}

interface DiscountApplication {
  type: 'volume' | 'code'
  brandId: string
  name: string
  amount: number
  percentage?: number
}

export const B2BCart: React.FC = () => {
  const navigate = useNavigate()
  const { currentCurrency } = useCurrencyStore()
  const { 
    cart, 
    moqStatuses,
    getTotalPrice, 
    removeFromCart, 
    updateQuantity,
    loadCart,
    validateAllMOQ,
    clearBrandItems
  } = useCartStore()
  
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscounts, setAppliedDiscounts] = useState<DiscountApplication[]>([])
  const [brandData, setBrandData] = useState<Record<string, Brand>>({})
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  
  useEffect(() => {
    loadCart()
  }, [loadCart])
  
  useEffect(() => {
    validateAllMOQ()
    loadBrandData()
  }, [cart.items, validateAllMOQ])

  const loadBrandData = async () => {
    const brandIds = [...new Set(cart.items.map(item => item.product.brandId))]
    const brandDataMap: Record<string, Brand> = {}
    
    for (const brandId of brandIds) {
      try {
        const brand = await brandService.getBrand(brandId)
        if (brand) brandDataMap[brandId] = brand
      } catch (error) {
        console.error(`Failed to load brand ${brandId}:`, error)
      }
    }
    
    setBrandData(brandDataMap)
  }

  const calculateBrandCarts = (): BrandCart[] => {
    const brandGroups = cart.items.reduce((groups, item) => {
      const brandId = item.product.brandId
      if (!groups[brandId]) {
        groups[brandId] = []
      }
      groups[brandId].push(item)
      return groups
    }, {} as Record<string, typeof cart.items>)

    return Object.entries(brandGroups).map(([brandId, items]) => {
      const brand = brandData[brandId]
      const brandName = brand?.name || brandId
      
      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => {
        const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                            item.product.price?.wholesale || 
                            item.product.price?.retail ||
                            item.product.retailPrice?.item || 0
        const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                              item.product.itemsPerCarton || 1
        const pricePerCarton = pricePerItem * unitsPerCarton
        return sum + (pricePerCarton * item.quantity)
      }, 0)

      // Check MOQ status
      const moqStatus = moqStatuses.find(status => status.brandId === brandId)
      const moqMet = moqStatus?.met || false
      
      // Check MOA (Minimum Order Amount) - if exceeded, MOQ is waived
      const moa = brand?.MOA || 3000
      const moaExceeded = subtotal >= moa

      // Calculate automatic volume discount
      let volumeDiscount: BrandCart['volumeDiscount'] = undefined
      if (brand?.volumeDiscounts) {
        // Find the highest applicable discount
        const applicableDiscounts = brand.volumeDiscounts
          .filter(discount => subtotal >= discount.threshold)
          .sort((a, b) => b.discountPercentage - a.discountPercentage)
        
        if (applicableDiscounts.length > 0) {
          const bestDiscount = applicableDiscounts[0]
          volumeDiscount = {
            percentage: bestDiscount.discountPercentage,
            amount: subtotal * (bestDiscount.discountPercentage / 100),
            threshold: bestDiscount.threshold
          }
        }
      }

      // Get applied discount codes for this brand
      const brandDiscountCodes = appliedDiscounts
        .filter(discount => discount.brandId === brandId && discount.type === 'code')

      // Calculate total after discounts
      let total = subtotal
      if (volumeDiscount) {
        total -= volumeDiscount.amount
      }
      // Apply discount codes (this would need more complex logic for multiple codes)
      const codeDiscountAmount = brandDiscountCodes.reduce((sum, discount) => sum + discount.amount, 0)
      total -= codeDiscountAmount

      // Determine if can checkout (MOQ met OR MOA exceeded OR has no-MOQ discount)
      const hasNoMOQDiscount = brandDiscountCodes.some(discount => 
        // This would need to check if the discount code has removesMOQ: true
        discount.name.toLowerCase().includes('no-moq')
      )
      const canCheckout = moqMet || moaExceeded || hasNoMOQDiscount

      return {
        brandId,
        brandName,
        items,
        subtotal,
        moqMet,
        moaExceeded,
        volumeDiscount,
        discountCodes: [], // Would be populated with actual discount codes
        total,
        canCheckout
      }
    })
  }

  const getNextVolumeDiscountMessage = (brandCart: BrandCart): string | null => {
    const brand = brandData[brandCart.brandId]
    if (!brand?.volumeDiscounts) return null

    // Find the next discount tier
    const nextTier = brand.volumeDiscounts
      .filter(discount => brandCart.subtotal < discount.threshold)
      .sort((a, b) => a.threshold - b.threshold)[0]

    if (nextTier) {
      const amountNeeded = nextTier.threshold - brandCart.subtotal
      return `Add ${formatConvertedPrice(amountNeeded, currentCurrency)} to get ${nextTier.discountPercentage}% off your ${brandCart.brandName} order!`
    }

    return null
  }

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return
    
    setIsApplyingDiscount(true)
    try {
      const validation = await discountService.validateDiscountCode(discountCode.trim())
      
      if (validation.valid && validation.discountCode) {
        const discount = validation.discountCode
        
        // For simplicity, apply to first brand cart that can accept it
        // In real implementation, this would be more sophisticated
        const brandCarts = calculateBrandCarts()
        const applicableBrandCart = brandCarts[0] // Simplified logic
        
        if (applicableBrandCart) {
          const discountAmount = discount.discountType === 'percentage' 
            ? applicableBrandCart.subtotal * (discount.discountValue / 100)
            : discount.discountValue

          const newDiscount: DiscountApplication = {
            type: 'code',
            brandId: applicableBrandCart.brandId,
            name: `${discount.name} ${discount.discountType === 'percentage' ? discount.discountValue + '%' : formatConvertedPrice(discount.discountValue, currentCurrency)}`,
            amount: discountAmount,
            percentage: discount.discountType === 'percentage' ? discount.discountValue : undefined
          }

          setAppliedDiscounts(prev => [...prev, newDiscount])
          setDiscountCode('')
          toast.success(`Discount code "${discount.code}" applied!`)
        }
      } else {
        toast.error(validation.error || 'Invalid discount code')
      }
    } catch (error) {
      toast.error('Failed to apply discount code')
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId)
    } else {
      await updateQuantity(productId, newQuantity)
    }
  }

  const proceedToCheckout = (brandId?: string) => {
    // Navigate to checkout with optional brand filter
    if (brandId) {
      navigate(`/checkout?brand=${brandId}`)
    } else {
      // Check which brands can checkout
      const brandCarts = calculateBrandCarts()
      const eligibleBrands = brandCarts.filter(cart => cart.canCheckout)
      
      if (eligibleBrands.length === 0) {
        toast.error('No orders meet minimum requirements for checkout')
        return
      }
      
      if (eligibleBrands.length < brandCarts.length) {
        // Partial checkout - only eligible brands
        const brandIds = eligibleBrands.map(cart => cart.brandId).join(',')
        navigate(`/checkout?brands=${brandIds}`)
      } else {
        // All brands eligible
        navigate('/checkout')
      }
    }
  }

  if (cart.items.length === 0) {
    return (
      <Layout>
        <Section className="text-center py-20">
          <Container size="sm">
            <h2 className="text-3xl font-light mb-4">Your cart is empty</h2>
            <p className="text-text-secondary mb-8">Discover amazing brands for your business</p>
            <Button onClick={() => navigate('/brands')}>Browse Brands</Button>
          </Container>
        </Section>
      </Layout>
    )
  }

  const brandCarts = calculateBrandCarts()
  const totalAllBrands = brandCarts.reduce((sum, cart) => sum + cart.total, 0)
  const taxRate = 0.2 // 20% VAT
  const totalTax = totalAllBrands * taxRate
  const grandTotal = totalAllBrands + totalTax
  const anyEligibleForCheckout = brandCarts.some(cart => cart.canCheckout)

  return (
    <Layout>
      <Section>
        <Container>
          <h1 className="text-3xl font-light mb-8">Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items by Brand */}
            <div className="lg:col-span-2 space-y-6">
              {/* Discount Code Entry */}
              <Card>
                <CardContent>
                  <h3 className="font-medium mb-4">Discount Code</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && applyDiscountCode()}
                    />
                    <Button 
                      variant="secondary" 
                      onClick={applyDiscountCode}
                      disabled={!discountCode.trim() || isApplyingDiscount}
                    >
                      {isApplyingDiscount ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Carts */}
              {brandCarts.map(brandCart => {
                const upsellMessage = getNextVolumeDiscountMessage(brandCart)
                
                return (
                  <Card key={brandCart.brandId} className={brandCart.canCheckout ? '' : 'border-warning-orange'}>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">{brandCart.brandName}</h3>
                        <div className="flex items-center gap-2">
                          {brandCart.moaExceeded && (
                            <Badge variant="success">MOA Exceeded - MOQ Waived</Badge>
                          )}
                          {!brandCart.moaExceeded && (
                            <Badge variant={brandCart.moqMet ? 'success' : 'warning'}>
                              {brandCart.moqMet ? 'All MOQs Met' : `MOQ Required (${brandCart.canCheckout ? 'Some' : 'All'} products)`}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* MOQ Status Details */}
                      {!brandCart.moaExceeded && !brandCart.moqMet && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-orange-800 text-sm font-medium mb-2">
                            ⚠️ Minimum Order Quantity Requirements
                          </p>
                          <div className="text-orange-700 text-sm space-y-1">
                            {brandCart.items
                              .filter(item => {
                                // Get MOQ from multiple possible locations in order of preference
                                const productMOQ = item.product.variants?.[0]?.pricing?.b2b?.minOrderQuantity || 
                                                  item.product.MOQ || 
                                                  item.product.moq || 
                                                  0
                                if (productMOQ <= 0) return false
                                const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                                       item.product.itemsPerCarton || 1
                                const totalUnits = item.quantity * unitsPerCarton
                                return totalUnits < productMOQ
                              })
                              .map(item => {
                                // Get MOQ from multiple possible locations in order of preference
                                const productMOQ = item.product.variants?.[0]?.pricing?.b2b?.minOrderQuantity || 
                                                  item.product.MOQ || 
                                                  item.product.moq || 
                                                  0
                                const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                                       item.product.itemsPerCarton || 1
                                const totalUnits = item.quantity * unitsPerCarton
                                const needed = productMOQ - totalUnits
                                const cartonsNeeded = Math.ceil(needed / unitsPerCarton)
                                
                                return (
                                  <div key={item.id} className="flex justify-between">
                                    <span>{getProductName(item.product)}</span>
                                    <span className="font-medium">
                                      Add {cartonsNeeded} more carton{cartonsNeeded !== 1 ? 's' : ''} ({needed} units)
                                    </span>
                                  </div>
                                )
                              })
                            }
                            <div className="mt-2 pt-2 border-t border-orange-300">
                              <p className="text-xs">
                                💡 Tip: Orders over {formatConvertedPrice(brandData[brandCart.brandId]?.MOA || 3000, currentCurrency)} automatically waive all MOQ requirements
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upsell Message */}
                      {upsellMessage && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-blue-800 text-sm font-medium">{upsellMessage}</p>
                        </div>
                      )}

                      {/* Volume Discount Applied */}
                      {brandCart.volumeDiscount && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 text-sm font-medium">
                            🎉 {brandCart.volumeDiscount.percentage}% Volume Discount Applied! 
                            Save {formatConvertedPrice(brandCart.volumeDiscount.amount, currentCurrency)}
                          </p>
                        </div>
                      )}
                      
                      {/* Brand items */}
                      <div className="space-y-4">
                        {brandCart.items.map((item, index) => {
                          const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                                       item.product.price?.wholesale || 
                                       item.product.price?.retail ||
                                       item.product.retailPrice?.item || 0
                          
                          const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                                item.product.itemsPerCarton || 1
                          
                          const pricePerCarton = pricePerItem * unitsPerCarton
                          
                          return (
                            <div 
                              key={item.id} 
                              className={`flex gap-4 py-4 ${index > 0 ? 'border-t border-border-gray' : ''}`}
                            >
                              <img 
                                src={getProductPrimaryImage(item.product) || '/placeholder.png'}
                                alt={getProductName(item.product)}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              
                              <div className="flex-1">
                                <h4 className="font-medium">
                                  {getProductName(item.product)}
                                </h4>
                                <p className="text-sm text-text-secondary">
                                  {item.product.volume} • {unitsPerCarton} items per carton
                                </p>
                                <p className="text-sm text-text-secondary">
                                  {formatConvertedPrice(pricePerItem, currentCurrency)} per item • {formatConvertedPrice(pricePerCarton, currentCurrency)} per carton
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full border border-border-gray hover:bg-soft-pink-hover transition-colors"
                                >
                                  -
                                </button>
                                <span className="w-12 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full border border-border-gray hover:bg-soft-pink-hover transition-colors"
                                >
                                  +
                                </button>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-rose-gold font-medium">
                                  {formatConvertedPrice(pricePerCarton * item.quantity, currentCurrency)}
                                </p>
                                <p className="text-xs text-text-secondary">
                                  {item.quantity} {item.quantity === 1 ? 'carton' : 'cartons'}
                                </p>
                                <button
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="text-xs text-error-red hover:underline mt-1"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Brand Subtotal and Actions */}
                      <div className="mt-6 pt-4 border-t border-border-gray">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-sm text-text-secondary">Brand Subtotal:</p>
                            <p className="font-medium">{formatConvertedPrice(brandCart.total, currentCurrency)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => clearBrandItems(brandCart.brandId)}
                            >
                              Remove All
                            </Button>
                            <Button
                              size="small"
                              onClick={() => proceedToCheckout(brandCart.brandId)}
                              disabled={!brandCart.canCheckout}
                            >
                              Checkout This Order
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent>
                  <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                  
                  <div className="space-y-2 mb-4">
                    {brandCarts.map(brandCart => (
                      <div key={brandCart.brandId} className="text-sm">
                        <div className="flex justify-between">
                          <span>{brandCart.brandName} Subtotal</span>
                          <span>{formatConvertedPrice(brandCart.subtotal, currentCurrency)}</span>
                        </div>
                        {brandCart.volumeDiscount && (
                          <div className="flex justify-between text-green-600">
                            <span>{brandCart.brandName} Volume Discount ({brandCart.volumeDiscount.percentage}%)</span>
                            <span>-{formatConvertedPrice(brandCart.volumeDiscount.amount, currentCurrency)}</span>
                          </div>
                        )}
                        {/* Applied discount codes for this brand would go here */}
                      </div>
                    ))}
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span>Total Subtotal</span>
                        <span>{formatConvertedPrice(totalAllBrands, currentCurrency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (VAT 20%)</span>
                        <span>{formatConvertedPrice(totalTax, currentCurrency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-xl font-medium text-rose-gold">
                        {formatConvertedPrice(grandTotal, currentCurrency)}
                      </span>
                    </div>
                  </div>

                  {/* Applied Discounts Summary */}
                  {appliedDiscounts.length > 0 && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Applied Discounts:</h4>
                      {appliedDiscounts.map((discount, index) => (
                        <div key={index} className="text-sm text-green-700">
                          • {discount.name}: -{formatConvertedPrice(discount.amount, currentCurrency)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!anyEligibleForCheckout && (
                    <div className="mb-4 p-4 bg-warning-light rounded-lg text-sm">
                      <p className="font-medium mb-1">Minimum order requirements not met</p>
                      <p className="text-text-secondary mb-2">
                        Some products don't meet their minimum order quantities (MOQ).
                      </p>
                      <div className="text-text-secondary text-xs space-y-1">
                        <p>Ways to proceed:</p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>Increase quantities for products showing MOQ warnings</li>
                          <li>Reach the Minimum Order Amount (MOA) to waive all MOQ requirements</li>
                          <li>Use a No-MOQ discount code</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    fullWidth 
                    onClick={() => proceedToCheckout()}
                    disabled={!anyEligibleForCheckout}
                  >
                    Proceed to Checkout
                    {brandCarts.filter(cart => cart.canCheckout).length < brandCarts.length && 
                      ` (${brandCarts.filter(cart => cart.canCheckout).length} of ${brandCarts.length} orders)`
                    }
                  </Button>
                  
                  <p className="text-xs text-text-secondary text-center mt-4">
                    Prices shown in {currentCurrency}. Payment will be processed in USD.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}