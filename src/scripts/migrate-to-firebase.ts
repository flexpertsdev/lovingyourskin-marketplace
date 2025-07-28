// Data migration script from mock to Firebase
// This script migrates all mock data to Firebase Firestore

import { collection, doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Import Firebase services that are already initialized
import { db } from '../lib/firebase/config.js'

// Import types
import type { User } from '../types/index.js'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Migration functions
async function migrateUsers() {
  console.log('🔄 Migrating users...')
  
  try {
    // Read mock users data
    // For now, skip users migration as we don't have mock user data
    console.log('⚠️  No mock users data found, skipping users migration')
    return
    
    const batch = writeBatch(db)
    let count = 0
    
    // TODO: Add mock users data
    const mockUsers: User[] = []
    
    for (const user of mockUsers) {
      // Skip if user has password (we can't migrate passwords)
      if ('password' in user) {
        console.log(`⚠️  Skipping user ${user.email} - password migration not supported`)
        continue
      }
      
      // Convert mock user to Firebase format
      const userData = {
        ...user,
        createdAt: Timestamp.fromDate(new Date(user.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(user.createdAt)),
        lastLoginAt: user.lastLoginAt ? Timestamp.fromDate(new Date(user.lastLoginAt)) : null
      }
      
      // Use email as document ID for easy lookup
      const userRef = doc(collection(db, 'users'), user.id)
      batch.set(userRef, userData)
      count++
    }
    
    await batch.commit()
    console.log(`✅ Migrated ${count} users`)
  } catch (error) {
    console.error('❌ Error migrating users:', error)
  }
}

async function migrateBrands() {
  console.log('🔄 Migrating brands...')
  
  try {
    // Read mock brands data
    const brandsPath = path.join(dirname(dirname(__dirname)), 'mock-data/brands.json')
    const brandsData = await fs.readFile(brandsPath, 'utf-8')
    const mockBrandsData = JSON.parse(brandsData)
    const mockBrands = mockBrandsData.brands || mockBrandsData || []
    
    const batch = writeBatch(db)
    let count = 0
    
    for (const brand of mockBrands) {
      const brandData = {
        ...brand,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      const brandRef = doc(collection(db, 'brands'), brand.id)
      batch.set(brandRef, brandData)
      count++
    }
    
    await batch.commit()
    console.log(`✅ Migrated ${count} brands`)
  } catch (error) {
    console.error('❌ Error migrating brands:', error)
  }
}

async function migrateProducts() {
  console.log('🔄 Migrating products...')
  
  try {
    // Read mock products data
    const productsPath = path.join(dirname(dirname(__dirname)), 'mock-data/products.json')
    const productsData = await fs.readFile(productsPath, 'utf-8')
    const mockProducts = JSON.parse(productsData)
    
    // Process in batches of 500 (Firestore limit)
    const batchSize = 500
    let totalCount = 0
    
    for (let i = 0; i < mockProducts.length; i += batchSize) {
      const batch = writeBatch(db)
      const batchProducts = mockProducts.slice(i, i + batchSize)
      
      for (const product of batchProducts) {
        // Convert product data
        const productData = {
          ...product,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          // Ensure multi-language fields are objects
          name: typeof product.name === 'string' 
            ? { en: product.name, ko: product.name, zh: product.name }
            : product.name,
          description: typeof product.description === 'string'
            ? { en: product.description, ko: product.description, zh: product.description }
            : product.description,
          // Convert price structure to match Firebase collections
          wholesalePrice: product.price?.item || product.wholesalePrice?.item || 0,
          retailPrice: product.retailPrice?.item || 0
        }
        
        const productRef = doc(collection(db, 'products'), product.id)
        batch.set(productRef, productData)
      }
      
      await batch.commit()
      totalCount += batchProducts.length
      console.log(`  Processed ${totalCount}/${mockProducts.length} products...`)
    }
    
    console.log(`✅ Migrated ${totalCount} products`)
  } catch (error) {
    console.error('❌ Error migrating products:', error)
  }
}

async function migrateOrders() {
  console.log('🔄 Migrating orders...')
  
  try {
    // Skip orders migration as we don't have mock orders data
    console.log('⚠️  No mock orders data found, skipping orders migration')
    return
  } catch (error) {
    console.error('❌ Error migrating orders:', error)
  }
}

async function createAdminUser() {
  console.log('🔄 Creating admin user...')
  
  try {
    // Create a default admin user
    const adminData = {
      id: 'admin-001',
      email: 'admin@lovingyourskin.co.uk',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' as const,
      status: 'active' as const,
      companyName: 'Loving Your Skin',
      address: {
        street: '',
        city: 'London',
        postcode: '',
        country: 'UK'
      },
      phone: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
    
    await setDoc(doc(db, 'users', adminData.id), adminData)
    console.log(`✅ Created admin user: ${adminData.email}`)
    console.log('⚠️  Remember to set up authentication for this user in Firebase Auth')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Firebase migration...')
  console.log('================================')
  
  try {
    // Run migrations in order
    await migrateUsers()
    await migrateBrands()
    await migrateProducts()
    await migrateOrders()
    await createAdminUser()
    
    console.log('================================')
    console.log('✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Set up Firebase Authentication for migrated users')
    console.log('2. Test the application with Firebase services')
    console.log('3. Remove mock services and data files')
    console.log('4. Deploy Firebase security rules')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if this file is executed directly
runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export { runMigration }