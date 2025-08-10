import { storage } from '../../lib/firebase/config'
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable, UploadTaskSnapshot } from 'firebase/storage'
import { extractStoragePathFromUrl, generateUniqueFilename, compressImage } from '../../utils/imageUtils'

export interface UploadProgress {
  bytesTransferred: number
  totalBytes: number
  percentage: number
}

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

  /**
   * Upload an image file with progress tracking
   */
  async uploadImageFileWithProgress(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void,
    compress: boolean = true
  ): Promise<string> {
    try {
      // Compress image if requested
      let fileToUpload = file
      if (compress) {
        fileToUpload = await compressImage(file)
      }

      // Generate unique filename to avoid conflicts
      const uniquePath = path.includes('.') 
        ? path 
        : `${path}/${generateUniqueFilename(file.name)}`

      const storageRef = ref(storage, uniquePath)
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload)

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            }
            onProgress?.(progress)
          },
          (error) => {
            console.error('Upload error:', error)
            reject(error)
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          }
        )
      })
    } catch (error) {
      console.error('Error uploading image with progress:', error)
      throw error
    }
  }

  /**
   * Delete an image by its URL
   */
  async deleteImageByUrl(url: string): Promise<void> {
    try {
      const path = extractStoragePathFromUrl(url)
      if (!path) {
        throw new Error('Could not extract storage path from URL')
      }
      await this.deleteImage(path)
    } catch (error) {
      console.error('Error deleting image by URL:', error)
      throw error
    }
  }

  /**
   * Batch upload multiple files with progress tracking
   */
  async batchUploadFiles(
    files: File[],
    basePath: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
    compress: boolean = true
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadImageFileWithProgress(
        file,
        `${basePath}/${generateUniqueFilename(file.name)}`,
        (progress) => onProgress?.(index, progress),
        compress
      )
    )

    try {
      const urls = await Promise.all(uploadPromises)
      return urls
    } catch (error) {
      console.error('Error in batch upload:', error)
      throw error
    }
  }

  /**
   * Batch delete multiple images by URLs
   */
  async batchDeleteByUrls(urls: string[]): Promise<void> {
    const deletePromises = urls.map(url => this.deleteImageByUrl(url))
    
    try {
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error in batch delete:', error)
      // Continue deleting even if some fail
      const results = await Promise.allSettled(deletePromises)
      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        console.warn(`Failed to delete ${failed.length} images`)
      }
    }
  }

  /**
   * Get a storage path for brand images
   */
  getBrandImagePath(brandId: string, filename: string): string {
    return `brands/${brandId}/images/${filename}`
  }

  /**
   * Get a storage path for product gallery images
   */
  getProductGalleryPath(brandId: string, productId: string, filename: string): string {
    return `products/${brandId}/${productId}/gallery/${filename}`
  }
}

export const firebaseStorageService = new StorageService()
