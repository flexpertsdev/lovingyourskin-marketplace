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
  // Since we've updated products.json with all B2C fields, just return as-is
  return rawProduct as Product
}