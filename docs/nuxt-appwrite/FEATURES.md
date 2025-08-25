# FEATURES.md - Detailed Feature Specifications

## 🛍 Core Commerce Features

### 1. Dual Marketplace System
**Description**: Simultaneous B2B wholesale and B2C retail operations

#### B2B Wholesale Marketplace
- **Invite-only registration** with code validation
- **Company association** during signup
- **MOQ enforcement** per brand (e.g., minimum £500 per brand)
- **Wholesale pricing** with tiered discounts
- **Invoice-based payment** with NET 30/60 terms
- **Bulk ordering** by carton/case units
- **Sales rep assignment** from invite codes

**Pages**: `/brands`, `/products`, `/cart`, `/checkout`
**Database**: `users.role='retailer'`, `companies.type='retailer'`, `orders.orderType='b2b'`
**Journey**: Retailer Registration → Browse → MOQ Cart → Invoice Checkout

#### B2C Consumer Shop
- **Open registration** without invite codes
- **Individual pricing** at retail rates
- **Immediate payment** via Stripe Checkout
- **Single unit purchasing**
- **Guest checkout** option
- **Express checkout** with saved cards

**Pages**: `/shop`, `/shop/products`, `/shop/cart`, `/shop/checkout`
**Database**: `users.role='consumer'`, `orders.orderType='b2c'`
**Journey**: Browse Shop → Add to Cart → Express Checkout → Order Confirmation

---

### 2. Registration & Authentication System
**Description**: Role-based access with invite validation

#### Invite Code System
- **Single-use codes** for specific emails
- **Multi-use codes** for sales reps
- **Role assignment** (retailer/brand/affiliate)
- **Company pre-assignment**
- **Expiration dates**
- **Usage tracking**

```typescript
// Invite validation flow
validateInviteCode(code) → checkExpiry() → checkUsage() → assignRole()
```

**Pages**: `/register`, `/admin/users`
**Database**: `invite_codes`, `users`
**Services**: Appwrite Auth, Custom Functions

#### Multi-Role Authentication
- **Five user roles**: Admin, Retailer, Brand, Consumer, Affiliate
- **Role-based routing** and UI adaptation
- **Permission matrix** for features
- **Session management** with refresh tokens

**Database**: `users.role`, Appwrite Auth
**State**: `authState.user.role`

---

### 3. Product Management System
**Description**: Comprehensive catalog with variants and multilingual support

#### Product Variants
- **Multiple attributes**: Size, color, type
- **Separate inventory** for B2B/B2C
- **Variant-specific pricing**
- **Default variant** selection
- **Image galleries** per variant

```typescript
Product → Variants[] → {
  inventory: { b2b: Stock, b2c: Stock }
  pricing: { wholesale: Price, retail: Price }
}
```

**Pages**: `/products/:id`, `/admin/products`
**Database**: `products`, `products.variants[]`

#### Multi-Language Support
- **Three languages**: English, Korean, Chinese
- **Translated fields**: name, description, ingredients, usage
- **Language switcher** in header
- **Persistent preference** in user profile
- **SEO optimization** per language

**Database**: `products.name.{en|ko|zh}`, `users.language`
**State**: `uiState.language`

---

### 4. MOQ (Minimum Order Quantity) System
**Description**: Brand-specific minimum order enforcement for B2B

#### MOQ Validation
- **Per-brand minimums** (e.g., £500 per brand)
- **Real-time validation** in cart
- **Visual progress indicators**
- **Warning messages** when below MOQ
- **Checkout blocking** until MOQ met

```typescript
MOQStatus = {
  brandId: string
  required: number  // £500
  current: number   // £350
  percentage: 70    // Progress
  met: false        // Can't checkout
}
```

**Pages**: `/cart` (B2B only)
**Database**: `companies.minimumOrder`, `carts.moqStatus`
**Components**: `<MOQProgress />`, `<MOQWarning />`

#### MOQ Strategies
- **Suggested products** to meet MOQ
- **Bundle recommendations**
- **Quick-add bestsellers**
- **Save cart** for later completion

---

### 5. Pre-Order Campaign System
**Description**: Early access sales with discounts

#### Campaign Management
- **Campaign creation** with product selection
- **Discount configuration** (10-30% off)
- **Time-limited** availability
- **Quantity limits** per customer
- **Estimated ship dates**

**Pages**: `/shop/preorders`, `/admin/preorders/manage`
**Database**: `preorder_campaigns`, `products.isPreorder`

#### Pre-Order Cart
- **Separate cart** from regular items
- **Discount application** automatic
- **Campaign validation** on checkout
- **Payment upfront** with delayed fulfillment

**Components**: `<PreorderBadge />`, `<PreorderCountdown />`
**Journey**: View Campaign → Add to Preorder Cart → Checkout → Wait for Shipping

---

### 6. Affiliate Program
**Description**: Commission-based referral system

