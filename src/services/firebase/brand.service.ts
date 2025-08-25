import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '../../lib/firebase/config'
import { Brand } from '../../types'

// Validation helpers for brand data
const validateVolumeDiscounts = (volumeDiscounts?: Brand['volumeDiscounts']): string | null => {
  if (!volumeDiscounts || volumeDiscounts.length === 0) return null
  
  // Check for valid threshold and percentage values
  for (const discount of volumeDiscounts) {
    if (typeof discount.threshold !== 'number' || discount.threshold <= 0) {
      return 'Volume discount thresholds must be positive numbers'
    }
    if (typeof discount.discountPercentage !== 'number' || discount.discountPercentage <= 0 || discount.discountPercentage > 100) {
      return 'Volume discount percentages must be between 0 and 100'
    }
  }
  
  // Check for ascending thresholds (no duplicates)
  const thresholds = volumeDiscounts.map(d => d.threshold).sort((a, b) => a - b)
  const uniqueThresholds = [...new Set(thresholds)]
  if (thresholds.length !== uniqueThresholds.length) {
    return 'Volume discount thresholds must be unique'
  }
  
  return null
}

const validateMOA = (moa?: number): string | null => {
  if (moa !== undefined && (typeof moa !== 'number' || moa <= 0)) {
    return 'MOA (Minimum Order Amount) must be a positive number'
  }
  return null
}

