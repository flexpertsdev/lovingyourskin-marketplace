import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '../../lib/firebase/config'
import { Product, Brand } from '../../types'
import { transformBrandData, transformProductData } from '../../utils/transformMockData'

class FirebaseProductService {
  // ============================================
  // BRAND OPERATIONS
  // ============================================
  
  // Get all brands
  async getBrands(): Promise<Brand[]> {
    try {
      const brandsSnapshot = await getDocs(collection(db, 'brands'))
      return brandsSnapshot.docs.map(doc => {
        const data = doc.data()
        // Transform the data to ensure it matches the Brand interface
        return transformBrandData({
          ...data,
          id: doc.id
        })
      })
    } catch (error) {
      console.error('Error fetching brands:', error)
      throw new Error('Failed to fetch brands')
    }
  }
  
  // Get brand by ID or slug
  async getBrand(idOrSlug: string): Promise<Brand | null> {
    try {
      // First try to get by ID
      const brandDoc = await getDoc(doc(db, 'brands', idOrSlug))
      if (brandDoc.exists()) {
        const data = brandDoc.data()
        return transformBrandData({ ...data, id: brandDoc.id })
      }
      
      // If not found by ID, try by slug
      const slugQuery = query(collection(db, 'brands'), where('slug', '==', idOrSlug))
      const slugSnapshot = await getDocs(slugQuery)
      
      if (!slugSnapshot.empty) {
        const doc = slugSnapshot.docs[0]
        const data = doc.data()
        return transformBrandData({ ...data, id: doc.id })
      }
      
      return null
    } catch (error) {
      console.error('Error fetching brand:', error)
      throw new Error('Failed to fetch brand')
    }
  }
  
  // Create a new brand
  async createBrand(brandData: Omit<Brand, 'id'>): Promise<Brand> {
    try {
      const docRef = await addDoc(collection(db, 'brands'), {
        ...brandData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      const newBrand = await getDoc(docRef)
      const data = newBrand.data()
      return transformBrandData({ ...data, id: newBrand.id })
    } catch (error) {
      console.error('Error creating brand:', error)
      throw new Error('Failed to create brand')
    }
  }
  
  // Update a brand
  async updateBrand(brandId: string, updates: Partial<Brand>): Promise<void> {
    try {
      await updateDoc(doc(db, 'brands', brandId), {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating brand:', error)
      throw new Error('Failed to update brand')
    }
  }
  
  // Delete a brand
  async deleteBrand(brandId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'brands', brandId))
    } catch (error) {
      console.error('Error deleting brand:', error)
      throw new Error('Failed to delete brand')
    }
  }
  
  // ============================================
  // PRODUCT OPERATIONS
  // ============================================
  
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const productsSnapshot = await getDocs(
        query(collection(db, 'products'), where('status', '==', 'active'))
      )
      
      return productsSnapshot.docs.map(doc => {
        const data = doc.data()
        return transformProductData({
          ...data,
          id: doc.id
        })
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      throw new Error('Failed to fetch products')
    }
  }
  
  // Get products by brand
  async getProductsByBrand(brandId: string): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('brandId', '==', brandId),
        where('status', '==', 'active')
      )
      
