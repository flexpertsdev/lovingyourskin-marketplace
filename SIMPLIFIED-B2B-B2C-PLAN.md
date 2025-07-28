# Simplified B2B/B2C Implementation Plan

## Overview
Keep the existing site structure while adding subtle entry points for retail customers.

## Implementation Approach

### 1. ✅ Landing Page Update
- Added a simple banner under hero section: "Looking for our retail boutique? →"
- Links directly to `/shop` which is already set up for retail
- Minimal change, maintains B2B focus

### 2. ✅ Shop Page Enhancement
- Added brand collection cards at the top
- Each brand links to `/boutique/collection/{brandId}`
- Maintains existing shop functionality
- Clear retail-focused messaging

### 3. ✅ Boutique Collection Page (New)
- Created `BoutiqueCollection.tsx` for public brand pages
- Shows retail prices only
- Consumer-friendly design
- Shopping cart integration
- Clean navigation back to main shop

### 4. Routes to Add
```typescript
// In App.tsx
import { BoutiqueCollection } from './pages/BoutiqueCollection'

// Add these routes
<Route path="/boutique/collection/:brandId" element={<BoutiqueCollection />} />
```

### 5. Benefits of This Approach
- **Minimal disruption** to existing B2B site
- **Quick to implement** - mostly reusing existing components
- **Clear separation** - B2B remains primary, B2C is secondary
- **Scalable** - Easy to expand boutique features later
- **SEO friendly** - Public product pages for retail

### 6. Future Enhancements (Optional)
- Add consumer reviews/ratings
- Implement wishlist functionality
- Create bundle/gift set options
- Add Instagram feed integration
- Implement loyalty program

### 7. Shipping Implementation
For Wismin products (when applicable):
```typescript
// In checkout or cart
const calculateShipping = (items) => {
  const wisminItems = items.filter(item => item.brandId === 'wismin')
  const wisminShipping = wisminItems.length * 1.30
  const otherItemsHaveFreeShipping = true
  
  return {
    shipping: wisminShipping,
    note: wisminShipping > 0 
      ? `Includes £${wisminShipping.toFixed(2)} shipping for Wismin products`
      : 'Free shipping on all items'
  }
}
```

## Current Status
- ✅ Landing page banner added
- ✅ Shop page enhanced with brand collections
- ✅ BoutiqueCollection page created
- ⏳ Need to add routes in App.tsx
- ⏳ Test the flow

## Next Steps
1. Add the routes to App.tsx
2. Test the complete flow
3. Consider adding a simple navigation header for boutique pages
4. Add shipping calculator to checkout
