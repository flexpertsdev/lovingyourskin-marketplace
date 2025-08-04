// Zustand store for authentication state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { authService } from '../services' // Uses Firebase service

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  
  // Computed
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (inviteCode: string, userData: {
    email: string
    password: string
    name: string
    language: 'en' | 'ko' | 'zh'
  }) => Promise<void>
  checkAuth: () => Promise<void>
  updateLanguage: (language: 'en' | 'ko' | 'zh') => Promise<void>
  updateUserRole: (role: 'admin' | 'retailer' | 'brand') => void
  clearError: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.login(email, password)
          set({ user, isLoading: false, isAuthenticated: true })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          })
          throw error
        }
      },
      
      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
          set({ user: null, isLoading: false, isAuthenticated: false })
        } catch (error) {
          set({ isLoading: false })
          console.error('Logout error:', error)
        }
      },
      
      register: async (inviteCode, userData) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.register(inviteCode, userData)
          set({ user, isLoading: false, isAuthenticated: true })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false
          })
          throw error
        }
      },
      
      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const user = await authService.getCurrentUser()
          set({ user, isLoading: false, isAuthenticated: !!user })
        } catch (error) {
          set({ user: null, isLoading: false, isAuthenticated: false })
        }
      },
      
      updateLanguage: async (language) => {
        const { user } = get()
        if (!user) return
        
        try {
          await authService.updateLanguage(user.id, language)
          set({ user: { ...user, language } })
        } catch (error) {
          console.error('Failed to update language:', error)
        }
      },
      
      updateUserRole: (role) => {
        const { user } = get()
        if (!user) return
        
        console.log(`[Auth Store] Updating user role from ${user.role} to ${role}`)
        set({ user: { ...user, role } })
      },
      
      clearError: () => set({ error: null }),
      
      setUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user
      onRehydrateStorage: () => (state) => {
        // This runs after the persisted state is loaded
        if (state && state.user) {
          console.log('[Auth Store] Rehydrated with user:', state.user.email)
          // Set isAuthenticated based on persisted user
          state.isAuthenticated = true
        }
      }
    }
  )
)