# PAGES.md - Complete Page Architecture

## 📑 Page Structure Overview

Total Pages: **70+** organized by access level and functionality

### Page Organization
- **Public**: No authentication required
- **Protected**: Authentication required
- **Role-Specific**: Limited to certain user roles
- **Dynamic**: Pages with variable content/state

## 🌐 Public Pages (19)

### 1. Landing Page
**Path**: `/`
**File**: `pages/index.vue`
**Components**:
- `HeroSection.vue` - Main banner with CTA
- `BrandShowcase.vue` - Featured brands carousel
- `ValueProposition.vue` - Why choose us
- `TestimonialSlider.vue` - Customer reviews
- `NewsletterSignup.vue` - Email capture

**Features**:
- Hero video/image rotation
- Featured products slider
- Brand partner logos
- Newsletter subscription
- Multi-language support

**Database Operations**:
- Fetch featured products
- Load featured brands
- Get testimonials

**Journey**: First-time visitor → Explore → Sign up

---

### 2. About Page
**Path**: `/about`
**File**: `pages/about.vue`
**Components**:
- `CompanyStory.vue`
- `TeamSection.vue`
- `MissionVision.vue`
- `Timeline.vue`

**Features**:
- Company history
- Team profiles
- Mission statement
- Growth timeline

---

### 3. How It Works
**Path**: `/how-it-works`
**File**: `pages/how-it-works.vue`
**Components**:
- `ProcessSteps.vue`
- `VideoExplainer.vue`
- `FAQAccordion.vue`

**Features**:
- Step-by-step guide
- Video walkthrough
- Role-based content (retailer vs consumer)

**Journey**: Visitor → Understanding → Registration

---

### 4. For Brands
**Path**: `/for-brands`
**File**: `pages/for-brands.vue`
**Components**:
- `BrandBenefits.vue`
- `PartnerRequirements.vue`
- `ApplicationForm.vue`

**Features**:
- Partnership benefits
- Requirements checklist
- Application process
- Success stories

**Database Operations**:
- Submit brand application

---

### 5. For Retailers
**Path**: `/for-retailers`
**File**: `pages/for-retailers.vue`
**Components**:
- `RetailerBenefits.vue`
- `PricingTiers.vue`
- `RequestInvite.vue`

**Features**:
- Wholesale advantages
- MOQ explanation
- Pricing structure
- Invite request form

**Database Operations**:
- Submit invite request

---

### 6. Contact
**Path**: `/contact`
**File**: `pages/contact.vue`
**Components**:
- `ContactForm.vue`
- `OfficeLocations.vue`
- `SupportHours.vue`

**Features**:
- Multi-department routing
- File attachments
- Auto-response
- Office locations map

**Database Operations**:
- Create support ticket

---

