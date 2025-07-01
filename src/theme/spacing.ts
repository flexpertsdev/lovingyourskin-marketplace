// 8px base spacing system from design system
export const spacing = {
  0.5: '4px',
  1: '8px',
  2: '16px',
  3: '24px',
  4: '32px',
  6: '48px',
  8: '64px',
  10: '80px',
  12: '96px',
  16: '128px',
} as const

// Common spacing patterns
export const spacingClasses = {
  // Padding
  cardPadding: 'p-6', // 24px
  mobilePadding: 'px-4', // 16px horizontal
  desktopPadding: 'px-8', // 32px horizontal
  
  // Margins
  sectionGap: 'mb-8', // 32px
  elementGap: 'mb-4', // 16px
  
  // Touch targets
  touchTarget: 'min-h-12', // 48px minimum height
} as const