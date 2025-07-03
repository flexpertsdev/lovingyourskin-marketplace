import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
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
        lastLoginAt: new Date()
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
        ...userDoc
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
}

export const firebaseAuthService = new FirebaseAuthService()