import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase/config'
import type { User } from '../types'

/**
 * Initialize Firebase with a default admin user
 * Run this once to set up your first admin account
 */
export async function createInitialAdmin() {
  const adminEmail = 'admin@lovingyourskin.net'
  const adminPassword = 'TempPassword123!' // Change this immediately after first login
  const adminName = 'System Admin'

  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    )

    // Create user document
    const adminUser: Omit<User, 'id'> = {
      email: adminEmail,
      name: adminName,
      role: 'admin',
      language: 'en',
      createdAt: new Date(),
      lastLoginAt: new Date()
    }

    await setDoc(doc(db, 'users', userCredential.user.uid), adminUser)

    console.log('✅ Admin user created successfully!')
    console.log('Email:', adminEmail)
    console.log('Temporary Password:', adminPassword)
    console.log('⚠️  Please change the password immediately after first login!')
    
    return userCredential.user
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists')
    } else {
      console.error('Failed to create admin user:', error)
    }
    throw error
  }
}

/**
 * Create initial invite codes for testing
 */
export async function createTestInviteCodes() {
  const inviteCodes = [
    {
      code: 'RETAILER001',
      email: 'retailer@example.com',
      role: 'retailer' as const,
      companyName: 'Test Retailer Ltd',
      createdBy: 'system',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      used: false
    },
    {
      code: 'BRAND001',
      email: 'brand@example.com',
      role: 'brand' as const,
      companyName: 'Test Brand Co',
      createdBy: 'system',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      used: false
    }
  ]

  for (const invite of inviteCodes) {
    try {
      await setDoc(doc(db, 'inviteCodes', invite.code), invite)
      console.log(`✅ Created invite code: ${invite.code}`)
    } catch (error) {
      console.error(`Failed to create invite code ${invite.code}:`, error)
    }
  }
}

/**
 * Run all initialization tasks
 */
export async function initializeFirebaseAuth() {
  console.log('🚀 Initializing Firebase Auth...')
  
  try {
    await createInitialAdmin()
    await createTestInviteCodes()
    console.log('✅ Firebase Auth initialization complete!')
  } catch (error) {
    console.error('❌ Firebase Auth initialization failed:', error)
  }
}
