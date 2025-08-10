# Loving Your Skin - Complete Build Plan (Mock-First with Feature Requirements)

## 🎯 Strategy
Build the entire frontend with mock data/services first, then switch to Firebase at the end. Every page will be built by directly referencing its wireframe file AND implementing the feature requirements from `lys-project-plan-features.md`.

## 📚 Key Reference Documents
- **Wireframes**: `/wireframes/*.html` - Visual design reference
- **Features**: `lys-project-plan-features.md` - Business logic & requirements
- **Tree**: `lys-vite-firebase-tree.md` - File structure

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
**Reference**: Feature Requirements - Core Features & Requirements (lines 55-97)

- [ ] **Type Definitions** (`types/index.ts`)
  - [ ] User with role-based access (retailer, admin, brand)
  - [ ] Company with invite codes
  - [ ] Product with multi-language support
  - [ ] Order with 9 status types
  - [ ] Message thread structure

- [ ] **Mock Services** (`services/`)
  - [ ] AuthService 
    - [ ] Invite-only validation (no public registration)
    - [ ] Sales rep auto-linking
  - [ ] ProductService
    - [ ] Multi-language product data
    - [ ] CPNP certification filtering
  - [ ] OrderService
    - [ ] Per-brand order separation
    - [ ] 6-step process tracking
  - [ ] CartService
    - [ ] MOQ validation logic
    - [ ] Per-brand grouping

- [ ] **Zustand Stores** (`stores/`)
  - [ ] AuthStore (user, role, company, salesRep)
  - [ ] CartStore (items grouped by brand, MOQ status)
  - [ ] UIStore (language: EN/KO/ZH, theme, modals)

### Phase 3: Design System Components (Days 3-4)
**Reference**: 
- Wireframe: `wireframes/lys-design-system-page.html`
- Features: Design System Principles (lines 202-212)

- [ ] Extract exact styles from design system wireframe
- [ ] Implement spacing system (8px base)
- [ ] Build components with visual hierarchy rules:
  - [ ] Buttons (48px min height for mobile)
  - [ ] Cards (desktop: 12px radius, mobile: 8px)
  - [ ] Forms (48px height, touch-friendly)
  - [ ] Navigation patterns from features doc

### Phase 4: Layout Components (Day 5)
**Reference**: Features - Responsive Patterns (lines 284-303)

- [ ] **Desktop Layout** (1024px+)
  - [ ] Top navigation (64px height)
  - [ ] Full sidebar (240px) for dashboards

- [ ] **Tablet Layout** (768px-1023px)  
  - [ ] Side rail (64px wide)
  - [ ] 3 column grids

- [ ] **Mobile Layout** (320px-767px)
  - [ ] Bottom navigation (5 icons max)
  - [ ] Full width cards
  - [ ] Bottom sheets instead of modals

### Phase 5: Landing & Public Pages (Day 6)
**Reference**: 
- Wireframe: `wireframes/lys-landing-page.html`
- Features: Page Inventory - Public Pages (lines 100-110)

- [ ] **Landing Page** requirements:
  - [ ] Gated content (products hidden until login)
  - [ ] Contact form with type selection (Retailer/Brand/Other)
  - [ ] 4 key benefits in feature grid

- [ ] **Contact Page** with contextual fields based on selection

### Phase 6: Authentication Pages (Day 7)
**Reference**: 
- Features: Authentication & Access Control (lines 57-61)
- Features: User Journey - Discovery & Onboarding (lines 24-25)

- [ ] **Login Page**
  - [ ] No registration link (invite-only requirement)
  - [ ] Forgot password flow

- [ ] **Invite Accept Page**
  - [ ] Token validation from URL
  - [ ] Auto-link to sales rep on completion
  - [ ] Company association

### Phase 7: Product Discovery (Days 8-10)
**Reference**: 
- Wireframes: `lys-brand-shop.html`, `lys-product-detail.html`
- Features: Product Discovery requirements (lines 63-68)

- [ ] **Brand Directory**
  - [ ] Gated content (login required)
  - [ ] Advanced filtering by CPNP certification

- [ ] **Product Pages**
  - [ ] Multi-language display (EN/KO/ZH)
  - [ ] Carton/item price conversion
  - [ ] MOQ indicators
  - [ ] Certification badges (CPNP UK/EU/CH)

### Phase 8: Shopping Cart & Checkout (Days 11-12)
**Reference**: 
- Wireframes: `lys-shopping-cart.html`, `lys-checkout-flow.html`
- Features: Shopping Cart & MOQ (lines 70-78), Checkout Process (lines 80-86)

- [ ] **Shopping Cart** critical features:
  - [ ] Per-brand grouping (separate orders)
  - [ ] MOQ validation with visual progress bars
  - [ ] Blocking checkout until MOQ met
  - [ ] Clear messaging for requirements
  - [ ] Persistent across sessions

- [ ] **Checkout Flow**:
  - [ ] Multi-step: Confirm → Acknowledge 6-step → Success
  - [ ] Per-brand processing
  - [ ] NO payment collection (invoice later)

### Phase 9: Order Management (Days 13-14)
**Reference**: 
- Features: Order Management (lines 88-91)
- Features: Page Inventory - Orders (lines 156-169)