#### Affiliate Codes
- **Public discount codes** (e.g., "SAVE20")
- **Dual benefit**: Customer discount + Affiliate commission
- **Performance tracking** per code
- **Tiered commissions** based on performance

```typescript
AffiliateCode = {
  code: "JANE20"
  discountPercent: 20  // Customer saves 20%
  commissionPercent: 10 // Affiliate earns 10%
}
```

**Pages**: `/affiliate/dashboard`, `/admin/affiliates`
**Database**: `affiliate_codes`, `orders.affiliate`

#### Commission Management
- **Automatic calculation** on order completion
- **Monthly payouts** via Stripe Connect
- **Performance dashboard** with analytics
- **Tier progression** (Bronze → Silver → Gold)

**Services**: Stripe Connect for payouts
**Reports**: Sales, commissions, conversion rates

---

### 7. Order Management System
**Description**: Comprehensive order lifecycle with 9-status workflow

#### Order Statuses
1. **Pending** - Order placed, awaiting confirmation
2. **Confirmed** - Order confirmed by admin/system
3. **Processing** - Payment being processed
4. **Invoiced** - Invoice sent (B2B only)
5. **Paid** - Payment received
6. **Preparing** - Order being prepared
7. **Shipped** - Order dispatched
8. **Delivered** - Order delivered
9. **Completed** - After return period

**Pages**: `/orders`, `/orders/:id`, `/admin/orders`
**Database**: `orders.status`, `orders.timeline[]`

#### Order Features
- **Timeline tracking** with status history
- **Document management** (invoices, labels)
- **Partial fulfillment** support
- **Return/refund** processing
- **Order messaging** system

---

### 8. Messaging System
**Description**: Order-specific communication threads

#### Thread Management
- **One thread per order** (never mixed)
- **Multi-participant** (buyer, seller, admin)
- **File attachments** support
- **Read receipts** tracking
- **Email notifications** for new messages

```typescript
MessageThread = {
  orderId: string  // One-to-one with order
  participants: [buyer, lysTeam, brand]
  unreadCounts: { userId: count }
}
```

**Pages**: `/messages`, `/orders/:id/messages`
**Database**: `messages`, `orders.messageThreadId`
**Realtime**: Appwrite Realtime for instant updates

---

### 9. Payment Processing
**Description**: Dual payment systems for B2B and B2C

#### B2C Payment (Immediate)
- **Stripe Checkout** sessions
- **Card payments** (Visa, Mastercard, Amex)
- **Digital wallets** (Apple Pay, Google Pay)
- **3D Secure** authentication
- **Automatic receipts**

**Service**: Stripe Checkout API
**Flow**: Cart → Checkout → Stripe → Success

#### B2B Payment (Invoice)
- **Generated invoices** with payment terms
- **NET 30/60** payment terms
- **Bank transfer** option
- **Stripe Invoices** for automation
- **Payment reminders**

**Service**: Stripe Invoicing API
**Flow**: Cart → Checkout → Invoice → Payment Terms → Collection

---

### 10. Multi-Currency Support
**Description**: Multiple currency display and conversion

#### Supported Currencies
- **GBP** (£) - Default
- **EUR** (€) - European markets
- **CHF** (Fr.) - Swiss market
- **USD** ($) - Future expansion

#### Currency Features
- **Automatic detection** by IP location
- **Manual selection** in header
- **Persistent preference** per user
- **Real-time conversion** rates
- **Localized formatting**

**Components**: `<CurrencySelector />`, `<PriceDisplay />`
**State**: `uiState.currency`

---

### 11. Inventory Management
**Description**: Dual inventory tracking for B2B/B2C

#### Inventory Segregation
```typescript
Inventory = {
  b2b: {
    stock: 1000,      // Total units
    available: 800,   // Available for sale
    reserved: 200     // In carts/orders
  },
  b2c: {
    stock: 500,
    available: 450,
    reserved: 50
  }
}
```

#### Stock Features
- **Real-time updates** on purchase
- **Low stock alerts** at 20% threshold
- **Out-of-stock** handling
- **Reserved stock** in carts (15 min)
- **Automatic release** on cart expiry

**Database**: `products.variants[].inventory`
**Background Jobs**: Stock reservation cleanup

---

### 12. Search & Discovery
**Description**: Advanced product discovery features

#### Search Features
- **Full-text search** across products
- **Multi-language** search support
- **Typo tolerance** with fuzzy matching
- **Search suggestions** as-you-type
- **Recent searches** per user

**Service**: Appwrite Database full-text search
**Index**: Products, brands, categories

#### Filtering & Sorting
- **Multi-facet filtering**: Brand, category, price, certifications
- **Dynamic filter counts**
- **Sort options**: Price, newest, bestselling, rating
- **Saved filters** per user

**Components**: `<SearchBar />`, `<FilterPanel />`, `<SortDropdown />`

---

### 13. Wishlist & Favorites
**Description**: Product saving for later purchase

#### Wishlist Features
- **Save products** from listing or detail pages
- **Multiple wishlists** with custom names
- **Share wishlists** via link
- **Stock alerts** when items available
- **Move to cart** with one click

