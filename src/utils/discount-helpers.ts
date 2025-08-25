// Helper functions for discount calculations and MOQ validation

import { Brand, DiscountCode, CartItem } from '../types'
import { DiscountValidationResult } from '../types/discount'

/**
 * Calculate the best volume discount for a given brand and order total
 */
export const calculateVolumeDiscount = (
  brand: Brand, 
  orderTotal: number
): {
  discount: { threshold: number; discountPercentage: number } | null
  discountAmount: number
  savings: number
  nextTier?: { threshold: number; discountPercentage: number; amountNeeded: number }
} => {
  if (!brand.volumeDiscounts || brand.volumeDiscounts.length === 0) {
    return { discount: null, discountAmount: orderTotal, savings: 0 }
  }

  // Find the highest applicable discount
  const applicableDiscounts = brand.volumeDiscounts
    .filter(discount => orderTotal >= discount.threshold)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)

  let discount = null
  let savings = 0
  let discountAmount = orderTotal

  if (applicableDiscounts.length > 0) {
    discount = applicableDiscounts[0]
    savings = orderTotal * (discount.discountPercentage / 100)
    discountAmount = orderTotal - savings
  }

  // Find the next tier
  const nextTier = brand.volumeDiscounts
    .filter(d => orderTotal < d.threshold)
    .sort((a, b) => a.threshold - b.threshold)[0]

  return {
    discount,
    discountAmount,
    savings,
    nextTier: nextTier ? {
      ...nextTier,
      amountNeeded: nextTier.threshold - orderTotal
    } : undefined
  }
}

/**
 * Calculate MOQ status for a brand considering per-product MOQ, MOA and applied discounts
 */
export const calculateMOQStatus = (
  brand: Brand,
  cartItems: CartItem[],
  appliedDiscounts: DiscountValidationResult[]
): {
  brandId: string
  brandName: string
  status: 'met' | 'warning' | 'error'
  met: boolean
  current: number
  required: number
  percentage: number
  remainingItems: number
  moaExceeded: boolean
  hasNoMOQDiscount: boolean
  canCheckout: boolean
  orderTotal: number
} => {
  // Filter items for this brand
  const brandItems = cartItems.filter(item => item.product.brandId === brand.id)
  
  // Calculate order total
  const orderTotal = brandItems.reduce((sum, item) => {
    const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                        item.product.price?.wholesale || 
                        item.product.price?.retail ||
                        item.product.retailPrice?.item || 0
    const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                          item.product.itemsPerCarton || 1
    const pricePerCarton = pricePerItem * unitsPerCarton
    return sum + (pricePerCarton * item.quantity)
  }, 0)

  // Check for No-MOQ discount
  const hasNoMOQDiscount = appliedDiscounts.some(discount => 
    discount.valid && discount.removesMOQ === true
  )

  // Check MOA (Minimum Order Amount) - if exceeded, MOQ is waived
  const moa = brand.MOA || 3000
  const moaExceeded = orderTotal >= moa

  // If MOA exceeded or No-MOQ discount, skip per-product MOQ checks
  if (moaExceeded || hasNoMOQDiscount) {
    return {
      brandId: brand.id,
      brandName: brand.name,
      status: 'met',
      met: true,
      current: orderTotal,
      required: moaExceeded ? moa : 0,
      percentage: 100,
      remainingItems: 0,
      moaExceeded,
      hasNoMOQDiscount,
      canCheckout: true,
      orderTotal
    }
  }

  // Check per-product MOQ requirements
  let totalMOQViolations = 0
  let totalMOQRequirements = 0
  const violatingProducts: string[] = []

  for (const item of brandItems) {
    // Get MOQ from multiple possible locations in order of preference
    const productMOQ = item.product.variants?.[0]?.pricing?.b2b?.minOrderQuantity || 
                      item.product.MOQ || 
                      item.product.moq || 
                      0
    
    if (productMOQ > 0) {
      // Calculate total units ordered (cartons * units per carton)
      const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                             item.product.itemsPerCarton || 1
      const totalUnits = item.quantity * unitsPerCarton
      
      totalMOQRequirements += productMOQ
      if (totalUnits < productMOQ) {
        totalMOQViolations += (productMOQ - totalUnits)
        violatingProducts.push(item.product.name || item.product.id)
      }
    }
  }

  // If no MOQ requirements are set on any products, consider it met
  if (totalMOQRequirements === 0) {
    return {
      brandId: brand.id,
      brandName: brand.name,
      status: 'met',
      met: true,
      current: orderTotal,
      required: 0,
      percentage: 100,
      remainingItems: 0,
      moaExceeded,
      hasNoMOQDiscount,
      canCheckout: true,
      orderTotal
    }
  }

  const met = totalMOQViolations === 0
  const percentage = totalMOQRequirements > 0 
    ? Math.min(100, ((totalMOQRequirements - totalMOQViolations) / totalMOQRequirements) * 100)
    : 100

  // Calculate status based on MOQ compliance
  let status: 'met' | 'warning' | 'error' = 'error'
  if (met) {
    status = 'met'
  } else if (totalMOQViolations <= totalMOQRequirements * 0.3) {
    status = 'warning' // Close to meeting MOQ
  }

  return {
    brandId: brand.id,
    brandName: brand.name,
    status,
    met,
    current: totalMOQRequirements - totalMOQViolations, // Units that meet MOQ
    required: totalMOQRequirements, // Total units required
    percentage,
    remainingItems: totalMOQViolations, // Units still needed
    moaExceeded,
    hasNoMOQDiscount,
    canCheckout: met,
    orderTotal
  }
}

