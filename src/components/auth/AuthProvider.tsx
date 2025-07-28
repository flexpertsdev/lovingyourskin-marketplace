import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/auth.store'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase/config'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AuthProvider: Auth state changed', firebaseUser?.email)
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          console.log('AuthProvider: User doc exists?', userDoc.exists())
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log('AuthProvider: User data from Firestore:', userData)
            
            const user = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || userData.displayName || '',
              role: userData.role || 'retailer',
              companyId: userData.companyId,
              salesRepId: userData.salesRepId,
              language: userData.language || 'en',
              createdAt: userData.createdAt?.toDate() || new Date(),
              lastLoginAt: new Date()
            }
            
            console.log('AuthProvider: Setting user in store:', user)
            useAuthStore.setState({
              user,
              isLoading: false,
              isAuthenticated: true
            })
          } else {
            console.log('AuthProvider: No user document found')
            useAuthStore.setState({ user: null, isLoading: false, isAuthenticated: false })
          }
        } catch (error) {
          console.error('AuthProvider: Error fetching user data', error)
          useAuthStore.setState({ user: null, isLoading: false, isAuthenticated: false })
        }
      } else {
        console.log('AuthProvider: No authenticated user')
        useAuthStore.setState({ user: null, isLoading: false, isAuthenticated: false })
      }
      
      setIsInitializing(false)
    })

    // Cleanup subscription
    return () => {
      console.log('AuthProvider: Cleaning up auth listener')
      unsubscribe()
    }
  }, [])

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Debug: Show current auth state
  const currentUser = useAuthStore.getState().user
  console.log('AuthProvider: Rendering with user:', currentUser?.email, 'role:', currentUser?.role)

  return <>{children}</>
}