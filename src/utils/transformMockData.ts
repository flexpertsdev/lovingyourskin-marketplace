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
  const name = typeof rawProduct.name === 'string' ? rawProduct.name : rawProduct.name.en
  
  // Handle missing description field
  let description = 'No description available'
  if (rawProduct.description) {
    description = typeof rawProduct.description === 'string' 
      ? rawProduct.description 
      : rawProduct.description.en
  }
  
  return {
    ...rawProduct,
    name: {
      en: name,
      ko: name,
      zh: name
    },
    description: {
      en: description,
      ko: description,
      zh: description
    },
    category: rawProduct.category || 'Skincare',
    packSize: rawProduct.packSize || String(rawProduct.itemsPerCarton || 12),
    volume: rawProduct.volume || '50ml',
    stockLevel: rawProduct.stockLevel || (rawProduct.inStock ? 'in' : 'out'),
    leadTime: rawProduct.leadTime || '3-5 days',
    active: rawProduct.active !== false
  }
}