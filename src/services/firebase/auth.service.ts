import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase/config'
import { User, InviteCode } from '../../types'

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  language: 'en' | 'ko' | 'zh'
}

export interface ConsumerRegisterData extends RegisterData {
  phoneNumber?: string
  newsletter?: boolean
}

class FirebaseAuthService {
  // Convert Firebase user to our User type
  private async convertToUser(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!userDoc.exists()) {
        console.error('User document not found for:', firebaseUser.uid)
        return null
      }
      
      const userData = userDoc.data()
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name || '',
        role: userData.role || 'retailer',
        companyId: userData.companyId,
        salesRepId: userData.salesRepId,
        language: userData.language || 'en',
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLoginAt: new Date(),
        // Consumer-specific fields
        wishlist: userData.wishlist || [],
        addresses: userData.addresses || [],
        phoneNumber: userData.phoneNumber,
        newsletter: userData.newsletter
      }
    } catch (error) {
      console.error('Error converting user:', error)
      return null
    }
  }

  // Login with email and password (matches mock service interface)
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Update last login time
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: new Date()
      }, { merge: true })
      
      const user = await this.convertToUser(userCredential.user)
      if (!user) {
        throw new Error('User data not found')
      }
      
      return user
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password')
      }
      throw new Error(error.message || 'Failed to login')
    }
  }

  // Validate invite code
  async validateInviteCode(code: string): Promise<InviteCode> {
    try {
      const inviteDoc = await getDoc(doc(db, 'inviteCodes', code))
      if (!inviteDoc.exists()) {
        throw new Error('Invalid or expired invite code')
      }
      
      const inviteData = inviteDoc.data() as InviteCode
      if (inviteData.used) {
        throw new Error('This invite code has already been used')
      }
      
      if (new Date() > new Date(inviteData.expiresAt)) {
        throw new Error('This invite code has expired')
      }
      
      return {
        ...inviteData,
        code,
        expiresAt: inviteData.expiresAt instanceof Date ? inviteData.expiresAt : new Date(inviteData.expiresAt)
      }
    } catch (error: any) {
      console.error('Invite code validation error:', error)
      throw new Error(error.message || 'Failed to validate invite code')
    }
  }

  // Register with invite code (matches mock service interface)
  async register(inviteCode: string, userData: RegisterData): Promise<User> {
    try {
      // Validate invite first
      const invite = await this.validateInviteCode(inviteCode)
      
      // Check if email matches invite code (case-insensitive)
      if (userData.email.toLowerCase() !== invite.email.toLowerCase()) {
        throw new Error('Email address does not match the invite code')
      }
      
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      )
      
      // Create user document in Firestore
      const userDoc = {
        email: userData.email,
        name: userData.name,
        role: invite.role,
        companyId: invite.companyId,
        salesRepId: invite.salesRepId,
        language: userData.language,
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
      
      // Mark invite code as used
      await setDoc(doc(db, 'inviteCodes', inviteCode), {
        used: true,
        usedBy: userCredential.user.uid,
        usedAt: new Date()
      }, { merge: true })
      
      return {
        id: userCredential.user.uid,
        ...userDoc,
        companyId: userDoc.companyId || '' // Default to empty string if undefined
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.message || 'Failed to register')
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw new Error('Failed to logout')
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return null
    
    return await this.convertToUser(firebaseUser)
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
      console.log(`Password reset email sent to ${email}`)
    } catch (error: any) {
      console.error('Password reset error:', error)
      // Don't reveal if email exists
      return
    }
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.convertToUser(firebaseUser)
        callback(user)
      } else {
        callback(null)
      }
    })
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!auth.currentUser
  }

  // Update user language preference
  async updateLanguage(userId: string, language: 'en' | 'ko' | 'zh'): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), {
        language: language
      }, { merge: true })
    } catch (error) {
      console.error('Failed to update language:', error)
      throw new Error('Failed to update language preference')
    }
  }

  // Register consumer without invite code
  async registerConsumer(userData: ConsumerRegisterData): Promise<User> {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      )
      
      // Create user document in Firestore
      const userDoc = {
        email: userData.email,
        name: userData.name,
        role: 'consumer' as const,
        language: userData.language,
        phoneNumber: userData.phoneNumber,
        newsletter: userData.newsletter || false,
        wishlist: [],
        addresses: [],
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
      
      return {
        id: userCredential.user.uid,
        ...userDoc
      }
    } catch (error: any) {
      console.error('Consumer registration error:', error)
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists')
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters')
      }
      throw new Error(error.message || 'Failed to register')
    }
  }

  // Generate a new invite code
  async generateInviteCode(data: {
    email: string
    role: 'admin' | 'retailer' | 'brand'
    companyId?: string
    salesRepId?: string
    createdBy: string
    expiresInDays?: number
  }): Promise<InviteCode> {
    try {
      // Generate a unique code
      const code = `${data.role.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      
      const expiresInDays = data.expiresInDays || 30
      const newInvite: InviteCode = {
        id: code, // Use code as ID for Firestore
        code,
        email: data.email,
        role: data.role,
        companyId: data.companyId,
        salesRepId: data.salesRepId,
        createdBy: data.createdBy,
        used: false,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
      
      // Save to Firestore
      await setDoc(doc(db, 'inviteCodes', code), newInvite)
      
      return newInvite
    } catch (error) {
      console.error('Failed to generate invite code:', error)
      throw new Error('Failed to generate invite code')
    }
  }

  // Get all invite codes (for admin)
  async getAllInviteCodes(): Promise<InviteCode[]> {
    try {
      const snapshot = await getDocs(collection(db, 'inviteCodes'))
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        expiresAt: doc.data().expiresAt?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as InviteCode[]
    } catch (error) {
      console.error('Failed to get invite codes:', error)
      throw new Error('Failed to get invite codes')
    }
  }

  async deleteInviteCode(inviteCodeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'inviteCodes', inviteCodeId))
    } catch (error) {
      console.error('Failed to delete invite code:', error)
      throw new Error('Failed to delete invite code')
    }
  }

  // Create a new user (admin only)
  async create(userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>): Promise<User> {
    try {
      // Generate a unique ID
      const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      const newUser: User = {
        id: userId,
        ...userData,
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      
      await setDoc(doc(db, 'users', userId), newUser)
      return newUser
    } catch (error) {
      console.error('Failed to create user:', error)
      throw new Error('Failed to create user')
    }
  }

  // Update user data
  async update(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), updates, { merge: true })
    } catch (error) {
      console.error('Failed to update user:', error)
      throw new Error('Failed to update user')
    }
  }

  // Delete user (soft delete by setting status)
  async delete(userId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), { 
        status: 'deleted',
        deletedAt: new Date()
      }, { merge: true })
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw new Error('Failed to delete user')
    }
  }

  // Get all users (for admin)
  async getAllUsers(): Promise<User[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'))
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLoginAt: doc.data().lastLoginAt?.toDate() || new Date()
      })) as User[]
    } catch (error) {
      console.error('Failed to get all users:', error)
      throw new Error('Failed to get all users')
    }
  }

  // Consumer-specific methods

  // Add address to consumer account
  async addAddress(userId: string, address: Omit<import('../../types').Address, 'id'>): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) throw new Error('User not found')
      
      const userData = userDoc.data()
      if (userData.role !== 'consumer') {
        throw new Error('Only consumers can add addresses')
      }
      
      const addressId = `addr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const newAddress = { id: addressId, ...address }
      
      const addresses = userData.addresses || []
      addresses.push(newAddress)
      
      await setDoc(doc(db, 'users', userId), {
        addresses
      }, { merge: true })
    } catch (error) {
      console.error('Failed to add address:', error)
      throw new Error('Failed to add address')
    }
  }

  // Update address
  async updateAddress(userId: string, addressId: string, updates: Partial<import('../../types').Address>): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) throw new Error('User not found')
      
      const userData = userDoc.data()
      const addresses = userData.addresses || []
      const addressIndex = addresses.findIndex((a: any) => a.id === addressId)
      
      if (addressIndex === -1) throw new Error('Address not found')
      
      addresses[addressIndex] = { ...addresses[addressIndex], ...updates }
      
      await setDoc(doc(db, 'users', userId), {
        addresses
      }, { merge: true })
    } catch (error) {
      console.error('Failed to update address:', error)
      throw new Error('Failed to update address')
    }
  }

  // Delete address
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) throw new Error('User not found')
      
      const userData = userDoc.data()
      const addresses = (userData.addresses || []).filter((a: any) => a.id !== addressId)
      
      await setDoc(doc(db, 'users', userId), {
        addresses
      }, { merge: true })
    } catch (error) {
      console.error('Failed to delete address:', error)
      throw new Error('Failed to delete address')
    }
  }

  // Add to wishlist
  async addToWishlist(userId: string, productId: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) throw new Error('User not found')
      
      const userData = userDoc.data()
      if (userData.role !== 'consumer') {
        throw new Error('Only consumers can have wishlists')
      }
      
      const wishlist = userData.wishlist || []
      if (!wishlist.includes(productId)) {
        wishlist.push(productId)
      }
      
      await setDoc(doc(db, 'users', userId), {
        wishlist
      }, { merge: true })
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      throw new Error('Failed to add to wishlist')
    }
  }

  // Remove from wishlist
  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) throw new Error('User not found')
      
      const userData = userDoc.data()
      const wishlist = (userData.wishlist || []).filter((id: string) => id !== productId)
      
      await setDoc(doc(db, 'users', userId), {
        wishlist
      }, { merge: true })
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
      throw new Error('Failed to remove from wishlist')
    }
  }

  // Update newsletter subscription
  async updateNewsletterPreference(userId: string, subscribed: boolean): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), {
        newsletter: subscribed
      }, { merge: true })
    } catch (error) {
      console.error('Failed to update newsletter preference:', error)
      throw new Error('Failed to update newsletter preference')
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService()