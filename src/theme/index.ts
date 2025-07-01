// Centralized theme exports
export * from './colors'
export * from './spacing'
export * from './typography'

// Component-specific styles extracted from wireframes
export const componentStyles = {
  // Buttons from design system
  button: {
    primary: 'px-10 py-4 bg-rose-gold text-white rounded-full font-medium transition-all duration-300 hover:bg-rose-gold-dark hover:-translate-y-0.5 hover:shadow-lg',
    secondary: 'px-6 py-2.5 bg-white text-text-primary rounded-full border border-border-gray hover:bg-soft-pink-hover hover:border-rose-gold transition-all duration-200',
    disabled: 'opacity-50 cursor-not-allowed',
  },
  
  // Cards from wireframes
  card: {
    base: 'bg-white rounded-xl p-6 border border-border-gray shadow-sm hover:shadow-lg transition-all duration-300',
    product: 'bg-white rounded-lg border border-border-gray overflow-hidden hover:shadow-lg transition-all group',
  },
  
  // Forms from design system
  form: {
    input: 'w-full px-4 py-3 border border-border-gray rounded-lg focus:border-rose-gold focus:outline-none focus:ring-2 focus:ring-rose-gold/20 transition-all',
    label: 'block mb-2 text-sm font-medium text-text-primary',
    error: 'text-error-red text-sm mt-1',
  },
  
  // Navigation patterns
  nav: {
    desktop: 'bg-white border-b border-border-gray h-16',
    mobile: 'fixed bottom-0 inset-x-0 bg-white border-t border-border-gray h-16 md:hidden',
  },
  
  // Badges
  badge: {
    base: 'inline-block px-3 py-1.5 rounded-full text-xs font-medium',
    success: 'bg-success-green text-white',
    warning: 'bg-warning-amber text-white',
    error: 'bg-error-red text-white',
    default: 'bg-light-gray text-text-primary',
  },
} as const