### 7-15. Legal Pages
**Paths**:
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/cookies` - Cookie Policy
- `/refunds` - Refund Policy
- `/shipping` - Shipping Policy
- `/wholesale-terms` - B2B Terms
- `/affiliate-terms` - Affiliate Terms
- `/brand-agreement` - Brand Partnership Agreement
- `/gdpr` - GDPR Rights

**Components**:
- `LegalContent.vue`
- `TableOfContents.vue`
- `PrintButton.vue`

---

### 16. FAQ
**Path**: `/faq`
**File**: `pages/faq.vue`
**Components**:
- `FAQSearch.vue`
- `FAQCategories.vue`
- `FAQAccordion.vue`

**Features**:
- Searchable FAQs
- Category filtering
- Most popular questions
- Contact support link

---

### 17. Careers
**Path**: `/careers`
**File**: `pages/careers.vue`
**Components**:
- `JobListings.vue`
- `DepartmentFilter.vue`
- `ApplicationForm.vue`

---

### 18. Blog (Future)
**Path**: `/blog`
**File**: `pages/blog/index.vue`
**Components**:
- `BlogGrid.vue`
- `CategoryFilter.vue`
- `SearchBar.vue`

---

### 19. Press
**Path**: `/press`
**File**: `pages/press.vue`
**Components**:
- `PressReleases.vue`
- `MediaKit.vue`
- `ContactPress.vue`

---

## 🔐 Authentication Pages (6)

### 20. B2B Login
**Path**: `/login`
**File**: `pages/auth/login.vue`
**Components**:
- `LoginForm.vue`
- `SocialLogin.vue`
- `ForgotPassword.vue`

**Features**:
- Email/password login
- Remember me
- Password recovery
- Role detection

**Database Operations**:
- Authenticate user
- Update last login

**Journey**: Login → Dashboard

---

### 21. B2B Register
**Path**: `/register`
**File**: `pages/auth/register.vue`
**Components**:
- `InviteCodeInput.vue`
- `RegistrationForm.vue`
- `CompanyDetails.vue`

**Features**:
- Invite code validation
- Company association
- Multi-step form
- Email verification

**Database Operations**:
- Validate invite code
- Create user account
- Link to company

**Journey**: Invite Code → Registration → Verification

---

### 22. B2C Login
**Path**: `/shop/login`
**File**: `pages/shop/auth/login.vue`
**Components**:
- `ConsumerLoginForm.vue`
- `GuestCheckout.vue`
- `SocialLogin.vue`

**Features**:
- Simplified login
- Guest checkout option
- Social login

---

### 23. B2C Register
**Path**: `/shop/register`
**File**: `pages/shop/auth/register.vue`
**Components**:
- `ConsumerSignupForm.vue`
- `NewsletterOptIn.vue`

**Features**:
- No invite required
- Newsletter subscription
- Welcome discount

---

### 24. Forgot Password
**Path**: `/forgot-password`
**File**: `pages/auth/forgot-password.vue`

### 25. Reset Password
**Path**: `/reset-password`
**File**: `pages/auth/reset-password.vue`

---

## 🏪 B2B Commerce Pages (12)

### 26. Brands Listing
**Path**: `/brands`
**File**: `pages/brands/index.vue`
**Components**:
- `BrandGrid.vue`
- `BrandFilters.vue`
- `SearchBar.vue`

**Features**:
- Grid/list view toggle
- Filter by category, country
- Search brands
- MOQ display

**Database Operations**:
- Fetch all active brands
- Load brand statistics

**State**: `brandsState.filters`

---

### 27. Brand Detail
**Path**: `/brands/:brandId`
**File**: `pages/brands/[brandId].vue`
**Components**:
- `BrandHero.vue`
- `BrandStory.vue`
- `ProductGrid.vue`
- `BrandCertifications.vue`

**Features**:
- Brand story
- Product catalog
- MOQ requirements
- Certifications display
- Contact brand

**Database Operations**:
- Fetch brand details
- Load brand products
- Track view analytics

---

### 28. Product Catalog
**Path**: `/products`
**File**: `pages/products/index.vue`
**Components**:
- `ProductGrid.vue`
- `FilterSidebar.vue`
- `SortDropdown.vue`
- `Pagination.vue`

**Features**:
- Advanced filtering
- Sort options
- Quick view modal
- Bulk add to cart

---

### 29. Product Detail (B2B)
**Path**: `/products/:productId`
**File**: `pages/products/[productId].vue`
**Components**:
- `ProductGallery.vue`
- `ProductInfo.vue`
- `VariantSelector.vue`
- `WholesalePricing.vue`
- `AddToCartB2B.vue`

**Features**:
- Image zoom gallery
- Variant selection
- Wholesale price tiers
- MOQ calculator
- Bulk quantity input
- Related products

**Database Operations**:
- Fetch product with variants
- Check inventory
- Load pricing tiers

---

### 30. B2B Cart
**Path**: `/cart`
**File**: `pages/cart.vue`
**Components**:
- `CartItems.vue`
- `MOQProgress.vue`
- `CartSummary.vue`
- `SuggestedProducts.vue`

**Features**:
- MOQ validation per brand
- Progress indicators
- Quantity adjustments
- Save for later
- Apply discount codes

**Database Operations**:
- Update cart items
- Validate MOQ status
- Calculate totals

**State**: `cartState.b2bCart`

---

### 31. B2B Checkout
**Path**: `/checkout`
**File**: `pages/checkout.vue`
**Components**:
- `CheckoutSteps.vue`
- `ShippingForm.vue`
- `PaymentOptions.vue`
- `OrderReview.vue`

**Features**:
- Multi-step checkout
- Company billing details
- Payment terms selection
- Order summary
- Terms acceptance

**Database Operations**:
- Create order
- Generate invoice
- Send confirmation

**Services**: Stripe Invoicing

---

### 32. Orders List (B2B)
**Path**: `/orders`
**File**: `pages/orders/index.vue`
**Components**:
- `OrdersTable.vue`
- `OrderFilters.vue`
- `StatusBadge.vue`

**Features**:
- Order history
- Status filtering
- Search orders
- Download invoices
- Reorder functionality

---

### 33. Order Detail (B2B)
**Path**: `/orders/:orderId`
**File**: `pages/orders/[orderId].vue`
**Components**:
- `OrderHeader.vue`
- `OrderTimeline.vue`
- `OrderItems.vue`
- `OrderDocuments.vue`
- `OrderMessages.vue`

**Features**:
- Status timeline
- Document downloads
- Message thread
- Tracking information
- Return request

---

### 34. Messages
**Path**: `/messages`
**File**: `pages/messages.vue`
**Components**:
- `MessageThreadList.vue`
- `MessageThread.vue`
- `MessageComposer.vue`

**Features**:
- Order-based threads
- File attachments
- Read receipts
- Email notifications

**Realtime**: Appwrite Realtime

---

### 35. Pre-order Listing (B2B)
**Path**: `/preorder`
**File**: `pages/preorder/index.vue`

### 36. Pre-order Detail (B2B)
**Path**: `/preorder/:campaignId`
**File**: `pages/preorder/[campaignId].vue`

### 37. Profile
**Path**: `/profile`
**File**: `pages/profile.vue`
**Components**:
- `ProfileForm.vue`
- `CompanyInfo.vue`
- `SecuritySettings.vue`
- `NotificationPreferences.vue`

---

## 🛒 B2C Commerce Pages (15)

### 38. Consumer Shop
**Path**: `/shop`
**File**: `pages/shop/index.vue`
**Components**:
- `ShopHero.vue`
- `CategoryCards.vue`
- `FeaturedProducts.vue`
- `TrendingSection.vue`

**Features**:
- Hero banners
- Category navigation
- Featured products
- Trending items
- Newsletter popup

**Database Operations**:
- Fetch B2C products
- Load categories

---

### 39. Shop Category
**Path**: `/shop/category/:slug`
**File**: `pages/shop/category/[slug].vue`

### 40. Product Detail (B2C)
**Path**: `/shop/products/:productId`
**File**: `pages/shop/products/[productId].vue`
**Components**:
- `ProductGallery.vue`
- `ProductInfoB2C.vue`
- `VariantSelector.vue`
- `AddToCartB2C.vue`
- `ProductReviews.vue`
- `SocialShare.vue`

**Features**:
- Image gallery with zoom
- Variant selection
- Add to wishlist
- Reviews & ratings
- Social sharing
- Recently viewed

---

### 41. Consumer Cart
**Path**: `/shop/cart`
**File**: `pages/shop/cart.vue`
**Components**:
- `CartItemsB2C.vue`
- `CartSummaryB2C.vue`
- `DiscountCode.vue`
- `RecommendedProducts.vue`

**Features**:
- Cart management
- Discount codes
- Shipping calculator
- Express checkout buttons

---

### 42. Consumer Checkout
**Path**: `/shop/checkout`
**File**: `pages/shop/checkout.vue`
**Components**:
- `ExpressCheckout.vue`
- `GuestCheckout.vue`
- `ShippingAddress.vue`
- `PaymentForm.vue`

**Features**:
- Express checkout (Apple Pay, Google Pay)
- Guest checkout
- Saved addresses
- Multiple payment methods

**Services**: Stripe Checkout

---

### 43. Checkout Success
**Path**: `/shop/checkout/success`
**File**: `pages/shop/checkout/success.vue`
**Components**:
- `OrderConfirmation.vue`
- `OrderSummaryReceipt.vue`
- `NextSteps.vue`

---

### 44. Brands (B2C)
**Path**: `/shop/brands`
**File**: `pages/shop/brands/index.vue`

### 45. Brand Shop
**Path**: `/shop/brands/:brandId`
**File**: `pages/shop/brands/[brandId].vue`

### 46. Pre-orders (B2C)
**Path**: `/shop/preorders`
**File**: `pages/shop/preorders/index.vue`

### 47. Pre-order Cart
**Path**: `/shop/preorder-cart`
**File**: `pages/shop/preorder-cart.vue`

### 48. Wishlist
**Path**: `/shop/wishlist`
**File**: `pages/shop/wishlist.vue`
**Components**:
- `WishlistItems.vue`
- `ShareWishlist.vue`
- `MoveToCart.vue`

---

### 49. Order History (B2C)
**Path**: `/shop/orders`
**File**: `pages/shop/orders/index.vue`

### 50. Order Detail (B2C)
**Path**: `/shop/orders/:orderId`
**File**: `pages/shop/orders/[orderId].vue`

### 51. Account Settings
**Path**: `/shop/account`
**File**: `pages/shop/account.vue`

### 52. Addresses
**Path**: `/shop/account/addresses`
**File**: `pages/shop/account/addresses.vue`

---

## 👨‍💼 Admin Pages (15)

### 53. Admin Dashboard
**Path**: `/admin`
**File**: `pages/admin/index.vue`
**Components**:
- `StatsOverview.vue`
- `SalesChart.vue`
- `RecentOrders.vue`
- `TopProducts.vue`
- `SystemAlerts.vue`

**Features**:
- KPI metrics
- Sales analytics
- Recent activity
- System health

**Database Operations**:
- Aggregate statistics
- Generate reports

---

### 54. User Management
**Path**: `/admin/users`
**File**: `pages/admin/users/index.vue`
**Components**:
- `UsersTable.vue`
- `UserFilters.vue`
- `InviteModal.vue`
- `UserActions.vue`

**Features**:
- User search & filter
- Role management
- Invite generation
- Account suspension
- Activity logs

---

### 55. Product Management
**Path**: `/admin/products`
**File**: `pages/admin/products/index.vue`
**Components**:
- `ProductsTable.vue`
- `ProductEditor.vue`
- `BulkActions.vue`

**Features**:
- Product CRUD
- Bulk editing
- Import/export
- Approval workflow

---

### 56. Brand Management
**Path**: `/admin/brands`
**File**: `pages/admin/brands/index.vue`

### 57. Order Management
**Path**: `/admin/orders`
**File**: `pages/admin/orders/index.vue`

### 58. Messages Admin
**Path**: `/admin/messages`
**File**: `pages/admin/messages.vue`

### 59. Affiliate Management
**Path**: `/admin/affiliates`
**File**: `pages/admin/affiliates/index.vue`

### 60. Discount Management
**Path**: `/admin/discounts`
**File**: `pages/admin/discounts/index.vue`

### 61. Pre-order Campaigns
**Path**: `/admin/preorders`
**File**: `pages/admin/preorders/index.vue`

### 62. Campaign Manager
**Path**: `/admin/preorders/manage`
**File**: `pages/admin/preorders/manage.vue`

### 63. Reports
**Path**: `/admin/reports`
**File**: `pages/admin/reports/index.vue`

### 64. Settings
**Path**: `/admin/settings`
**File**: `pages/admin/settings/index.vue`

### 65. Email Templates
**Path**: `/admin/emails`
**File**: `pages/admin/emails/index.vue`

### 66. System Logs
**Path**: `/admin/logs`
**File**: `pages/admin/logs.vue`

### 67. Admin Login
**Path**: `/admin/login`
**File**: `pages/admin/login.vue`

---

## 👥 Role-Specific Dashboards (12)

### 68. Retailer Dashboard
**Path**: `/retailer/dashboard`
**File**: `pages/retailer/dashboard.vue`
**Components**:
- `RetailerStats.vue`
- `RecentOrders.vue`
- `ReorderSuggestions.vue`

---

### 69. Retailer Orders
**Path**: `/retailer/orders`
**File**: `pages/retailer/orders/index.vue`

### 70. Brand Dashboard
**Path**: `/brand/dashboard`
**File**: `pages/brand/dashboard.vue`
**Components**:
- `BrandStats.vue`
- `ProductPerformance.vue`
- `OrderQueue.vue`

---

### 71. Brand Orders
**Path**: `/brand/orders`
**File**: `pages/brand/orders/index.vue`

### 72. Brand Products
**Path**: `/brand/products`
**File**: `pages/brand/products/index.vue`

### 73. Affiliate Dashboard
**Path**: `/affiliate/dashboard`
**File**: `pages/affiliate/dashboard.vue`
**Components**:
- `CommissionStats.vue`
- `CodePerformance.vue`
- `PayoutHistory.vue`

---

### 74. Affiliate Codes
**Path**: `/affiliate/codes`
**File**: `pages/affiliate/codes/index.vue`

### 75. Affiliate Payouts
**Path**: `/affiliate/payouts`
**File**: `pages/affiliate/payouts/index.vue`

---

## 🎭 Dynamic Page States

### Product Detail Variations
- **Default State**: Product available
- **Out of Stock**: Stock = 0
- **Pre-order Mode**: isPreorder = true
- **Sale State**: salePrice set
- **B2B View**: Wholesale pricing
- **B2C View**: Retail pricing

### Cart States
- **Empty Cart**: No items
- **MOQ Warning**: Below minimum (B2B)
- **Discount Applied**: With discount code
- **Expired Items**: Price changed
- **Mixed Cart**: Regular + preorder items

### Checkout States
- **Guest Checkout**: Not logged in
- **Returning Customer**: Saved details
- **New Address**: Adding new shipping
- **Payment Selection**: Choosing method
- **Processing**: Payment in progress
- **Error State**: Payment failed

---

## 🧩 Shared Components

### Layout Components
- `AppHeader.vue` - Main navigation
- `AppFooter.vue` - Footer links
- `MobileNav.vue` - Mobile menu
- `Breadcrumbs.vue` - Navigation trail

### UI Components
- `Button.vue` - Primary CTA
- `Card.vue` - Content containers
- `Modal.vue` - Overlay dialogs
- `Tabs.vue` - Tab navigation
- `Accordion.vue` - Collapsible content
- `Table.vue` - Data tables
- `Pagination.vue` - Page navigation
- `LoadingSpinner.vue` - Loading states
- `ErrorBoundary.vue` - Error handling

### Form Components
- `Input.vue` - Text inputs
- `Select.vue` - Dropdowns
- `Checkbox.vue` - Checkboxes
- `Radio.vue` - Radio buttons
- `FileUpload.vue` - File uploads
- `DatePicker.vue` - Date selection
- `FormValidator.vue` - Validation wrapper

---

## 🔗 Cross-References

### Pages → Features
- Cart pages → MOQ System
- Checkout pages → Payment Processing
- Product pages → Variant Management
- Order pages → Order Management
- Message pages → Messaging System

### Pages → Database
- Product pages → `products` collection
- Order pages → `orders` collection
- User pages → `users` collection
- Cart pages → `carts` collection

### Pages → Journeys
- Landing → First-time visitor journey
- Register → B2B onboarding journey
- Shop → B2C shopping journey
- Checkout → Purchase completion journey

### Pages → Services
- Checkout pages → Stripe API
- Auth pages → Appwrite Auth
- Upload pages → Appwrite Storage
- Message pages → Appwrite Realtime

---

## 📱 Mobile Considerations

### Mobile-Specific Pages
- Bottom sheet modals for filters
- Swipe navigation for galleries
- Simplified checkout flow
- Touch-optimized forms

### PWA Features
- Offline page fallbacks
- Add to home screen prompt
- Push notification opt-in
- Background sync for cart

---

## 🎨 Page Templates

### Marketing Template
- Hero section
- Feature grid
- Testimonials
- CTA section
- Used by: Landing, For Brands, For Retailers

### Commerce Template
- Product grid
- Filter sidebar
- Sort controls
- Pagination
- Used by: Shop, Products, Brands

### Dashboard Template
- Stats cards
- Charts/graphs
- Data tables
- Quick actions
- Used by: All dashboards

### Form Template
- Multi-step wizard
- Validation feedback
- Progress indicator
- Used by: Registration, Checkout

---

## 📚 Related Documentation

- [README.md](./README.md) - Project overview
- [FEATURES.md](./FEATURES.md) - Feature details
- [DATABASE.md](./DATABASE.md) - Schema definitions
- [JOURNEYS.md](./JOURNEYS.md) - User flows
- [SERVICES.md](./SERVICES.md) - External integrations

---

*Complete page architecture for the LovingYourSkin marketplace platform.*