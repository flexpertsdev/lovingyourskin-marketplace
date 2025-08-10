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
import { Brand } from '../../types'

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
      const docRef = await addDoc(collection(db, 'brands'), {
        ...brandData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      const newBrand = await getDoc(docRef)
      const data = newBrand.data()
      return { ...data, id: newBrand.id } as Brand
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

  async delete(brandId: string): Promise<void> {
    return this.deleteBrand(brandId)
  }
}

export const firebaseBrandService = new FirebaseBrandService()