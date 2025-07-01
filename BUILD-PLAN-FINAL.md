# Loving Your Skin - Final Build Plan

## 🎯 Strategy
Build with mock services first, then switch to Firebase. Extract design system from wireframe code and implement features from requirements doc.

## 📚 Reference Documents
- **Wireframes**: `/wireframes/*.html` - Extract exact CSS/HTML structure
- **Design System**: `/wireframes/lys-design-system-page.html` & `lys-design-system-tailwind.md`
- **Features**: `lys-project-plan-features.md` - Business logic & requirements

## 🏗️ Build Phases

### Phase 1: Project Setup & Design System Extraction (Day 1)
- [ ] Run setup.sh to initialize project
- [ ] Extract design system from wireframes:
  - [ ] Open `lys-design-system-page.html` and extract all CSS variables
  - [ ] Convert CSS to Tailwind config using `lys-design-system-tailwind.md` as guide
  - [ ] Create `theme/` folder with:
    - [ ] `colors.ts` - Color constants from CSS variables
    - [ ] `spacing.ts` - 8px base spacing system
    - [ ] `typography.ts` - Font sizes and weights
    - [ ] `breakpoints.ts` - Responsive breakpoints
    - [ ] `components.ts` - Reusable style objects

### Phase 2: Core Architecture (Day 2)
**Reference**: Features doc lines 55-97 for requirements

- [ ] **Type System** (`types/`)
  ```typescript
  // Extract from feature requirements
  export interface User {
    id: string;
    email: string;
    role: 'admin' | 'retailer' | 'brand';
    companyId: string;
    salesRepId?: string; // Auto-linked from invite
    language: 'en' | 'ko' | 'zh';
  }
  ```

- [ ] **Mock Services** (`services/mock/`)
  - [ ] Create services matching feature requirements:
    - [ ] Invite-only validation
    - [ ] MOQ calculations
    - [ ] Per-brand order grouping
    - [ ] Message threading

- [ ] **Zustand Stores** (`stores/`)
  - [ ] AuthStore, CartStore, UIStore with persistence

### Phase 3: Base Components from Design System (Days 3-4)
**Extract exact styles from**: `lys-design-system-page.html`

- [ ] **Analyze design system HTML**:
  ```bash
  # Extract all component styles:
  # - .cta-button styles → Button component
  # - .form-input styles → Input component
  # - .card styles → Card component
  # - Navigation patterns → Nav components
  ```

- [ ] **Build components with extracted styles**:
  - [ ] Button (primary/secondary from lines 202-239)
  - [ ] Input (form elements from lines 254-269)
  - [ ] Card (container styles from lines 108-114)
  - [ ] Badge (status indicators from lines 272-294)

### Phase 4: Layout Components (Day 5)
**Study ALL wireframes for common patterns**:

- [ ] Extract navigation from multiple wireframes:
  - [ ] Desktop: Top nav (64px height, white bg)
  - [ ] Mobile: Bottom nav (5 icons, fixed position)
  
- [ ] Extract page containers:
  - [ ] Max-width wrappers
  - [ ] Padding patterns
  - [ ] Grid layouts

### Phase 5: Landing Page (Day 6)
**Open**: `wireframes/lys-landing-page.html`

- [ ] Copy exact HTML structure
- [ ] Extract inline styles to Tailwind classes
- [ ] Implement features from requirements:
  - [ ] Gated content (products hidden)
  - [ ] Contact form with type selection
  - [ ] 4 key benefits grid

### Phase 6: Authentication Pages (Day 7)
**Extract from**: Login sections in wireframes
**Features**: Lines 57-61, invite-only system

- [ ] Login page (no registration link)
- [ ] Invite accept page with:
  - [ ] Token validation
  - [ ] Sales rep auto-linking
  - [ ] Company association

### Phase 7: Product Discovery (Days 8-10)
**Important**: Brand showcase pages contain real mock data!
- [ ] Extract data from:
  - [ ] `wismin-brand-showcase.html` - WISMIN products & info
  - [ ] `lalucell-brand-showcase.html` - LALUCELL products & info  
  - [ ] `sunnicorn-brand-showcase.html` - SUNNICORN products & info
  - [ ] Use this data to create `mock-data/brands.json` and `mock-data/products.json`

