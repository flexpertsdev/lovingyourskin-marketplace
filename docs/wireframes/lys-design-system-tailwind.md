# LYS Design System - Tailwind CSS Implementation Guide

## 🎯 Core Principles

### Mobile-First Design Philosophy
- **Start Small**: Design for 320px screens first
- **Progressive Enhancement**: Add complexity for larger screens
- **Touch-First**: All interactive elements minimum 48px (12 Tailwind units)
- **Thumb-Friendly**: Bottom navigation for primary mobile actions

### Viewport Height Best Practices
```css
/* Use dvh (dynamic viewport height) for mobile-safe full height */
.full-height-mobile {
  @apply h-screen; /* Fallback */
  @apply h-[100dvh]; /* Dynamic viewport height */
}

/* Account for mobile browser chrome */
.mobile-safe-height {
  @apply min-h-screen min-h-[100dvh];
}

/* Bottom nav safe area */
.with-bottom-nav {
  @apply pb-16; /* 64px for nav */
  @apply pb-[calc(4rem+env(safe-area-inset-bottom))]; /* iOS safe area */
}
```

## 🎨 Design Tokens

### Color Palette
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#D4A5A5', // rose-gold
          'hover': '#C48B8B', // rose-gold-dark
          'light': '#FDF8F6', // soft-pink
        },
        'neutral': {
          'white': '#FFFFFF',
          'charcoal': '#1A1A1A', // deep-charcoal
          'dark': '#2D2D2D', // text-primary
          'medium': '#5A5A5A', // text-secondary
          'light': '#8B8B8B', // medium-gray
          'border': '#E0E0E0', // border-gray
          'bg': '#F0F0F0', // light-gray
        },
        'status': {
          'success': '#4CAF50',
          'warning': '#FF9800',
          'error': '#F44336',
        }
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'korean': ['Inter', 'Noto Sans KR', '-apple-system', 'sans-serif'],
      },
    }
  }
}
```

### Spacing Scale (8px base)
```css
/* Tailwind spacing units */
space-0.5 → 0.125rem (2px)
space-1 → 0.25rem (4px)
space-2 → 0.5rem (8px)    /* Base unit */
space-3 → 0.75rem (12px)
space-4 → 1rem (16px)
space-6 → 1.5rem (24px)
space-8 → 2rem (32px)
space-12 → 3rem (48px)    /* Touch target minimum */
space-16 → 4rem (64px)    /* Nav heights */
```

## 📐 Breakpoints & Grid System

### Breakpoint Strategy
```css
/* Mobile First Breakpoints */
sm: '640px',   /* Large phones */
md: '768px',   /* Tablets */
lg: '1024px',  /* Desktop */
xl: '1280px',  /* Wide screens */
2xl: '1536px', /* Extra wide */

/* Usage */
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

### Container System
```html
<!-- Mobile-first responsive container -->
<div class="container mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>

<!-- Max-width utilities -->
<div class="max-w-screen-xl mx-auto"> <!-- 1280px -->
<div class="max-w-7xl mx-auto">       <!-- 1280px -->
<div class="max-w-6xl mx-auto">       <!-- 1152px -->
<div class="max-w-4xl mx-auto">       <!-- 896px -->
```

### Grid Patterns
```html
<!-- Product Grid: 2 cols mobile, 3 tablet, 4 desktop -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

<!-- Dashboard Cards: Stack on mobile, grid on desktop -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- Form Layout: Single column mobile, two column desktop -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

## 🧩 Component Patterns

### Navigation Components

#### Desktop Navigation
```html
<nav class="hidden md:flex items-center justify-between bg-white border-b border-neutral-border h-16 px-6">
  <div class="flex items-center space-x-8">
    <a href="/" class="text-2xl font-light tracking-wider">LOVING YOUR SKIN</a>
    <div class="flex items-center space-x-6">
      <a href="#" class="text-neutral-dark hover:text-primary transition-colors px-3 py-2 rounded-full hover:bg-primary-light">Dashboard</a>
      <!-- More nav items -->
    </div>
  </div>
  <div class="flex items-center space-x-4">
    <select class="px-3 py-1.5 text-sm border border-neutral-border rounded-full">
      <option>EN</option>
    </select>
    <button class="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-all">
      Login
    </button>
  </div>