- [ ] **Order List** with 9 status types:
  - [ ] Pending, Confirmed, Processing, Shipped, etc.
  - [ ] Document management (invoices, shipping)
  - [ ] Timeline visualization

### Phase 10: Messaging System (Day 15)
**Reference**: 
- Wireframe: `wireframes/lys-order-messages.html`
- Features: Messaging System (lines 93-97)

- [ ] **Critical Requirements**:
  - [ ] Email replacement (all comms in-platform)
  - [ ] Thread per order (never mixed)
  - [ ] Participants: Buyer + LYS Team + Brand
  - [ ] Real-time updates
  - [ ] File attachments

### Phase 11: Dashboards (Days 16-18)
**Reference**: 
- Wireframes: `lys-retailer-dashboard.html`, `lys-admin-dashboard.html`
- Features: User Personas & Journeys (lines 13-55)

- [ ] **Retailer Dashboard** (User Journey lines 24-31):
  - [ ] Quick reorder functionality
  - [ ] Order tracking
  - [ ] Message notifications

- [ ] **Admin Dashboard** (Admin Journey lines 40-45):
  - [ ] Morning check urgent items
  - [ ] Retailer invitation system
  - [ ] Order coordination view
  - [ ] Communication hub

### Phase 12: Mobile Optimization (Day 19)
**Reference**: Features - Touch Gestures & Mobile Patterns (lines 348-353)

- [ ] Implement touch gestures:
  - [ ] Swipe left to delete cart items
  - [ ] Pull to refresh lists
  - [ ] Long press for options
  - [ ] Pinch to zoom product images

### Phase 13: Firebase Integration (Days 20-22)
**Reference**: Features - Security Considerations (lines 478-487)

- [ ] Switch services with security in mind:
  - [ ] Role-based permissions
  - [ ] Input validation
  - [ ] File upload restrictions
  - [ ] Session security

### Phase 14: Testing & Deployment (Days 23-24)
**Reference**: Features - Success Metrics (lines 458-476)

- [ ] Ensure metrics targets:
  - [ ] Page load < 2s
  - [ ] Time to first order < 10 min
  - [ ] Mobile usability 100%
  - [ ] Lighthouse score > 90

## 📁 Centralized Architecture with Feature Support

### Types (`src/types/index.ts`)
```typescript
// Based on Feature Requirements
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'retailer' | 'brand';
  companyId: string;
  salesRepId?: string; // Auto-linked from invite
  language: 'en' | 'ko' | 'zh';
}

export interface Product {
  id: string;
  brandId: string;
  name: { en: string; ko: string; zh: string };
  description: { en: string; ko: string; zh: string };
  images: string[];
  price: { 
    item: number; 
    carton: number;
    currency: 'GBP' | 'EUR' | 'CHF';
  };
  moq: number; // Minimum order quantity
  moqUnit: 'items' | 'cartons';
  certifications: ['CPNP_UK', 'CPNP_EU', 'CPNP_CH'];
  inStock: boolean;
}

export interface Order {
  id: string;
  retailerId: string;
  brandId: string; // Orders separated by brand
  status: 'pending' | 'confirmed' | 'processing' | 'invoiced' | 
          'paid' | 'preparing' | 'shipped' | 'delivered' | 'completed';
  items: OrderItem[];
  timeline: OrderEvent[];
  messageThreadId: string; // One thread per order
}
```

### Mock Services with Business Logic
```typescript
// cart.service.ts - MOQ Validation
export const cartService = {
  validateMOQ: (items: CartItem[], brandId: string): MOQStatus => {
    const brandItems = items.filter(i => i.product.brandId === brandId);
    const total = brandItems.reduce((sum, item) => sum + item.quantity, 0);
    const moqRequired = brandItems[0]?.product.moq || 0;
    
    return {
      met: total >= moqRequired,
      current: total,
      required: moqRequired,
      percentage: (total / moqRequired) * 100
    };
  }
};

// auth.service.ts - Invite-Only System
export const authService = {
  validateInviteCode: async (code: string) => {
    // Check if code exists and hasn't been used
    const invite = mockInvites.find(i => i.code === code && !i.used);
    if (!invite) throw new Error('Invalid or expired invite code');
    
    return {
      companyId: invite.companyId,
      salesRepId: invite.salesRepId,
      role: invite.role
    };
  }
};
```

## 🎨 Feature-Driven Development Process

For each component/page:
1. **Open the wireframe** for visual design
2. **Read the feature requirements** for business logic
3. **Check user journeys** to understand context
4. **Implement both** visual and functional requirements
5. **Test against success metrics**

## ⚡ Critical Feature Checklist

Must work perfectly:
- [ ] Invite-only system (no public registration)
- [ ] MOQ validation blocking checkout
- [ ] Per-brand order separation  
- [ ] Message threads never mix orders
- [ ] Multi-language from day 1
- [ ] No payment processing

## 📝 Daily Workflow

1. Check feature requirements for the component
2. Open wireframe for visual reference
3. Build with mock data following business rules
4. Test critical features work correctly
5. Verify responsive behavior
6. Update checklist and commit

This ensures we build not just a pretty UI, but a fully functional B2B marketplace with all business requirements implemented correctly.