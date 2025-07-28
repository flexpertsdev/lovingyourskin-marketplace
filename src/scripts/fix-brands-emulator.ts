// Fix brands migration script for use with Firebase Emulator
// This script connects to the emulator to avoid permission issues

import { collection, doc, getDocs, deleteDoc, writeBatch, Timestamp, connectFirestoreEmulator } from 'firebase/firestore'
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

// Connect to emulator if not already connected
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('🔌 Connecting to Firestore Emulator...')
  connectFirestoreEmulator(db, 'localhost', 8080)
}

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
      
      // Ensure categories is an array of strings
      if (brandData.categories && Array.isArray(brandData.categories)) {
        brandData.categories = brandData.categories.map((cat: any) => 
          typeof cat === 'string' ? cat : cat.name || cat.id
        )
      }
      
      const brandRef = doc(collection(db, 'brands'), brand.id)
      batch.set(brandRef, brandData)
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
  console.log('🚀 Starting brands migration fix (Emulator Mode)...')
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
    console.log('\n⚠️  Note: This migration was run against the emulator.')
    console.log('To apply to production, export from emulator and import to production.')
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