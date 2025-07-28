// Fix brands migration script
// This script deletes existing brands and re-imports them with proper data transformation

import { collection, doc, getDocs, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Import Firebase services
import { db } from '../lib/firebase/config.js'

// Import transform function
import { transformBrandData } from '../utils/transformMockData.js'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Delete all existing brands
async function deleteExistingBrands() {
  console.log('🗑️  Deleting existing brands...')
  
  try {
    const brandsSnapshot = await getDocs(collection(db, 'brands'))
    let count = 0
    
    // Delete each brand document
    for (const doc of brandsSnapshot.docs) {
      await deleteDoc(doc.ref)
      count++
    }
    
    console.log(`✅ Deleted ${count} existing brands`)
  } catch (error) {
    console.error('❌ Error deleting brands:', error)
    throw error
  }
}

// Import brands with proper transformation
async function importBrandsWithTransformation() {
  console.log('📥 Importing brands with proper transformation...')
  
  try {
    // Read mock brands data
    const brandsPath = path.join(dirname(dirname(__dirname)), 'mock-data/brands.json')
    const brandsData = await fs.readFile(brandsPath, 'utf-8')
    const mockBrandsData = JSON.parse(brandsData)
    const mockBrands = mockBrandsData.brands || []
    
    const batch = writeBatch(db)
    let count = 0
    
    for (const brand of mockBrands) {
      // Transform the brand data to ensure proper structure
      const transformedBrand = transformBrandData(brand)
      
      // Add Firebase timestamps
      const brandData = {
        ...transformedBrand,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      // Remove undefined fields (Firestore doesn't accept undefined values)
      const cleanBrandData = Object.entries(brandData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {} as any)
      
      // Ensure categories is an array of strings
      if (cleanBrandData.categories && Array.isArray(cleanBrandData.categories)) {
        cleanBrandData.categories = cleanBrandData.categories.map((cat: any) => 
          typeof cat === 'string' ? cat : cat.name || cat.id
        )
      }
      
      const brandRef = doc(collection(db, 'brands'), brand.id)
      batch.set(brandRef, cleanBrandData)
      count++
      
      console.log(`  ✓ Prepared ${brand.name} (${brand.id})`)
    }
    
    await batch.commit()
    console.log(`✅ Imported ${count} brands with proper transformation`)
  } catch (error) {
    console.error('❌ Error importing brands:', error)
    throw error
  }
}

// Verify the migration
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...')
  
  try {
    const brandsSnapshot = await getDocs(collection(db, 'brands'))
    console.log(`\n📊 Migration Summary:`)
    console.log(`  - Total brands in Firestore: ${brandsSnapshot.size}`)
    
    // Check a sample brand structure
    if (brandsSnapshot.size > 0) {
      const sampleBrand = brandsSnapshot.docs[0].data()
      console.log('\n  Sample brand structure:')
      console.log(`  - ID: ${brandsSnapshot.docs[0].id}`)
      console.log(`  - Name type: ${typeof sampleBrand.name} (should be object)`)
      console.log(`  - Has en/ko/zh fields: ${sampleBrand.name?.en ? 'Yes' : 'No'}`)
      console.log(`  - Description type: ${typeof sampleBrand.description} (should be object)`)
      console.log(`  - Categories type: ${Array.isArray(sampleBrand.categories) ? 'array' : typeof sampleBrand.categories}`)
      
      if (sampleBrand.categories && sampleBrand.categories.length > 0) {
        console.log(`  - First category type: ${typeof sampleBrand.categories[0]} (should be string)`)
      }
    }
  } catch (error) {
    console.error('❌ Error verifying migration:', error)
  }
}

// Main migration function
async function runMigrationFix() {
  console.log('🚀 Starting brands migration fix...')
  console.log('================================')
  
  try {
    // Step 1: Delete existing brands
    await deleteExistingBrands()
    
    // Step 2: Import brands with transformation
    await importBrandsWithTransformation()
    
    // Step 3: Verify the migration
    await verifyMigration()
    
    console.log('\n================================')
    console.log('✅ Brands migration fix completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Refresh the brands page to verify no duplicates')
    console.log('2. Check that brand images and information display correctly')
    console.log('3. Update FIREBASE_MIGRATION_STATUS.md if needed')
  } catch (error) {
    console.error('❌ Migration fix failed:', error)
    process.exit(1)
  }
}

// Run migration fix if this file is executed directly
runMigrationFix()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export { runMigrationFix }