</nav>
```

#### Mobile Bottom Navigation
```html
<nav class="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-border md:hidden z-50">
  <div class="grid grid-cols-5 h-16">
    <a href="#" class="flex flex-col items-center justify-center text-neutral-medium hover:text-primary">
      <svg class="w-6 h-6" /><!-- Icon -->
      <span class="text-xs mt-1">Home</span>
    </a>
    <!-- More nav items -->
  </div>
</nav>

<!-- Page content with bottom nav padding -->
<main class="pb-16 md:pb-0">
  <!-- Content -->
</main>
```

### Responsive Card Components
```html
<!-- Product Card -->
<div class="bg-white rounded-lg border border-neutral-border overflow-hidden hover:shadow-lg transition-all group">
  <div class="aspect-square bg-primary-light flex items-center justify-center">
    <img src="#" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
  </div>
  <div class="p-4">
    <h3 class="font-medium text-neutral-dark">Product Name</h3>
    <p class="text-sm text-neutral-medium mt-1">Description</p>
    <p class="text-primary font-semibold mt-2">£12.50</p>
  </div>
</div>
```

### Form Elements
```html
<!-- Input with floating label -->
<div class="relative">
  <input type="text" id="email" class="peer w-full px-4 py-3 border border-neutral-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder=" " />
  <label for="email" class="absolute left-4 -top-2.5 bg-white px-1 text-sm text-neutral-medium peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm transition-all">
    Email Address
  </label>
</div>
```

### Buttons
```html
<!-- Primary Button -->
<button class="px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="px-6 py-2.5 bg-white text-neutral-dark font-medium rounded-full border border-neutral-border hover:bg-primary-light hover:border-primary transition-all duration-200">
  Secondary Action
</button>

<!-- Icon Button -->
<button class="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary-hover transition-colors">
  <svg class="w-5 h-5" />
</button>
```

## 🎭 Icon System

### Lucide React Icons
```jsx
// Installation
npm install lucide-react

// Usage
import { 
  Home, Store, ShoppingCart, Package, User, 
  Menu, X, ChevronRight, Plus, Minus, 
  Check, AlertCircle, Info, Send, Paperclip 
} from 'lucide-react'

// Icon component with consistent sizing
<Home className="w-6 h-6" />
<Menu className="w-5 h-5" />
```

### Icon Sizing Guidelines
```css
/* Icon sizes */
.icon-xs { @apply w-4 h-4; }  /* 16px */
.icon-sm { @apply w-5 h-5; }  /* 20px */
.icon-md { @apply w-6 h-6; }  /* 24px - Default */
.icon-lg { @apply w-8 h-8; }  /* 32px */
.icon-xl { @apply w-10 h-10; } /* 40px */
```

## 📱 Mobile-Specific Patterns

### Bottom Sheets (Mobile Modals)
```html
<!-- Bottom Sheet Container -->
<div class="fixed inset-0 z-50 md:flex md:items-center md:justify-center">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black/50" />
  
  <!-- Sheet Content -->
  <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl md:relative md:bottom-auto md:rounded-2xl md:max-w-lg md:mx-auto">
    <!-- Drag Handle (mobile only) -->
    <div class="w-12 h-1 bg-neutral-border rounded-full mx-auto mt-3 mb-4 md:hidden" />
    
    <!-- Content -->
    <div class="px-6 pb-6 max-h-[80vh] overflow-y-auto">
      <!-- Sheet content -->
    </div>
  </div>
</div>
```

### Swipe Actions
```html
<!-- Swipeable List Item -->
<div class="relative overflow-hidden">
  <div class="flex transition-transform duration-200" data-swipe-container>
    <!-- Main Content -->
    <div class="flex-1 bg-white p-4">
      <p>Swipe left to delete</p>
    </div>
    
    <!-- Action Area -->
    <div class="absolute right-0 top-0 bottom-0 flex items-center bg-status-error text-white px-6 translate-x-full transition-transform" data-swipe-action>
      <span>Delete</span>
    </div>
  </div>
