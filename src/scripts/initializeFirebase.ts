// src/scripts/initializeFirebase.ts
// Run this script once to initialize Firebase with default brands
// Usage: npx tsx src/scripts/initializeFirebase.ts

import { initializeFirebaseData } from '../services/firebase'

async function initialize() {
  console.log('🚀 Starting Firebase initialization...')
  
  try {
    console.log('📦 Creating default brands...')
    await initializeFirebaseData.createDefaultBrands()
    console.log('✅ Default brands created successfully!')
    
    console.log('\n🎉 Firebase initialization complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error)
    process.exit(1)
  }
}

// Run the initialization
initialize()