/**
 * Generate upsell message for volume discounts
 */
export const generateUpsellMessage = (
  brand: Brand,
  currentTotal: number,
  currency = 'USD'
): string | null => {
  if (!brand.volumeDiscounts || brand.volumeDiscounts.length === 0) {
    return null
  }

  // Find the next discount tier
  const nextTier = brand.volumeDiscounts
    .filter(discount => currentTotal < discount.threshold)
    .sort((a, b) => a.threshold - b.threshold)[0]

  if (!nextTier) {
    return null
  }

  const amountNeeded = nextTier.threshold - currentTotal
  const currencySymbol = currency === 'USD' ? '$' : 
                        currency === 'GBP' ? '£' : 
                        currency === 'EUR' ? '€' : 
                        currency

  return `Add ${currencySymbol}${amountNeeded.toFixed(2)} to get ${nextTier.discountPercentage}% off your ${brand.name} order!`
}

/**
 * Apply discount codes to cart items
 */
export const applyDiscountCodes = (
  cartItems: CartItem[],
  discountCodes: DiscountValidationResult[]
): {
  itemDiscounts: Record<string, number> // productId -> discount amount
  totalDiscount: number
  applicableTotal: number
} => {
  const itemDiscounts: Record<string, number> = {}
  let totalDiscount = 0

  // Calculate total before discounts
  const applicableTotal = cartItems.reduce((sum, item) => {
    const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                        item.product.price?.wholesale || 
                        item.product.price?.retail ||
                        item.product.retailPrice?.item || 0
    const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                          item.product.itemsPerCarton || 1
    const pricePerCarton = pricePerItem * unitsPerCarton
    return sum + (pricePerCarton * item.quantity)
  }, 0)

  // Apply each valid discount code
  for (const discountValidation of discountCodes) {
    if (!discountValidation.valid || !discountValidation.discountCode) continue

    const discount = discountValidation.discountCode

    // Filter applicable items based on discount conditions
    const applicableItems = cartItems.filter(item => {
      if (discount.conditions?.specificProducts?.length) {
        return discount.conditions.specificProducts.includes(item.product.id)
      }
      if (discount.conditions?.specificBrands?.length) {
        return discount.conditions.specificBrands.includes(item.product.brandId)
      }
      return true
    })

    // Calculate discount for applicable items
    const applicableItemsTotal = applicableItems.reduce((sum, item) => {
      const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                          item.product.price?.wholesale || 
                          item.product.price?.retail ||
                          item.product.retailPrice?.item || 0
      const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                            item.product.itemsPerCarton || 1
      const pricePerCarton = pricePerItem * unitsPerCarton
      return sum + (pricePerCarton * item.quantity)
    }, 0)

    let discountAmount = 0
    if (discount.discountType === 'percentage') {
      discountAmount = (applicableItemsTotal * discount.discountValue) / 100
    } else {
      discountAmount = Math.min(discount.discountValue, applicableItemsTotal)
    }

    // Distribute discount proportionally among applicable items
    for (const item of applicableItems) {
      const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                          item.product.price?.wholesale || 
                          item.product.price?.retail ||
                          item.product.retailPrice?.item || 0
      const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                            item.product.itemsPerCarton || 1
      const pricePerCarton = pricePerItem * unitsPerCarton
      const itemTotal = pricePerCarton * item.quantity
      const itemDiscountAmount = (itemTotal / applicableItemsTotal) * discountAmount

      itemDiscounts[item.product.id] = (itemDiscounts[item.product.id] || 0) + itemDiscountAmount
    }

    totalDiscount += discountAmount
  }

  return {
    itemDiscounts,
    totalDiscount,
    applicableTotal
  }
}

/**
 * Format currency amount with proper symbol and decimals
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  const currencySymbol = currency === 'USD' ? '$' : 
                        currency === 'GBP' ? '£' : 
                        currency === 'EUR' ? '€' : 
                        currency === 'CHF' ? 'CHF ' : 
                        currency

  if (currency === 'CHF') {
    return `${currencySymbol}${amount.toFixed(2)}`
  }

  return `${currencySymbol}${amount.toFixed(2)}`
}

/**
 * Check if all brands in cart can proceed to checkout
 */
export const canProceedToCheckout = (
  cartItems: CartItem[],
  brands: Brand[],
  appliedDiscounts: DiscountValidationResult[]
): {
  canCheckout: boolean
  eligibleBrands: string[]
  ineligibleBrands: string[]
  summary: Record<string, ReturnType<typeof calculateMOQStatus>>
} => {
  const eligibleBrands: string[] = []
  const ineligibleBrands: string[] = []
  const summary: Record<string, ReturnType<typeof calculateMOQStatus>> = {}

  // Group cart items by brand
  const brandGroups = cartItems.reduce((groups, item) => {
    const brandId = item.product.brandId
    if (!groups[brandId]) {
      groups[brandId] = []
    }
    groups[brandId].push(item)
    return groups
  }, {} as Record<string, CartItem[]>)

  // Check each brand
  for (const [brandId, items] of Object.entries(brandGroups)) {
    const brand = brands.find(b => b.id === brandId)
    if (!brand) continue

    const moqStatus = calculateMOQStatus(brand, items, appliedDiscounts)
    summary[brandId] = moqStatus

    if (moqStatus.canCheckout) {
      eligibleBrands.push(brandId)
    } else {
      ineligibleBrands.push(brandId)
    }
  }

  return {
    canCheckout: eligibleBrands.length > 0,
    eligibleBrands,
    ineligibleBrands,
    summary
  }
}