</div>
```

### Touch-Friendly Targets
```html
<!-- Minimum 48px touch targets -->
<button class="min-h-[48px] min-w-[48px] px-6 py-3">
  Touch Me
</button>

<!-- Increased tap area for small icons -->
<button class="relative p-3 -m-3">
  <svg class="w-5 h-5" />
</button>
```

## 🎬 Animations & Transitions

### Standard Transitions
```css
/* Timing Functions */
.transition-standard { @apply transition-all duration-300 ease-out; }
.transition-fast { @apply transition-all duration-150 ease-out; }
.transition-slow { @apply transition-all duration-500 ease-out; }

/* Common Animations */
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-up { animation: slide-up 0.3s ease-out; }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
```

### Loading States
```html
<!-- Skeleton Loader -->
<div class="animate-pulse">
  <div class="h-4 bg-neutral-border rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-neutral-border rounded w-1/2"></div>
</div>

<!-- Spinner -->
<div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-border border-t-primary"></div>
```

## 🏗️ Layout Patterns

### Page Structure with Dynamic Height
```html
<div class="min-h-[100dvh] flex flex-col">
  <!-- Fixed Header -->
  <header class="flex-shrink-0 h-16 bg-white border-b border-neutral-border">
    <!-- Navigation -->
  </header>
  
  <!-- Scrollable Content -->
  <main class="flex-1 overflow-y-auto">
    <div class="container mx-auto px-4 py-6">
      <!-- Page content -->
    </div>
  </main>
  
  <!-- Fixed Bottom Nav (Mobile) -->
  <nav class="flex-shrink-0 h-16 bg-white border-t border-neutral-border md:hidden">
    <!-- Bottom navigation -->
  </nav>
</div>
```

### Safe Area Handling (iOS)
```css
/* Account for notch and home indicator */
.safe-top { @apply pt-[env(safe-area-inset-top)]; }
.safe-bottom { @apply pb-[env(safe-area-inset-bottom)]; }
.safe-left { @apply pl-[env(safe-area-inset-left)]; }
.safe-right { @apply pr-[env(safe-area-inset-right)]; }

/* Bottom nav with safe area */
.bottom-nav-safe {
  @apply h-16;
  @apply pb-[env(safe-area-inset-bottom)];
  height: calc(4rem + env(safe-area-inset-bottom));
}
```

## 🎯 Best Practices

### Performance
1. **Lazy Load Images**: Use `loading="lazy"` on images below the fold
2. **Optimize Animations**: Prefer `transform` and `opacity` for animations
3. **Reduce Paint**: Use `will-change` sparingly on animated elements
4. **Code Split**: Separate mobile and desktop components when significantly different

### Accessibility
1. **Focus States**: Always visible, using ring utilities
2. **Touch Targets**: Minimum 48px × 48px
3. **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
4. **Screen Readers**: Use semantic HTML and ARIA labels

### Mobile UX
1. **Thumb Zone**: Place primary actions in easy reach
2. **Gesture Hints**: Visual indicators for swipeable elements
3. **Loading States**: Always show progress
4. **Error States**: Clear, actionable error messages

## 📱 Implementation Examples

### Responsive Product Grid
```html
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
  <!-- Product cards -->
</div>
```

### Mobile-First Form
```html
<form class="space-y-6 max-w-md mx-auto px-4">
  <div>
    <label class="block text-sm font-medium text-neutral-dark mb-2">
      Email
    </label>
    <input type="email" class="w-full px-4 py-3 border border-neutral-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
  </div>
  <button type="submit" class="w-full py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-hover transition-colors">
    Submit
  </button>
</form>
```

### Adaptive Navigation
```html
<!-- Desktop: Top Nav, Mobile: Bottom Nav -->
<body class="min-h-[100dvh] flex flex-col">
  <!-- Desktop Nav -->
  <nav class="hidden md:block">...</nav>
  
  <!-- Content -->
  <main class="flex-1 pb-16 md:pb-0">...</main>
  
  <!-- Mobile Nav -->
  <nav class="fixed bottom-0 inset-x-0 md:hidden">...</nav>
</body>
```

This comprehensive guide provides everything needed to build the LYS platform with consistent, mobile-first design using Tailwind CSS.