import { useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase/config'
import { storageService } from '../../services'
import { Layout } from '../../components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Progress } from '../../components/ui/progress'
import type { Brand, Product } from '../../types'
import toast from 'react-hot-toast'

export default function MigrateImages() {
  const [migrating, setMigrating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [currentItem, setCurrentItem] = useState('')
  const [results, setResults] = useState<{
    brands: { success: number; failed: number; skipped: number }
    products: { success: number; failed: number; skipped: number }
  }>({
    brands: { success: 0, failed: 0, skipped: 0 },
    products: { success: 0, failed: 0, skipped: 0 }
  })

  const migrateBrandImages = async () => {
    const brandsRef = collection(db, 'brands')
    const snapshot = await getDocs(brandsRef)
    const brands = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand))
    
    let success = 0
    let failed = 0
    let skipped = 0

    for (const brand of brands) {
      setCurrentItem(`Brand: ${brand.name}`)
      
      try {
        let updated = false
        const updates: any = {}

        // Migrate logo
        if (brand.logo && !storageService.isFirebaseStorageUrl(brand.logo)) {
          const newLogoUrl = await storageService.migrateExternalImage(
            brand.logo,
            'brand',
            brand.id
          )
          updates.logo = newLogoUrl
          updated = true
        } else if (brand.logo && storageService.isFirebaseStorageUrl(brand.logo)) {
          skipped++
          continue
        }

        // Migrate hero image
        if (brand.heroImage && !storageService.isFirebaseStorageUrl(brand.heroImage)) {
          const newHeroUrl = await storageService.migrateExternalImage(
            brand.heroImage,
            'brand',
            brand.id
          )
          updates.heroImage = newHeroUrl
          updated = true
        }

        if (updated) {
          await updateDoc(doc(db, 'brands', brand.id), updates)
          success++
        } else {
          skipped++
        }
      } catch (error) {
        console.error(`Failed to migrate brand ${brand.id}:`, error)
        failed++
      }

      setProgress(prev => prev + 1)
    }

    return { success, failed, skipped }
  }

  const migrateProductImages = async () => {
    const productsRef = collection(db, 'products')
    const snapshot = await getDocs(productsRef)
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
    
    let success = 0
    let failed = 0
    let skipped = 0

    for (const product of products) {
      setCurrentItem(`Product: ${product.name}`)
      
      try {
        let updated = false
        const updates: any = {}

        // Migrate primary image
        if (product.images?.primary && !storageService.isFirebaseStorageUrl(product.images.primary)) {
          const newPrimaryUrl = await storageService.migrateExternalImage(
            product.images.primary,
            'product',
            product.id,
            product.brandId
          )
          updates['images.primary'] = newPrimaryUrl
          updated = true
        }

        // Migrate gallery images
        if (product.images?.gallery && product.images.gallery.length > 0) {
          const hasExternalImages = product.images.gallery.some(
            (url: string) => !storageService.isFirebaseStorageUrl(url)
          )

          if (hasExternalImages) {
            const newGallery = await storageService.batchMigrateImages(
              product.images.gallery,
              'product',
              product.id,
              product.brandId
            )
            updates['images.gallery'] = newGallery
            updated = true
          }
        }

        if (updated) {
          await updateDoc(doc(db, 'products', product.id), updates)
          success++
        } else {
          skipped++
        }
      } catch (error) {
        console.error(`Failed to migrate product ${product.id}:`, error)
        failed++
      }

      setProgress(prev => prev + 1)
    }

    return { success, failed, skipped }
  }

  const startMigration = async () => {
    setMigrating(true)
    setProgress(0)
    setResults({
      brands: { success: 0, failed: 0, skipped: 0 },
      products: { success: 0, failed: 0, skipped: 0 }
    })

    try {
      // Count total items
      const brandsSnapshot = await getDocs(collection(db, 'brands'))
      const productsSnapshot = await getDocs(collection(db, 'products'))
      const total = brandsSnapshot.size + productsSnapshot.size
      setTotalItems(total)

      // Migrate brands
      toast.loading('Migrating brand images...')
      const brandResults = await migrateBrandImages()
      
      // Migrate products
      toast.loading('Migrating product images...')
      const productResults = await migrateProductImages()

      setResults({
        brands: brandResults,
        products: productResults
      })

      toast.success('Migration completed!')
    } catch (error) {
      console.error('Migration failed:', error)
      toast.error('Migration failed. Check console for details.')
    } finally {
      setMigrating(false)
    }
  }

  const progressPercentage = totalItems > 0 ? (progress / totalItems) * 100 : 0

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Migrate External Images to Firebase Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                This tool will migrate all external image URLs in your brands and products to Firebase Storage.
                This ensures all images are hosted on your own infrastructure and won't be affected by external changes.
              </p>

              {!migrating && (
                <Button onClick={startMigration} size="large">
                  Start Migration
                </Button>
              )}

              {migrating && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {progress} / {totalItems}</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} />
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Currently processing: {currentItem}
                  </p>
                </div>
              )}

              {!migrating && (results.brands.success > 0 || results.products.success > 0) && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-semibold">Migration Results</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Brands</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 text-sm">
                          <p>✅ Success: {results.brands.success}</p>
                          <p>⏭️ Skipped: {results.brands.skipped}</p>
                          <p>❌ Failed: {results.brands.failed}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 text-sm">
                          <p>✅ Success: {results.products.success}</p>
                          <p>⏭️ Skipped: {results.products.skipped}</p>
                          <p>❌ Failed: {results.products.failed}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
