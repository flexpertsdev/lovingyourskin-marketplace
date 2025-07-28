# Consumer Routes Configuration

Add these routes to your App.tsx file:

```typescript
import { ConsumerShop } from './pages/ConsumerShop'
import { ConsumerBrands } from './pages/ConsumerBrands'
import { ConsumerPreorders } from './pages/ConsumerPreorders'
import { BoutiqueCollection } from './pages/BoutiqueCollection'
import { ConsumerLogin } from './pages/ConsumerLogin'
import { ConsumerCart } from './pages/ConsumerCart'
import { ConsumerProductDetail } from './pages/ConsumerProductDetail'

// Consumer Routes
<Route path="/consumer/shop" element={<ConsumerShop />} />
<Route path="/consumer/brands" element={<ConsumerBrands />} />
<Route path="/consumer/brands/:brandId" element={<BoutiqueCollection />} />
<Route path="/consumer/preorders" element={<ConsumerPreorders />} />
<Route path="/consumer/products/:productId" element={<ConsumerProductDetail />} />
<Route path="/consumer/cart" element={<ConsumerCart />} />
<Route path="/consumer/login" element={<ConsumerLogin />} />
<Route path="/consumer/orders" element={<ConsumerOrders />} />
<Route path="/consumer/profile" element={<ConsumerProfile />} />

// Redirect old routes to new consumer routes (optional)
<Route path="/shop" element={<Navigate to="/consumer/shop" replace />} />
<Route path="/consumer-login" element={<Navigate to="/consumer/login" replace />} />
<Route path="/consumer-cart" element={<Navigate to="/consumer/cart" replace />} />
```

## Features Implemented:

### 1. **ConsumerShop** (/consumer/shop)
- Mobile-first responsive design
- Brand carousel (slides on mobile, shows multiple on desktop)
- Product grid with filters
- Search functionality
- Sort options
- Wishlist hearts
- Quick add to cart
- Responsive navigation with user menu

### 2. **ConsumerBrands** (/consumer/brands)
- Beautiful brand cards with images
- Search functionality
- Mobile-optimized grid (1 column mobile, 3 columns desktop)
- Brand features/tags
- Product count per brand
- Links to individual brand collections

### 3. **ConsumerPreorders** (/consumer/preorders)
- Countdown timer for pre-order campaigns
- Benefits section
- Pre-order product cards with:
  - Discount badges
  - Expected delivery dates
  - Special pre-order pricing
- FAQ section
- Mobile-optimized layout

### 4. **Shared Components**
- **ConsumerNav**: Consistent navigation across all consumer pages
  - Logo linking to shop
  - Center nav: Shop, Brands, Pre-orders
  - Cart with item count
  - User account dropdown (when logged in)
  - Login/Sign up buttons (when logged out)

## Mobile-First Design Approach:

1. **Typography**: Smaller on mobile, larger on desktop
2. **Spacing**: Tighter padding on mobile, more generous on desktop
3. **Grid Layouts**: Single column on mobile, multi-column on desktop
4. **Navigation**: Simplified on mobile, full navigation on desktop
5. **Images**: Optimized sizes for different screen sizes
6. **Touch Targets**: Large enough for mobile interaction (min 44px)

## Consistent Design System:
- Rose gold (#D4A5A5) for primary actions
- Soft pink (#FDF8F6) for backgrounds
- Deep charcoal (#1A1A1A) for headings
- Light, elegant typography
- Smooth hover transitions
- Card-based layouts
- Consistent spacing and shadows
