// Typography from design system HTML
export const typography = {
  // Font families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    korean: 'Inter, "Noto Sans KR", -apple-system, sans-serif',
  },
  
  // Font sizes and weights from wireframes
  fontSize: {
    h1: { size: '48px', weight: '300', lineHeight: '1.2' },
    h2: { size: '36px', weight: '400', lineHeight: '1.3' },
    h3: { size: '24px', weight: '500', lineHeight: '1.4' },
    h4: { size: '20px', weight: '500', lineHeight: '1.4' },
    body: { size: '16px', weight: '400', lineHeight: '1.6' },
    small: { size: '14px', weight: '400', lineHeight: '1.5' },
    caption: { size: '12px', weight: '400', lineHeight: '1.4' },
  },
  
  // Mobile sizes
  mobileFontSize: {
    h1: '32px',
    h2: '24px',
    h3: '20px',
    body: '14px',
  },
} as const

// Tailwind typography classes
export const typographyClasses = {
  h1: 'text-5xl font-light leading-tight md:text-6xl',
  h2: 'text-3xl font-normal leading-tight md:text-4xl',
  h3: 'text-2xl font-medium leading-normal',
  h4: 'text-xl font-medium leading-normal',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-normal',
  caption: 'text-xs leading-tight',
  
  // Special styles
  logo: 'text-2xl font-light tracking-widest',
} as const