**Build generic components**:
- [ ] `brand-showcase-enhanced.html` → Generic brand showcase template
- [ ] Create `BrandShowcase.tsx` component that accepts brand data
- [ ] `lys-brand-shop.html` → Brand directory layout
- [ ] `lys-product-detail.html` → Product page structure

**Implement features**:
- [ ] Multi-language display (EN/KO/ZH from mock data)
- [ ] CPNP certification badges
- [ ] MOQ indicators  
- [ ] Price conversions (item/carton from mock data)

### Phase 8: Shopping Cart & Checkout (Days 11-12)
**Open**: `wireframes/lys-shopping-cart.html`

- [ ] Extract exact cart layout:
  - [ ] Brand grouping sections
  - [ ] MOQ progress bars
  - [ ] Price calculations

**Open**: `wireframes/lys-checkout-flow.html`
- [ ] Multi-step indicator
- [ ] Form layouts
- [ ] Process acknowledgment

**Critical features** (lines 70-86):
- [ ] Block checkout until MOQ met
- [ ] Per-brand order separation
- [ ] No payment collection

### Phase 9: Order Management (Days 13-14)
**Extract from**: Dashboard wireframes

- [ ] Order list with 9 statuses
- [ ] Timeline visualization
- [ ] Document management

### Phase 10: Messaging (Day 15)
**Open**: `wireframes/lys-order-messages.html`

- [ ] Copy exact chat interface
- [ ] Implement features (lines 93-97):
  - [ ] Thread per order
  - [ ] Real-time updates
  - [ ] File attachments

### Phase 11: Dashboards (Days 16-18)
**Open files**:
- [ ] `lys-retailer-dashboard.html` → Retailer metrics
- [ ] `lys-admin-dashboard.html` → Admin controls

**Implement journeys** (lines 24-45):
- [ ] Morning check widgets
- [ ] Quick actions
- [ ] Activity feeds

### Phase 12: Mobile Optimization (Day 19)
**Reference**: Tailwind guide for patterns

- [ ] Test every page at 320px width
- [ ] Implement touch gestures
- [ ] Bottom sheets for modals
- [ ] Safe area handling

### Phase 13: Firebase Switch (Days 20-22)
- [ ] Replace mock services:
  ```typescript
  // From: services/mock/auth.service.ts
  export const loginUser = async (email, password) => {
    return mockUsers.find(u => u.email === email);
  }
  
  // To: services/firebase/auth.service.ts
  export const loginUser = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  }
  ```

### Phase 14: Deploy (Days 23-24)
- [ ] Test all features
- [ ] Performance optimization
- [ ] Deploy to Netlify

## 🛠️ Centralized Design System

### Extract from wireframes/lys-design-system-page.html:
```typescript
// theme/index.ts
export const theme = {
  colors: {
    primary: {
      DEFAULT: '#D4A5A5', // --rose-gold
      dark: '#C48B8B',    // --rose-gold-dark
      light: '#FDF8F6',   // --soft-pink
    },
    neutral: {
      white: '#FFFFFF',
      charcoal: '#1A1A1A',
      dark: '#2D2D2D',
      // ... extract all from CSS variables
    }
  },
  spacing: {
    // 8px base from wireframes
    0.5: '4px',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    6: '48px',
    8: '64px',
  },
  typography: {
    // Extract from lines 87-106
    h1: { size: '48px', weight: '300' },
    h2: { size: '36px', weight: '400' },
    h3: { size: '24px', weight: '500' },
    body: { size: '16px', weight: '400' },
  }
}
```

## 📋 Daily Process

1. **Open the wireframe HTML file** for the component/page
2. **Copy the HTML structure** exactly
3. **Extract inline styles** to our theme system
4. **Check feature requirements** for business logic
5. **Implement with mock data**
6. **Test responsive behavior**

## ✅ Success Criteria

- Visual fidelity matches wireframes exactly
- All feature requirements implemented
- Mobile-first and responsive
- Clean architecture for easy Firebase switch
- Performance targets met (< 2s load time)

This plan ensures we build exactly what's in the wireframes while maintaining clean, swappable architecture.