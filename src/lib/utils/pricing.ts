import { Product } from '../../types'

/**
 * Get the appropriate price for a product, checking multiple possible price fields
 * Priority: B2C variant pricing > legacy retailPrice > legacy price > B2B pricing
 */
export const getProductPrice = (product: Product): number => {
  // Check B2C pricing in variants first (newest structure)
  if (product.variants?.[0]?.pricing?.b2c?.retailPrice) {
    return product.variants[0].pricing.b2c.retailPrice
  }
  
  // Check legacy retailPrice
  if (product.retailPrice?.item) {
    return product.retailPrice.item
  }
  
  // Check other legacy price field
  if (product.price?.item) {
    return product.price.item
  }
  
  // For B2B products, use B2B wholesale price as fallback
  if (product.variants?.[0]?.pricing?.b2b?.wholesalePrice) {
    return product.variants[0].pricing.b2b.wholesalePrice
  }
  
  return 0
}

/**
 * Calculate discounted price based on percentage
 */
export const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number): number => {
  return originalPrice * (1 - discountPercentage / 100)
}

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`
}

/**
 * Calculate savings amount
 */
export const calculateSavings = (originalPrice: number, discountedPrice: number): number => {
  return originalPrice - discountedPrice
}