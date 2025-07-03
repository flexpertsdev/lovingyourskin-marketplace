// Zustand store for authentication state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { authService } from '../services' // Will use Firebase or mock based on config

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  
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
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.login(email, password)
          set({ user, isLoading: false })
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
          set({ user: null, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          console.error('Logout error:', error)
        }
      },
      
      register: async (inviteCode, userData) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.register(inviteCode, userData)
          set({ user, isLoading: false })
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
          set({ user, isLoading: false })
        } catch (error) {
          set({ user: null, isLoading: false })
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
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
)