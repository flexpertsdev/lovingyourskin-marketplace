// Mock product service with multi-language support and certifications
import { Product, Brand } from '../../types'
import { transformBrandData, transformProductData } from '../../utils/transformMockData'
import brandsData from '../../../mock-data/brands.json'
import productsData from '../../../mock-data/products.json'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Transform the imported data
const brands = brandsData.brands.map(transformBrandData)
const products = (productsData as any[]).map(transformProductData)

export const productService = {
  // Get all brands
  getBrands: async (): Promise<Brand[]> => {
    await delay(300)
    return brands.filter(b => b.active)
  },
  
  // Get brand by ID or slug
  getBrand: async (idOrSlug: string): Promise<Brand | null> => {
    await delay(200)
    return brands.find(b => b.id === idOrSlug || b.slug === idOrSlug) || null
  },
  
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    await delay(400)
    return products.filter((p: Product) => p.active)
  },
  
  // Get products by brand
  getProductsByBrand: async (brandId: string): Promise<Product[]> => {
    await delay(400)
    return products.filter((p: Product) => p.brandId === brandId && p.active)
  },
  
  // Get products by category
  getProductsByCategory: async (brandId: string, categoryId: string): Promise<Product[]> => {
    await delay(400)
    return products.filter((p: Product) => 
      p.brandId === brandId && 
      p.categoryId === categoryId && 
      p.inStock
    )
  },
  
  // Get single product
  getProduct: async (productId: string): Promise<Product | null> => {
    await delay(200)
    return products.find((p: Product) => p.id === productId) || null
  },
  
  // Search products with filters
  searchProducts: async (params: {
    query?: string
    brandId?: string
    certifications?: string[]
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    language?: 'en' | 'ko' | 'zh'
  }): Promise<Product[]> => {
    await delay(500)
    
    let filtered = [...products]
    
    // Filter by query (search in product names)
    if (params.query) {
      const query = params.query.toLowerCase()
      const lang = params.language || 'en'
      filtered = filtered.filter((p: Product) => 
        p.name[lang].toLowerCase().includes(query) ||
        p.description[lang].toLowerCase().includes(query)
      )
    }
    
    // Filter by brand
    if (params.brandId) {
      filtered = filtered.filter((p: Product) => p.brandId === params.brandId)
    }
    
    // Filter by certifications
    if (params.certifications && params.certifications.length > 0) {
      filtered = filtered.filter((p: Product) => 
        params.certifications!.every(cert => 
          p.certifications.includes(cert as any)
        )
      )
    }
    
    // Filter by price range
    if (params.minPrice !== undefined) {
      filtered = filtered.filter((p: Product) => p.price.item >= params.minPrice!)
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((p: Product) => p.price.item <= params.maxPrice!)
    }
    
    // Filter by stock
    if (params.inStock !== undefined) {
      filtered = filtered.filter((p: Product) => p.inStock === params.inStock)
    }
    
    return filtered
  },
  
  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    await delay(300)
    return products.filter((p: Product) => p.featured && p.inStock).slice(0, 8)
  },
  
  // Get new arrivals
  getNewArrivals: async (): Promise<Product[]> => {
    await delay(300)
    // In real app, sort by creation date
    return products.filter((p: Product) => p.inStock).slice(0, 6)
  },
  
  // Get products by multiple IDs (for cart)
  getProductsByIds: async (ids: string[]): Promise<Product[]> => {
    await delay(200)
    return products.filter((p: Product) => ids.includes(p.id))
  },
  
  // Check product availability
  checkAvailability: async (productId: string, quantity: number): Promise<boolean> => {
    await delay(100)
    const product = products.find((p: Product) => p.id === productId)
    if (!product) return false
    
    // In real app, check actual inventory
    return product.inStock && quantity >= product.moq
  },
  
  // Get certification types
  getCertificationTypes: async (): Promise<string[]> => {
    await delay(100)
    return ['CPNP_UK', 'CPNP_EU', 'CPNP_CH', 'VEGAN', 'CRUELTY_FREE', 'EWG', 'DERMATOLOGIST_TESTED']
  },
}