      const productsSnapshot = await getDocs(productsQuery)
      return productsSnapshot.docs.map(doc => {
        const data = doc.data()
        return transformProductData({
          ...data,
          id: doc.id
        })
      })
    } catch (error) {
      console.error('Error fetching products by brand:', error)
      throw new Error('Failed to fetch products')
    }
  }
  
  // Get products by category
  async getProductsByCategory(brandId: string, categoryId: string): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('brandId', '==', brandId),
        where('category', '==', categoryId),
        where('status', '==', 'active'),
        orderBy('name')
      )
      
      const productsSnapshot = await getDocs(productsQuery)
      return productsSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id
        }
      }) as Product[]
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw new Error('Failed to fetch products')
    }
  }
  
  // Get single product
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId))
      
      if (!productDoc.exists()) {
        return null
      }
      
      const data = productDoc.data()
      return transformProductData({ ...data, id: productDoc.id })
    } catch (error) {
      console.error('Error fetching product:', error)
      throw new Error('Failed to fetch product')
    }
  }

  // Alias for getProduct to match mock service
  async getById(productId: string): Promise<Product | null> {
    return this.getProduct(productId)
  }

  // Alias for getProducts to match mock service
  async getAll(): Promise<Product[]> {
    return this.getProducts()
  }
  
  // Search products
  async searchProducts(searchTerm: string, language: 'en' | 'ko' | 'zh' = 'en'): Promise<Product[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // For production, consider using Algolia or Elasticsearch
      // This is a simple implementation that searches by exact match
      const allProducts = await this.getProducts()
      
      const searchLower = searchTerm.toLowerCase()
      return allProducts.filter(product => {
        const name = product.name[language].toLowerCase()
        const description = product.description[language].toLowerCase()
        const brand = product.brandId.toLowerCase()
        
        return name.includes(searchLower) || 
               description.includes(searchLower) ||
               brand.includes(searchLower)
      })
    } catch (error) {
      console.error('Error searching products:', error)
      throw new Error('Failed to search products')
    }
  }
  
  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const featuredQuery = query(
        collection(db, 'products'),
        where('featured', '==', true),
        where('status', '==', 'active'),
        orderBy('name')
      )
      
      const productsSnapshot = await getDocs(featuredQuery)
      return productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]
    } catch (error) {
      console.error('Error fetching featured products:', error)
      throw new Error('Failed to fetch featured products')
    }
  }
  
  // Create a new product
  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      const newProduct = await getDoc(docRef)
      const data = newProduct.data()
      return { ...data, id: newProduct.id } as Product
    } catch (error) {
      console.error('Error creating product:', error)
      throw new Error('Failed to create product')
    }
  }
  
  // Update a product
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating product:', error)
      throw new Error('Failed to update product')
    }
  }
  
  // Delete a product
  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', productId))
    } catch (error) {
      console.error('Error deleting product:', error)
      throw new Error('Failed to delete product')
    }
  }
  
  // Update product stock
  async updateProductStock(productId: string, variantId: string, stock: number): Promise<void> {
    try {
      // Get the product first
      const productDoc = await getDoc(doc(db, 'products', productId))
      if (!productDoc.exists()) {
        throw new Error('Product not found')
      }
      
      const product = productDoc.data()
      const variants = product.variants || []
      
      // Update the specific variant's stock
      const updatedVariants = variants.map((v: any) => {
        if (v.variantId === variantId) {
          return {
            ...v,
            inventory: {
              ...v.inventory,
              b2b: {
                ...v.inventory.b2b,
                stock,
                available: stock
              }
            }
          }
        }
        return v
      })
      
      await updateDoc(doc(db, 'products', productId), {
        variants: updatedVariants,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating product stock:', error)
      throw new Error('Failed to update product stock')
    }
  }
  
  // Get product categories
  async getCategories(brandId?: string): Promise<string[]> {
    try {
      let productsQuery
      if (brandId) {
        productsQuery = query(
          collection(db, 'products'),
          where('brandId', '==', brandId),
          where('status', '==', 'active')
        )
      } else {
        productsQuery = query(
          collection(db, 'products'),
          where('status', '==', 'active')
        )
      }
      
      const productsSnapshot = await getDocs(productsQuery)
      const categories = new Set<string>()
      
      productsSnapshot.docs.forEach(doc => {
        const product = doc.data() as Product
        categories.add(product.category)
      })
      
      return Array.from(categories).sort()
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw new Error('Failed to fetch categories')
    }
  }

  // Create a new product (simplified alias)
  async create(productData: Omit<Product, 'id'>): Promise<Product> {
    return this.createProduct(productData)
  }

  // Update a product (simplified alias)
  async update(productId: string, updates: Partial<Product>): Promise<void> {
    return this.updateProduct(productId, updates)
  }

  // Bulk update product prices
  async bulkUpdatePrices(updates: { productId: string; wholesalePrice: number; retailPrice: number }[]): Promise<void> {
    try {
      // Firestore doesn't have a native batch update, so we'll do them individually
      // For better performance in production, consider using batch writes
      const updatePromises = updates.map(update => 
        this.updateProduct(update.productId, {
          price: {
            wholesale: update.wholesalePrice,
            retail: update.retailPrice,
            currency: 'GBP' // Default currency
          }
        })
      )
      
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error bulk updating prices:', error)
      throw new Error('Failed to bulk update prices')
    }
  }
}

export const firebaseProductService = new FirebaseProductService()