import { Brand, Product } from '../types'

export const transformBrandData = (rawBrand: any): Brand => {
  const name = typeof rawBrand.name === 'string' ? rawBrand.name : rawBrand.name.en
  const description = typeof rawBrand.description === 'string' ? rawBrand.description : rawBrand.description.en
  
  return {
    ...rawBrand,
    name: {
      en: name,
      ko: name, // In real app, would have Korean translation
      zh: name  // In real app, would have Chinese translation
    },
    description: {
      en: description,
      ko: description,
      zh: description
    },
    story: rawBrand.story ? {
      en: rawBrand.story,
      ko: rawBrand.story,
      zh: rawBrand.story
    } : undefined,
    minimumOrder: rawBrand.minimumOrder || 100,
    country: rawBrand.country || 'South Korea',
    categories: rawBrand.categories?.map((cat: any) => 
      typeof cat === 'string' ? cat : cat.name
    ) || [],
    certifications: rawBrand.certifications?.map((cert: string) => 
      cert === 'CPNP' ? 'CPNP' : cert
    ) || []
  }
}

export const transformProductData = (rawProduct: any): Product => {
  // Handle both string and object formats for name and description
  const name = typeof rawProduct.name === 'string' 
    ? {
        en: rawProduct.name,
        ko: rawProduct.name, // In real app, would have Korean translation
        zh: rawProduct.name  // In real app, would have Chinese translation
      }
    : rawProduct.name

  const description = typeof rawProduct.description === 'string'
    ? {
        en: rawProduct.description,
        ko: rawProduct.description,
        zh: rawProduct.description
      }
    : rawProduct.description

  // Transform pricing structure if needed
  let price = rawProduct.price
  if (!price && rawProduct.variants && rawProduct.variants.length > 0) {
    // Extract price from first variant if no top-level price
    const defaultVariant = rawProduct.variants.find((v: any) => v.isDefault) || rawProduct.variants[0]
    price = {
      wholesale: defaultVariant.pricing?.b2b?.wholesalePrice,
      retail: defaultVariant.pricing?.b2c?.retailPrice,
      currency: defaultVariant.pricing?.b2c?.currency || 'USD'
    }
  }

  return {
    ...rawProduct,
    name,
    description,
    price: price || { currency: 'USD' },
    // Ensure images is in the correct format
    images: Array.isArray(rawProduct.images) 
      ? rawProduct.images 
      : rawProduct.images?.gallery || [rawProduct.images?.primary].filter(Boolean) || [],
    // Set default values for required fields
    categoryId: rawProduct.categoryId || rawProduct.category || 'uncategorized',
    minOrderQuantity: rawProduct.minOrderQuantity || 1,
    stockLevel: rawProduct.stockLevel || 'in',
    featured: rawProduct.featured || false,
    active: rawProduct.status === 'active',
    inStock: true, // Default to true, can be calculated from variants
    brand: rawProduct.brand || { id: rawProduct.brandId, name: rawProduct.brandId }
  } as Product
}