**Pages**: `/shop/wishlist`
**Database**: `users.wishlist[]`
**Components**: `<WishlistButton />`, `<WishlistDrawer />`

---

### 14. Analytics & Reporting
**Description**: Comprehensive business intelligence

#### Dashboard Metrics
- **Sales Analytics**: Revenue, orders, AOV
- **Product Performance**: Bestsellers, view-to-cart ratio
- **Customer Analytics**: LTV, retention, segments
- **Inventory Reports**: Stock levels, turnover
- **Financial Reports**: P&L, commissions, taxes

**Pages**: `/admin/dashboard`, `/brand/dashboard`
**Services**: Custom aggregation functions

#### Export Capabilities
- **CSV exports** for all reports
- **PDF generation** for invoices
- **Scheduled reports** via email
- **Custom date ranges**

---

### 15. Mobile Optimization
**Description**: Mobile-first responsive design

#### Mobile Features
- **Touch-optimized** UI (min 44px targets)
- **Swipe gestures** for galleries
- **Bottom sheet** modals
- **Sticky add-to-cart** button
- **One-thumb navigation**
- **PWA capabilities** with offline mode

#### Performance
- **Lazy loading** images
- **Infinite scroll** for listings
- **Optimized bundles** (<100KB initial)
- **Service worker** caching
- **Push notifications**

**Testing**: Chrome DevTools, real devices

---

### 16. SEO & Marketing
**Description**: Search engine optimization and marketing tools

#### SEO Features
- **SSR/SSG** for all public pages
- **Dynamic meta tags** per page
- **Structured data** (JSON-LD)
- **XML sitemap** generation
- **Canonical URLs**
- **Multi-language** SEO

#### Marketing Tools
- **UTM tracking** for campaigns
- **Abandoned cart** recovery emails
- **Newsletter signup** with incentives
- **Referral program** tracking
- **Social sharing** buttons

**Services**: Plausible Analytics, SendGrid

---

### 17. Admin Tools
**Description**: Platform management capabilities

#### User Management
- **User search** and filtering
- **Role changes** and permissions
- **Account suspension** controls
- **Invite code** generation
- **Activity logs** per user

**Pages**: `/admin/users`
**Permissions**: Admin only

#### Content Management
- **Product approval** workflow
- **Brand verification** process
- **Review moderation**
- **Banner management**
- **Email templates**

---

### 18. Brand Portal
**Description**: Self-service for brand partners

#### Brand Features
- **Product uploads** with approval
- **Order management** for their products
- **Performance analytics**
- **Inventory updates**
- **Marketing assets** upload

**Pages**: `/brand/dashboard`, `/brand/products`
**Permissions**: Brand role + company association

---

### 19. Customer Service
**Description**: Support tools and features

#### Support Features
- **Help center** with FAQs
- **Contact forms** with routing
- **Live chat** widget (future)
- **Ticket system** for issues
- **Return/refund** requests

**Pages**: `/contact`, `/help`, `/returns`
**Database**: `support_tickets` (future)

---

### 20. Security & Compliance
**Description**: Security measures and regulatory compliance

#### Security Features
- **Role-based access** control (RBAC)
- **Two-factor authentication** (optional)
- **Session management** with timeout
- **Rate limiting** on APIs
- **HTTPS everywhere**
- **XSS/CSRF protection**

#### Compliance
- **GDPR compliance** with data controls
- **Cookie consent** management
- **Privacy controls** for users
- **Data export** capability
- **Right to deletion**

**Pages**: `/privacy`, `/cookies`, `/account/data`
**Services**: Appwrite Auth, security headers

---

## 🔗 Cross-References

### Feature → Pages Mapping
- Registration → `/register`, `/admin/users`
- Product Catalog → `/products`, `/shop`
- Shopping Cart → `/cart`, `/shop/cart`
- Checkout → `/checkout`, `/shop/checkout`
- Orders → `/orders`, `/admin/orders`
- Messaging → `/messages`, `/orders/:id`

### Feature → Database Mapping
- Users → `users`, `companies`
- Products → `products`, `products.variants`
- Orders → `orders`, `order_items`
- Inventory → `products.variants[].inventory`
- Affiliates → `affiliate_codes`, `orders.affiliate`

### Feature → Services Mapping
- Payments → Stripe Checkout, Stripe Invoicing
- Auth → Appwrite Auth
- Storage → Appwrite Storage
- Realtime → Appwrite Realtime
- Email → SendGrid

---

## 📚 Related Documentation

- [README.md](./README.md) - Project overview
- [DATABASE.md](./DATABASE.md) - Complete schema
- [PAGES.md](./PAGES.md) - Page architecture
- [JOURNEYS.md](./JOURNEYS.md) - User flows
- [SERVICES.md](./SERVICES.md) - External integrations

---

*Comprehensive feature specifications for the LovingYourSkin marketplace platform.*