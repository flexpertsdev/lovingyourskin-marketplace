import React, { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X, Upload, Image as ImageIcon, AlertCircle, Loader2, GripVertical } from 'lucide-react'
import { firebaseStorageService, type UploadProgress } from '../../services/firebase/storageService'
import { validateImageFile, fileToDataURL } from '../../utils/imageUtils'
import { toast } from 'react-hot-toast'
import { cn } from '../../lib/utils/cn'

interface ImageItem {
  id: string
  url: string
  file?: File
  isUploading?: boolean
  progress?: number
  error?: string
}

interface ImageUploadManagerProps {
  images: string[]
  onChange: (images: string[]) => void
  entityType: 'product' | 'brand'
  entityId: string
  brandId?: string // For products
  maxImages?: number
  className?: string
  label?: string
  helpText?: string
}

interface SortableImageItemProps {
  image: ImageItem
  onRemove: (id: string) => void
  index: number
}

function SortableImageItem({ image, onRemove, index }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group bg-white border rounded-lg overflow-hidden',
        isDragging && 'shadow-xl z-50'
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-move bg-white/90 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-gray-600" />
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        className="absolute top-2 right-2 z-10 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        disabled={image.isUploading}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Image or upload progress */}
      <div className="aspect-square relative">
        {image.isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <div className="text-sm text-gray-600">Uploading...</div>
            {image.progress !== undefined && (
              <div className="w-3/4 mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${image.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{Math.round(image.progress)}%</div>
              </div>
            )}
          </div>
        ) : image.error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-4">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-xs text-red-600 text-center">{image.error}</div>
          </div>
        ) : (
          <img
            src={image.url}
            alt={`Image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Index badge */}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  )
}

export function ImageUploadManager({
  images,
  onChange,
  entityType,
  entityId,
  brandId,
  maxImages = 10,
  className,
  label = 'Images',
  helpText = 'Drag and drop images or click to browse. Images will be automatically compressed.',
}: ImageUploadManagerProps) {
  const [imageItems, setImageItems] = useState<ImageItem[]>(
    images.map((url, index) => ({
      id: `existing-${index}`,
      url,
    }))
  )
  const [isDragActive, setIsDragActive] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setImageItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update parent with new order
        const urls = newItems
          .filter(item => !item.isUploading && !item.error && item.url)
          .map(item => item.url)
        onChange(urls)
        
        return newItems
      })
    }
  }

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newImages: ImageItem[] = []
    const filesToUpload: File[] = []

    // Validate files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const validation = validateImageFile(file)
      
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file')
        continue
      }

      // Check max images
      if (imageItems.length + newImages.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`)
        break
      }

      const dataUrl = await fileToDataURL(file)
      const id = `new-${Date.now()}-${i}`
      
      newImages.push({
        id,
        url: dataUrl,
        file,
        isUploading: true,
        progress: 0,
      })
      
      filesToUpload.push(file)
    }

    if (newImages.length === 0) return

    // Add new images to state
    setImageItems(prev => [...prev, ...newImages])

    // Upload files
    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i]
      const file = image.file!

      try {
        let path: string
        if (entityType === 'brand') {
          path = firebaseStorageService.getBrandImagePath(entityId, file.name)
        } else {
          const bid = brandId || entityId
          path = firebaseStorageService.getProductGalleryPath(bid, entityId, file.name)
        }

        const url = await firebaseStorageService.uploadImageFileWithProgress(
          file,
          path,
          (progress: UploadProgress) => {
            setImageItems(prev =>
              prev.map(item =>
                item.id === image.id
                  ? { ...item, progress: progress.percentage }
                  : item
              )
            )
          },
          true // compress
        )

        // Update with uploaded URL
        setImageItems(prev => {
          const updated = prev.map(item =>
            item.id === image.id
              ? { ...item, url, isUploading: false, progress: undefined }
              : item
          )
          
          // Update parent
          const urls = updated
            .filter(item => !item.isUploading && !item.error && item.url)
            .map(item => item.url)
          onChange(urls)
          
          return updated
        })

        toast.success('Image uploaded successfully')
      } catch (error) {
        console.error('Upload error:', error)
        
        // Mark as error
        setImageItems(prev =>
          prev.map(item =>
            item.id === image.id
              ? { ...item, isUploading: false, error: 'Upload failed' }
              : item
          )
        )
        
        toast.error('Failed to upload image')
      }
    }
  }, [imageItems, maxImages, entityType, entityId, brandId, onChange])

  const handleRemove = useCallback(async (id: string) => {
    const item = imageItems.find(i => i.id === id)
    if (!item) return

    // If it's an existing image, try to delete from storage
    if (item.url && !item.file && !item.url.startsWith('data:')) {
      try {
        await firebaseStorageService.deleteImageByUrl(item.url)
        toast.success('Image deleted')
      } catch (error) {
        console.error('Failed to delete image:', error)
        toast.error('Failed to delete image from storage')
      }
    }

    // Remove from state
    setImageItems(prev => {
      const updated = prev.filter(i => i.id !== id)
      
      // Update parent
      const urls = updated
        .filter(item => !item.isUploading && !item.error && item.url)
        .map(item => item.url)
      onChange(urls)
      
      return updated
    })
  }, [imageItems, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {helpText && (
        <p className="text-sm text-gray-500 mb-2">{helpText}</p>
      )}

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400',
          imageItems.length >= maxImages && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id={`image-upload-${entityId}`}
          disabled={imageItems.length >= maxImages}
        />
        <label
          htmlFor={`image-upload-${entityId}`}
          className={cn(
            'cursor-pointer',
            imageItems.length >= maxImages && 'cursor-not-allowed'
          )}
        >
          <div className="flex flex-col items-center">
            {isDragActive ? (
              <>
                <Upload className="h-10 w-10 text-primary mb-2" />
                <p className="text-sm text-primary">Drop images here</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {imageItems.length}/{maxImages} images
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Image grid with drag and drop sorting */}
      {imageItems.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={imageItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
              {imageItems.map((image, index) => (
                <SortableImageItem
                  key={image.id}
                  image={image}
                  onRemove={handleRemove}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}