// Zustand store for UI state management
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UIState } from '../types'

interface UIStore extends UIState {
  // Actions
  setLanguage: (language: 'en' | 'ko' | 'zh') => void
  toggleTheme: () => void
  toggleSidebar: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  
  // Mobile detection
  isMobile: boolean
  setIsMobile: (isMobile: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      language: 'en',
      theme: 'light',
      sidebarOpen: true,
      activeModal: null,
      isMobile: false,
      
      // Actions
      setLanguage: (language) => {
        set({ language })
        // Update HTML lang attribute
        document.documentElement.lang = language
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        // Update HTML class for theme
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
      },
      
      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen })
      },
      
      openModal: (modalId) => {
        set({ activeModal: modalId })
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden'
      },
      
      closeModal: () => {
        set({ activeModal: null })
        // Restore body scroll
        document.body.style.overflow = 'unset'
      },
      
      setIsMobile: (isMobile) => {
        set({ isMobile })
        // Auto-close sidebar on mobile
        if (isMobile && get().sidebarOpen) {
          set({ sidebarOpen: false })
        }
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        language: state.language,
        theme: state.theme,
      }), // Only persist language and theme preferences
    }
  )
)

// Initialize mobile detection
if (typeof window !== 'undefined') {
  const checkMobile = () => {
    const isMobile = window.innerWidth < 768
    useUIStore.getState().setIsMobile(isMobile)
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
}