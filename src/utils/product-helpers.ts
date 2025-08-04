import { Product } from '../types'

// Helper to get product name as string
export const getProductName = (product: Product, lang: 'en' | 'ko' | 'zh' = 'en'): string => {
  if (typeof product.name === 'string') {
    return product.name
  }
  return product.name[lang] || product.name.en
}

// Helper to get product description as string
export const getProductDescription = (product: Product, lang: 'en' | 'ko' | 'zh' = 'en'): string => {
  if (typeof product.description === 'string') {
    return product.description
  }
  return product.description[lang] || product.description.en
}

// Helper to get primary image
export const getProductPrimaryImage = (product: Product): string => {
  if (Array.isArray(product.images)) {
    return product.images[0] || ''
  }
  return product.images.primary || product.images.gallery?.[0] || ''
}

// Helper to get image gallery
export const getProductImageGallery = (product: Product): string[] => {
  if (Array.isArray(product.images)) {
    return product.images
  }
  return product.images.gallery || []
}

// Helper to check if product has variants
export const hasVariants = (product: Product): boolean => {
  return Boolean(product.variants && product.variants.length > 0)
}

// Helper to get B2C enabled variant
export const getB2CVariant = (product: Product) => {
  if (!product.variants) return null
  return product.variants.find(v => v.pricing?.b2c?.enabled) || product.variants[0]
}

// Helper to get product price
export const getProductPrice = (product: Product): number => {
  // First check for variants with B2C pricing
  const b2cVariant = getB2CVariant(product)
  if (b2cVariant?.pricing?.b2c?.retailPrice) {
    return b2cVariant.pricing.b2c.retailPrice
  }
  
  // Then check legacy retailPrice
  if (product.retailPrice?.item) {
    return product.retailPrice.item
  }
  
  // Then check unified price structure
  if (product.price?.retail) {
    return product.price.retail
  }
  
  if (product.price?.item) {
    return product.price.item
  }
  
  return 0
}

// Helper to check if product is in stock
export const isProductInStock = (product: Product): boolean => {
  const b2cVariant = getB2CVariant(product)
  if (b2cVariant?.inventory?.b2c?.available) {
    return b2cVariant.inventory.b2c.available > 0
  }
  
  // Fallback to product-level stock
  return product.inStock || (product.stock !== undefined && product.stock > 0)
}