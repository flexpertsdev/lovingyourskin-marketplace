import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import fs from 'fs'
import path from 'path'
import { Product, Brand } from '../src/types'

// Initialize Firebase Admin
// Note: You'll need to set up service account credentials
const serviceAccount = require('../firebase-service-account.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

async function migrateData() {
  try {
    console.log('Starting migration to Firebase...')
    
    // Read imported data
    const brandsPath = path.join(__dirname, '../src/data/imported/brands-imported.json')
    const productsPath = path.join(__dirname, '../src/data/imported/products-imported.json')
    
    if (!fs.existsSync(brandsPath) || !fs.existsSync(productsPath)) {
      console.error('Please run import-csv-data.ts first to generate the imported data files')
      return
    }
    
    const brands: Brand[] = JSON.parse(fs.readFileSync(brandsPath, 'utf-8'))
    const products: Product[] = JSON.parse(fs.readFileSync(productsPath, 'utf-8'))
    
    console.log(`Found ${brands.length} brands and ${products.length} products to migrate`)
    
    // Clear existing data (optional - comment out if you want to append)
    console.log('Clearing existing data...')
    const existingBrands = await db.collection('brands').get()
    const existingProducts = await db.collection('products').get()
    
    const deletePromises: Promise<any>[] = []
    existingBrands.forEach(doc => deletePromises.push(doc.ref.delete()))
    existingProducts.forEach(doc => deletePromises.push(doc.ref.delete()))
    await Promise.all(deletePromises)
    
    // Migrate brands
    console.log('Migrating brands...')
    const brandBatch = db.batch()
    const brandIdMap = new Map<string, string>() // old ID -> new ID
    
    brands.forEach(brand => {
      const brandRef = db.collection('brands').doc()
      brandIdMap.set(brand.id, brandRef.id)
      
      brandBatch.set(brandRef, {
        ...brand,
        id: brandRef.id, // Use Firebase generated ID
        createdAt: new Date(),
        updatedAt: new Date()
      })
    })
    
    await brandBatch.commit()
    console.log(`Migrated ${brands.length} brands`)
    
    // Migrate products with updated brand IDs
    console.log('Migrating products...')
    const productBatch = db.batch()
    let batchCount = 0
    const batchSize = 500 // Firestore batch limit
    
    for (const product of products) {
      const productRef = db.collection('products').doc()
      const newBrandId = brandIdMap.get(product.brandId) || product.brandId
      
      productBatch.set(productRef, {
        ...product,
        id: productRef.id, // Use Firebase generated ID
        brandId: newBrandId, // Update to new brand ID
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      batchCount++
      
      // Commit batch if we hit the limit
      if (batchCount >= batchSize) {
        await productBatch.commit()
        console.log(`Committed batch of ${batchCount} products`)
        batchCount = 0
      }
    }
    
    // Commit remaining products
    if (batchCount > 0) {
      await productBatch.commit()
      console.log(`Committed final batch of ${batchCount} products`)
    }
    
    console.log(`Migration completed! Migrated ${brands.length} brands and ${products.length} products`)
    
    // Verify migration
    const newBrands = await db.collection('brands').get()
    const newProducts = await db.collection('products').get()
    console.log(`Verification: ${newBrands.size} brands and ${newProducts.size} products in Firebase`)
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateData()