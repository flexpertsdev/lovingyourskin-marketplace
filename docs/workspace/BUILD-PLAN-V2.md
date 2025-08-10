# Loving Your Skin - Revised Build Plan (Mock-First Approach)

## 🎯 Strategy
Build the entire frontend with mock data/services first, then switch to Firebase at the end. Every page will be built by directly referencing its wireframe file.

## 🏗️ Build Phases

### Phase 1: Foundation & Architecture (Day 1)
- [ ] Run setup.sh to initialize project
- [ ] Set up Git repository
- [ ] Create centralized architecture:
  ```
  src/
  ├── types/          # All TypeScript interfaces
  ├── services/       # Mock services (auth, products, orders)
  ├── stores/         # Zustand stores
  ├── queries/        # React Query hooks
  ├── theme/          # Design system constants
  └── mock-data/      # Mock JSON data
  ```

### Phase 2: Core Infrastructure (Day 2)
- [ ] **Type Definitions** (`types/index.ts`)
  - [ ] User, Company, Product, Order, Message types
  - [ ] Auth states, Cart items, etc.

- [ ] **Mock Services** (`services/`)
  - [ ] AuthService (login, logout, checkInvite)
  - [ ] ProductService (getProducts, getByBrand)
  - [ ] OrderService (createOrder, getOrders)
  - [ ] MessageService (getThreads, sendMessage)

- [ ] **Zustand Stores** (`stores/`)
  - [ ] AuthStore (user, role, company)
  - [ ] CartStore (items, MOQ validation)
  - [ ] UIStore (language, theme, modals)

- [ ] **Theme Setup** (`theme/`)
  - [ ] Colors, spacing, typography from wireframes
  - [ ] Breakpoints and responsive helpers

### Phase 3: Design System Components (Days 3-4)
**Reference**: `wireframes/lys-design-system-page.html`

- [ ] Extract exact styles from design system wireframe
- [ ] Build base components matching the wireframe exactly:
  - [ ] Buttons (primary/secondary with exact colors)
  - [ ] Cards (with proper shadows and borders)
  - [ ] Inputs (with floating labels as shown)
  - [ ] Navigation (desktop top, mobile bottom)
  - [ ] Modals and bottom sheets

### Phase 4: Layout Components (Day 5)
Study navigation patterns from all wireframes:

- [ ] **Desktop Layout**
  - [ ] Top navigation bar (64px height)
  - [ ] Language selector
  - [ ] User menu

- [ ] **Mobile Layout**  
  - [ ] Bottom navigation (5 icons)
  - [ ] Touch-friendly spacing

- [ ] **Page Containers**
  - [ ] Consistent padding/margins
  - [ ] Max-width constraints

### Phase 5: Landing & Public Pages (Day 6)
**Reference**: `wireframes/lys-landing-page.html`

- [ ] Open wireframe file and match exactly:
  - [ ] Hero section with gradient
  - [ ] Feature grid layout
  - [ ] Contact form styling
  - [ ] Responsive behavior

**Reference**: `wireframes/lys-how-it-works.html`
- [ ] Process timeline component
- [ ] Step cards

**Reference**: `wireframes/lys-for-retailers.html` & `lys-for-brands.html`
- [ ] Marketing sections
- [ ] Call-to-action blocks

### Phase 6: Authentication Pages (Day 7)
Build login/register by studying auth sections in wireframes:

- [ ] **Login Page**
  - [ ] Simple form as shown
  - [ ] Mock authentication

- [ ] **Invite Accept Page**
  - [ ] Token validation UI
  - [ ] Registration form
  - [ ] Company association

### Phase 7: Product Discovery (Days 8-10)
**Reference**: `wireframes/lys-brand-shop.html`

- [ ] **Brand Directory**
  - [ ] Grid layout from wireframe
  - [ ] Filter sidebar
  - [ ] Search bar positioning

**Reference**: `wireframes/brand-showcase-enhanced.html`
- [ ] Brand hero sections
- [ ] Statistics display
- [ ] Feature tags

**Reference specific brand pages**:
- [ ] `lalucell-brand-showcase.html`
- [ ] `sunnicorn-brand-showcase.html`
- [ ] `wismin-brand-showcase.html`

**Reference**: `wireframes/lys-product-detail.html`
- [ ] Image gallery layout
- [ ] Pricing card design
- [ ] MOQ indicators
- [ ] Add to cart button

### Phase 8: Shopping Cart & Checkout (Days 11-12)
**Reference**: `wireframes/lys-shopping-cart.html`

- [ ] Match exact layout:
  - [ ] Grouped by brand sections
  - [ ] MOQ progress bars
  - [ ] Price calculations
  - [ ] Mobile responsive design

**Reference**: `wireframes/lys-checkout-flow.html`
- [ ] Multi-step indicator
- [ ] Form layouts
- [ ] Confirmation screens

### Phase 9: Order Management (Days 13-14)
Study order layouts in admin/retailer dashboards:

- [ ] **Order List**
  - [ ] Table/card layouts
  - [ ] Status badges
  - [ ] Filters

- [ ] **Order Detail**
  - [ ] Timeline component
  - [ ] Document section
  - [ ] Action buttons

### Phase 10: Messaging System (Day 15)
**Reference**: `wireframes/lys-order-messages.html`

- [ ] Match chat interface exactly:
  - [ ] Message bubbles
  - [ ] Participant list
  - [ ] Attachment UI
  - [ ] Input area

### Phase 11: Dashboards (Days 16-18)
**Reference**: `wireframes/lys-retailer-dashboard.html`
- [ ] Metric cards layout
- [ ] Quick actions
- [ ] Recent orders

**Reference**: `wireframes/lys-admin-dashboard.html`
- [ ] Admin-specific metrics
- [ ] User management tables
- [ ] Activity feeds

### Phase 12: Mobile Optimization (Day 19)
- [ ] Test every wireframe on mobile viewport
- [ ] Implement bottom sheets where modals exist
- [ ] Touch target optimization
- [ ] Swipe gestures for applicable components

### Phase 13: Firebase Integration (Days 20-22)
Now switch from mock to real:

- [ ] **Update Services**
  ```typescript
  // Before: services/auth.mock.ts
  export const loginUser = async (email, password) => {
    return mockUsers.find(u => u.email === email);
  }
  
  // After: services/auth.firebase.ts
  export const loginUser = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  }
  ```

- [ ] **Replace Mock Data**
  - [ ] Products from Firestore
  - [ ] Orders to Firestore
  - [ ] Real-time messages
  - [ ] File uploads to Storage

- [ ] **Security Rules**
  - [ ] Firestore rules
  - [ ] Storage rules
  - [ ] Cloud Functions

### Phase 14: Testing & Deployment (Days 23-24)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Deploy to Netlify
- [ ] Configure domain

## 📁 Centralized Architecture

### Types (`src/types/index.ts`)
```typescript
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'retailer' | 'brand';
  companyId: string;
  salesRepId?: string;
}

export interface Product {
  id: string;
  brandId: string;
  name: { en: string; ko: string; zh: string };
  images: string[];
  price: { item: number; carton: number };
  moq: number;
  certifications: string[];
}
// ... more types
```

### Mock Services (`src/services/`)
```typescript
// auth.service.ts
export const authService = {
  login: async (email: string, password: string) => {
    // Return mock user
  },
  validateInvite: async (code: string) => {
    // Return mock invite data
  }
};
```

### Stores (`src/stores/`)
```typescript
// auth.store.ts
export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));
```

### Theme (`src/theme/`)
```typescript
export const colors = {
  primary: '#D4A5A5',     // rose-gold
  primaryDark: '#C48B8B', // rose-gold-dark
  background: '#FDF8F6',  // soft-pink
  // ... from wireframes
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};
```

## 🎨 Wireframe Reference Process

For each page/component:
1. Open the specific wireframe HTML file
2. Use browser DevTools to inspect exact:
   - Colors (use color picker)
   - Spacing (measure with DevTools)
   - Font sizes
   - Border radius
   - Shadows
3. Copy the structure exactly
4. Make responsive based on wireframe's media queries

## ⚡ Benefits of This Approach

1. **Faster Development**: No Firebase setup delays
2. **Easier Testing**: Control all data
3. **Better Architecture**: Clean separation of concerns
4. **Simple Migration**: Just swap service implementations
5. **Faithful Design**: Direct wireframe reference ensures accuracy

## 📝 Daily Workflow

1. Open the day's wireframe files
2. Build components to match exactly
3. Use mock data from `mock-data/`
4. Test on both desktop and mobile
5. Check off completed items
6. Commit with descriptive messages

This approach ensures the final product matches the wireframes perfectly while maintaining clean, swappable architecture.