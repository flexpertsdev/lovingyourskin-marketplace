import { storage } from '../../lib/firebase/config'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

class StorageService {
  /**
   * Upload an image from a URL to Firebase Storage
   */
  async uploadImageFromUrl(imageUrl: string, path: string): Promise<string> {
    try {
      // Fetch the image from the external URL
      const response = await fetch(imageUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      
      // Create a reference to the storage location
      const storageRef = ref(storage, path)
      
      // Upload the blob
      const snapshot = await uploadBytes(storageRef, blob)
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      console.error('Error uploading image from URL:', error)
      throw error
    }
  }

  /**
   * Upload an image file to Firebase Storage
   */
  async uploadImageFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      console.error('Error uploading image file:', error)
      throw error
    }
  }

  /**
   * Delete an image from Firebase Storage
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  /**
   * Get a storage path for a brand logo
   */
  getBrandLogoPath(brandId: string, filename: string): string {
    return `brands/${brandId}/logo/${filename}`
  }

  /**
   * Get a storage path for a product image
   */
  getProductImagePath(brandId: string, productId: string, filename: string): string {
    return `products/${brandId}/${productId}/${filename}`
  }

  /**
   * Extract filename from URL
   */
  getFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop() || 'image.jpg'
      
      // If filename doesn't have an extension, add .jpg
      if (!filename.includes('.')) {
        return `${filename}.jpg`
      }
      
      return filename
    } catch {
      return `image-${Date.now()}.jpg`
    }
  }

  /**
   * Check if a URL is already a Firebase Storage URL
   */
  isFirebaseStorageUrl(url: string): boolean {
    return url.includes('firebasestorage.googleapis.com') || 
           url.includes('storage.googleapis.com')
  }

  /**
   * Migrate external image URLs to Firebase Storage
   */
  async migrateExternalImage(
    externalUrl: string, 
    type: 'brand' | 'product',
    entityId: string,
    additionalPath?: string
  ): Promise<string> {
    // If it's already a Firebase URL, return as is
    if (this.isFirebaseStorageUrl(externalUrl)) {
      return externalUrl
    }

    try {
      const filename = this.getFilenameFromUrl(externalUrl)
      let path: string

      if (type === 'brand') {
        path = this.getBrandLogoPath(entityId, filename)
      } else {
        const brandId = additionalPath || 'unknown'
        path = this.getProductImagePath(brandId, entityId, filename)
      }

      const firebaseUrl = await this.uploadImageFromUrl(externalUrl, path)
      return firebaseUrl
    } catch (error) {
      console.error(`Failed to migrate image from ${externalUrl}:`, error)
      // Return the original URL if migration fails
      return externalUrl
    }
  }

  /**
   * Batch migrate multiple images
   */
  async batchMigrateImages(
    images: string[], 
    type: 'brand' | 'product',
    entityId: string,
    additionalPath?: string
  ): Promise<string[]> {
    const migratedImages = await Promise.all(
      images.map(imageUrl => 
        this.migrateExternalImage(imageUrl, type, entityId, additionalPath)
      )
    )
    
    return migratedImages
  }
}

export const firebaseStorageService = new StorageService()
