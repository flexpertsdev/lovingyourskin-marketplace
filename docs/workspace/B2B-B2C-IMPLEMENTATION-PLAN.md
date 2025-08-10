# Unified B2B/B2C Implementation Plan

## Overview
Create a single web application that elegantly serves both B2B (wholesale) and B2C (boutique) customers while maintaining clear separation of concerns and user experiences.

## Design Approach

### 1. Entry Point Strategy
- **Welcome Page** (`/welcome` or update Landing)
  - Split-screen design with hover effects
  - Clear value propositions for each audience
  - Visual distinction using icons and benefits
  - Maintains current rose-gold design system

### 2. Route Architecture

#### Current Routes (Need Reorganization)
```
/login              → Business login
/register           → Business registration  
/shop               → Ambiguous (both B2B and B2C)
/consumer-login     → Consumer login
/consumer-cart      → Consumer cart
/preorder           → Consumer pre-orders
```

#### Proposed Route Structure
```
/                   → Welcome page (entry point)
/welcome            → Alternative entry point

/business/*         → All B2B routes
  /business/login
  /business/register
  /business/shop
  /business/brands
  /business/orders
  /business/dashboard

/boutique/*         → All B2C routes  
  /boutique/shop
  /boutique/product/:id
  /boutique/cart
  /boutique/checkout
  /boutique/login     (optional)
  /boutique/preorder
```

### 3. Navigation Strategy

#### Business Navigation
- Show wholesale pricing
- Minimum order quantities
- Bulk discounts
- Brand catalogs
- Order management
- Invite-only features

#### Boutique Navigation
- Retail pricing
- Individual items
- Pre-order section
- Guest checkout
- Consumer-friendly descriptions
- Shipping calculator (Wismin: $1.30/item)

### 4. Data Model Updates

```typescript
interface Product {
  // Existing fields...
  
  // B2B Fields
  wholesalePrice: PriceStructure
  moq: number
  bulkDiscounts: BulkDiscount[]
  
  // B2C Fields  
  retailPrice: number
  retailDescription?: string
  retailInventory: number
  isRetailEnabled: boolean
  isPreOrderEnabled: boolean
  preOrderPrice?: number
  
  // Shared
  shippingInfo: {
    isFreeShipping: boolean
    shippingCost?: number
    shippingNote?: string
  }
}
```

### 5. Component Architecture

#### Shared Components
- ProductCard (with variant prop)
- Navigation (context-aware)
- Footer
- Cart (different implementations)

#### Business-Specific
- WholesalePricing
- BulkOrderForm
- InviteCodeValidator
- B2BCheckout

#### Boutique-Specific
- RetailProductDisplay
- ConsumerCart
- PreOrderBanner
- GuestCheckout

### 6. Implementation Steps

#### Phase 1: Foundation (Week 1)
1. ✅ Create Welcome.tsx page
2. [ ] Update App.tsx routes
3. [ ] Create route guards/redirects
4. [ ] Update navigation components

#### Phase 2: Boutique Experience (Week 2)
1. [ ] Move consumer pages to /boutique/*
2. [ ] Update Shop page for retail
3. [ ] Implement shipping calculator
4. [ ] Add pre-order section
5. [ ] Guest checkout flow

#### Phase 3: Business Portal (Week 3)
1. [ ] Move business pages to /business/*
2. [ ] Update wholesale shop experience
3. [ ] Implement MOQ validation
4. [ ] Bulk order features

#### Phase 4: Data & Integration (Week 4)
1. [ ] Update Firebase schema
2. [ ] Migrate existing data
3. [ ] Implement dual inventory tracking
4. [ ] Testing & refinement

### 7. Key Features by User Type

#### Boutique (B2C)
- **Products**: Curated selection with retail pricing
- **Cart**: Simple, guest-friendly
- **Checkout**: Stripe integration, shipping calculator
- **Account**: Optional, for order tracking
- **Special**: Pre-order access, member benefits

#### Business (B2B)
- **Products**: Full catalog with wholesale pricing
- **Cart**: MOQ validation, bulk discounts
- **Checkout**: Invoice options, NET terms
- **Account**: Required, invite-only
- **Special**: Exclusive products, brand partnerships

### 8. Technical Considerations

#### Authentication
```typescript
// Separate auth contexts
const BusinessAuthContext = createContext()
const ConsumerAuthContext = createContext()

// Or unified with role checking
const useAuth = () => {
  const { user } = useAuthContext()
  return {
    isBusinessUser: user?.role === 'retailer',
    isConsumer: user?.role === 'consumer',
    // ...
  }
}
```

#### Cart Management
```typescript
// Separate stores
useBusinessCartStore()  // MOQ, bulk pricing
useConsumerCartStore()  // Simple cart

// Or unified with logic
useCartStore({
  mode: 'business' | 'consumer'
})
```

### 9. Migration Strategy

1. **Keep existing functionality** intact
2. **Add new routes** alongside old ones
3. **Gradually redirect** old routes
4. **Test thoroughly** before removing old code

### 10. Quick Wins (Implement Now)

1. **Welcome Page** - Already created
2. **Route Guards** - Simple redirects
3. **Shipping Info** - Add to product cards
4. **Pre-order Badge** - Visual indicator

### Next Steps

1. **Immediate**: 
   - Add Welcome page to routes
   - Create route structure
   - Add navigation logic

2. **This Week**:
   - Move consumer pages
   - Update product displays
   - Add shipping calculator

3. **Next Week**:
   - Refine business portal
   - Test dual experiences
   - Deploy to staging

## Benefits of This Approach

1. **Clear Separation**: No confusion about pricing/features
2. **Scalable**: Easy to add features per user type
3. **Maintainable**: Shared components, clear structure
4. **User-Friendly**: Tailored experiences
5. **Business Value**: Can serve both markets effectively
