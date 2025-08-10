import imageCompression from 'browser-image-compression'

export interface ImageCompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
}

/**
 * Compress and optimize an image file
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 2, // Max 2MB
    maxWidthOrHeight: 1920, // Max 1920px width/height
    useWebWorker: true,
    fileType: file.type || 'image/jpeg',
    ...options
  }

  try {
    const compressedFile = await imageCompression(file, defaultOptions)
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    // Return original file if compression fails
    return file
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB before compression

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${maxSize / 1024 / 1024}MB`
    }
  }

  return { valid: true }
}

/**
 * Generate a unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const extension = originalName.split('.').pop() || 'jpg'
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.')
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').substring(0, 50)
  
  return `${sanitizedName}-${timestamp}-${random}.${extension}`
}

/**
 * Convert File to data URL for preview
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Extract Firebase Storage path from URL
 */
export function extractStoragePathFromUrl(url: string): string | null {
  try {
    // Firebase Storage URLs contain the path after '/o/'
    const match = url.match(/\/o\/(.+?)\?/)
    if (match && match[1]) {
      // Decode the URL-encoded path
      return decodeURIComponent(match[1])
    }
    return null
  } catch (error) {
    console.error('Error extracting storage path:', error)
    return null
  }
}

/**
 * Check if a URL is a valid image URL
 */
export async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return contentType?.startsWith('image/') || false
  } catch {
    return false
  }
}