class FirebaseBrandService {
  // Get all brands
  async getBrands(): Promise<Brand[]> {
    try {
      const brandsSnapshot = await getDocs(collection(db, 'brands'))
      return brandsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Brand))
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
        return {
          ...brandDoc.data(),
          id: brandDoc.id
        } as Brand
      }
      
      // If not found by ID, try by slug
      const slugQuery = query(collection(db, 'brands'), where('slug', '==', idOrSlug))
      const slugSnapshot = await getDocs(slugQuery)
      
      if (!slugSnapshot.empty) {
        const doc = slugSnapshot.docs[0]
        return {
          ...doc.data(),
          id: doc.id
        } as Brand
      }
      
      return null
    } catch (error) {
      console.error('Error fetching brand:', error)
      throw new Error('Failed to fetch brand')
    }
  }
  
  // Get exclusive partner brands
  async getExclusivePartners(): Promise<Brand[]> {
    try {
      const partnersQuery = query(
        collection(db, 'brands'),
        where('isExclusivePartner', '==', true)
      )
      const partnersSnapshot = await getDocs(partnersQuery)
      
      // Sort by establishedYear in memory after fetching
      const partners = partnersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Brand))
      
      // Sort by establishedYear if it exists, otherwise keep original order
      return partners.sort((a, b) => {
        if (a.establishedYear && b.establishedYear) {
          return a.establishedYear - b.establishedYear
        }
        return 0
      })
    } catch (error) {
      console.error('Error fetching exclusive partners:', error)
      throw new Error('Failed to fetch exclusive partners')
    }
  }
  
  // Create a new brand
  async createBrand(brandData: Omit<Brand, 'id'>): Promise<Brand> {
    try {
      // Validate MOA field
      const moaError = validateMOA(brandData.MOA)
      if (moaError) {
        throw new Error(moaError)
      }
      
      // Validate volume discounts
      const volumeDiscountError = validateVolumeDiscounts(brandData.volumeDiscounts)
      if (volumeDiscountError) {
        throw new Error(volumeDiscountError)
      }
      
      // Sort volume discounts by threshold for consistent storage
      const processedData = {
        ...brandData,
        MOA: brandData.MOA || 3000, // Default MOA
        volumeDiscounts: brandData.volumeDiscounts 
          ? brandData.volumeDiscounts.sort((a, b) => a.threshold - b.threshold)
          : undefined
      }
      
      const docRef = await addDoc(collection(db, 'brands'), {
        ...processedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      const newBrand = await getDoc(docRef)
      const data = newBrand.data()
      return { ...data, id: newBrand.id } as Brand
    } catch (error) {
      console.error('Error creating brand:', error)
      throw error instanceof Error ? error : new Error('Failed to create brand')
    }
  }
  
  // Update a brand
  async updateBrand(brandId: string, updates: Partial<Brand>): Promise<void> {
    try {
      // Validate MOA field if being updated
      if ('MOA' in updates) {
        const moaError = validateMOA(updates.MOA)
        if (moaError) {
          throw new Error(moaError)
        }
      }
      
      // Validate volume discounts if being updated
      if ('volumeDiscounts' in updates) {
        const volumeDiscountError = validateVolumeDiscounts(updates.volumeDiscounts)
        if (volumeDiscountError) {
          throw new Error(volumeDiscountError)
        }
      }
      
      // Process the updates
      const processedUpdates = { ...updates }
      
      // Sort volume discounts by threshold if provided
      if (processedUpdates.volumeDiscounts) {
        processedUpdates.volumeDiscounts = processedUpdates.volumeDiscounts
          .sort((a, b) => a.threshold - b.threshold)
      }
      
      await updateDoc(doc(db, 'brands', brandId), {
        ...processedUpdates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating brand:', error)
      throw error instanceof Error ? error : new Error('Failed to update brand')
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

  // Alias methods for consistency with other services
  async getAll(): Promise<Brand[]> {
    return this.getBrands()
  }

  async getById(brandId: string): Promise<Brand | null> {
    return this.getBrand(brandId)
  }

  async create(brandData: Omit<Brand, 'id'>): Promise<Brand> {
    return this.createBrand(brandData)
  }

  async update(brandId: string, updates: Partial<Brand>): Promise<void> {
    return this.updateBrand(brandId, updates)
  }
  
  // Helper methods for volume discount calculations
  
  /**
   * Calculate the best volume discount for a given order total
   */
  calculateVolumeDiscount(brand: Brand, orderTotal: number): {
    discount: { threshold: number; discountPercentage: number } | null;
    discountAmount: number;
    savings: number;
  } {
    if (!brand.volumeDiscounts || brand.volumeDiscounts.length === 0) {
      return { discount: null, discountAmount: 0, savings: 0 }
    }
    
    // Find the highest applicable discount
    const applicableDiscounts = brand.volumeDiscounts
      .filter(discount => orderTotal >= discount.threshold)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
    
    if (applicableDiscounts.length === 0) {
      return { discount: null, discountAmount: 0, savings: 0 }
    }
    
    const bestDiscount = applicableDiscounts[0]
    const savings = orderTotal * (bestDiscount.discountPercentage / 100)
    const discountAmount = orderTotal - savings
    
    return {
      discount: bestDiscount,
      discountAmount,
      savings
    }
  }
  
  /**
   * Get the next volume discount tier that the customer can reach
   */
  getNextVolumeDiscountTier(brand: Brand, currentTotal: number): {
    nextTier: { threshold: number; discountPercentage: number } | null;
    amountNeeded: number;
  } {
    if (!brand.volumeDiscounts || brand.volumeDiscounts.length === 0) {
      return { nextTier: null, amountNeeded: 0 }
    }
    
    // Find the next discount tier
    const nextTier = brand.volumeDiscounts
      .filter(discount => currentTotal < discount.threshold)
      .sort((a, b) => a.threshold - b.threshold)[0]
    
    if (!nextTier) {
      return { nextTier: null, amountNeeded: 0 }
    }
    
    return {
      nextTier,
      amountNeeded: nextTier.threshold - currentTotal
    }
  }
  
  /**
   * Check if an order total qualifies for MOA waiver (MOQ bypass)
   */
  checkMOAWaiver(brand: Brand, orderTotal: number): boolean {
    const moa = brand.MOA || 3000
    return orderTotal >= moa
  }

  async delete(brandId: string): Promise<void> {
    return this.deleteBrand(brandId)
  }
}

export const firebaseBrandService = new FirebaseBrandService()