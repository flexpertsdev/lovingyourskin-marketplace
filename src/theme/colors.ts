// Extracted from wireframes/lys-design-system-page.html CSS variables
export const colors = {
  primary: {
    white: '#FFFFFF',
    softPink: '#FDF8F6',
    roseGold: '#D4A5A5',
    roseGoldDark: '#C48B8B',
    softPinkHover: '#F5E6E0',
  },
  text: {
    primary: '#2D2D2D',
    secondary: '#5A5A5A',
    charcoal: '#1A1A1A',
  },
  gray: {
    light: '#F0F0F0',
    medium: '#8B8B8B',
    border: '#E0E0E0',
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
} as const

// Tailwind class mappings
export const colorClasses = {
  primary: 'bg-rose-gold hover:bg-rose-gold-dark',
  secondary: 'bg-white hover:bg-soft-pink-hover',
  success: 'bg-success-green',
  warning: 'bg-warning-amber',
  error: 'bg-error-red',
} as const