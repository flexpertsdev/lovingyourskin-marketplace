# Project Structure - LovingYourSkin E-commerce Platform

## Overview
This is a React 19 + TypeScript e-commerce platform for Korean beauty products, supporting both B2B (retailers) and B2C (consumers) operations.

## Directory Structure

```
lovingyourskin-main/
│
├── 📁 .claude/                    # Claude AI configuration
│   └── settings.local.json        # Local Claude settings
│
├── 📁 assets/                     # Static assets (images, logos)
│   ├── kotra-logo-color.png      # KOTRA partner logo
│   └── kotralogo.png              # KOTRA logo variant
│
├── 📁 netlify/                    # Netlify serverless functions
│   └── 📁 functions/              # Backend API endpoints
│       ├── stripe-checkout.ts    # Stripe checkout session creation
│       ├── stripe-customer.ts    # Stripe customer management
│       └── stripe-webhook.ts     # Stripe webhook handler
│
├── 📁 public/                     # Public static files
│   ├── _redirects                # Netlify redirect rules
│   └── 📁 assets/                # Public assets
│       └── promotional-banner.png # Marketing banner
│
├── 📁 src/                        # Source code
│   ├── 📁 components/             # React components
│   │   ├── 📁 admin/             # Admin interface components
│   │   │   ├── AdminLayout.tsx  # Admin layout wrapper
│   │   │   ├── AffiliateCodeManager.tsx # Manage affiliate codes
│   │   │   ├── ImageUploadManager.tsx   # Bulk image uploads
│   │   │   ├── InitializeFirebase.tsx   # Firebase setup tool
│   │   │   └── index.ts         # Admin component exports
│   │   │
│   │   ├── 📁 auth/              # Authentication components
│   │   │   ├── AuthProvider.tsx # Auth context provider
│   │   │   ├── ProtectedRoute.tsx # Route protection wrapper
│   │   │   └── index.ts         # Auth component exports
│   │   │
│   │   ├── 📁 cart/              # Shopping cart components
│   │   │   └── AffiliateCodeAutoApply.tsx # Auto-apply affiliate discounts
│   │   │
│   │   ├── 📁 dashboard/         # Dashboard components
│   │   │   ├── BrandDashboard.tsx # Brand partner dashboard
│   │   │   └── index.ts         # Dashboard exports
│   │   │
│   │   ├── 📁 features/          # Feature-specific components
│   │   │   ├── BrandCard.tsx    # Brand display card
│   │   │   ├── BrandCardHero.tsx # Hero brand showcase
│   │   │   ├── CurrencySelector.tsx # Currency switcher
│   │   │   ├── DiscountCodeInput.tsx # Discount code entry
│   │   │   ├── HeroCarousel.tsx # Landing page carousel
│   │   │   ├── PartnerCard.tsx  # Partner showcase card
│   │   │   ├── PriceDisplay.tsx # Multi-currency price display
│   │   │   ├── ProductCard.tsx  # Product display card
│   │   │   ├── TestimonialCard.tsx # Customer testimonials
│   │   │   └── index.ts         # Feature exports
│   │   │
│   │   ├── 📁 layout/            # Layout components
│   │   │   ├── Container.tsx    # Content container
│   │   │   ├── Footer.tsx       # Site footer
│   │   │   ├── Grid.tsx         # Grid layout helper
│   │   │   ├── Header.tsx       # Site header/navigation
│   │   │   ├── Layout.tsx       # Main layout wrapper
│   │   │   ├── PageHeader.tsx   # Page title header
│   │   │   ├── Section.tsx      # Page section wrapper
│   │   │   └── index.ts         # Layout exports
│   │   │
│   │   ├── 📁 ui/                # Base UI components (design system)
│   │   │   ├── Accordion.tsx    # Expandable content
│   │   │   ├── alert-dialog.tsx # Alert/confirmation dialogs
│   │   │   ├── Badge.tsx        # Status badges
│   │   │   ├── Button.tsx       # Button component
│   │   │   ├── Card.tsx         # Card container
│   │   │   ├── dialog.tsx       # Modal dialogs
│   │   │   ├── Input.tsx        # Form input
│   │   │   ├── label.tsx        # Form labels
│   │   │   ├── progress.tsx     # Progress indicators
│   │   │   ├── Select.tsx       # Dropdown select
│   │   │   ├── Spinner.tsx      # Loading spinner
│   │   │   ├── table.tsx        # Data tables
│   │   │   ├── tabs.tsx         # Tab navigation
│   │   │   ├── Textarea.tsx     # Multi-line input
│   │   │   └── index.ts         # UI exports
│   │   │
│   │   ├── 📁 utils/             # Utility components
│   │   │   └── ScrollToTop.tsx  # Scroll restoration
│   │   │
│   │   └── ErrorBoundary.tsx    # Error boundary wrapper
│   │
│   ├── 📁 config/                # Configuration files
│   │   └── services.config.ts   # Service configuration
│   │
│   ├── 📁 data/                  # Static data
│   │   └── 📁 imported/          # Migrated data from legacy system
│   │       ├── brands-imported.json    # Brand data
│   │       ├── products-imported.json  # Product catalog
│   │       └── import-summary.json     # Migration summary
│   │
│   ├── 📁 hooks/                 # Custom React hooks
│   │   ├── useAffiliateTracking.ts # Track affiliate referrals
│   │   ├── useBrands.ts         # Brand data hook
│   │   ├── useCurrencyRates.ts  # Currency conversion
│   │   └── useFirebase.ts       # Firebase connection
│   │
│   ├── 📁 lib/                   # External library configs
│   │   ├── 📁 firebase/          # Firebase setup
│   │   │   ├── collections.ts   # Firestore collections
│   │   │   └── config.ts        # Firebase config
│   │   │
│   │   └── 📁 utils/             # Utility functions
│   │       ├── cn.ts            # Class name helper
│   │       └── pricing.ts      # Price calculations
│   │
│   ├── 📁 pages/                 # Page components (routes)
│   │   ├── 📁 admin/             # Admin pages
│   │   │   ├── AdminAffiliates.tsx      # Affiliate management
│   │   │   ├── AdminBrands.tsx          # Brand management
│   │   │   ├── AdminDashboard.tsx       # Admin overview
│   │   │   ├── AdminDiscounts.tsx       # Discount codes
│   │   │   ├── AdminLogin.tsx           # Admin login
│   │   │   ├── AdminMessages.tsx        # Message center
│   │   │   ├── AdminOrders.tsx          # Order management
│   │   │   ├── AdminPreorders.tsx       # Preorder campaigns
│   │   │   ├── AdminSetup.tsx           # Initial setup
│   │   │   ├── MigrateImages.tsx        # Image migration tool
│   │   │   ├── PreorderCampaignManager.tsx # Campaign management
│   │   │   ├── PreorderManagement.tsx   # Preorder admin
│   │   │   ├── ProductManagement.tsx    # Product admin
│   │   │   └── UserManagement.tsx       # User admin
│   │   │
│   │   ├── 📁 affiliate/         # Affiliate pages
│   │   │   └── AffiliateDashboard.tsx   # Affiliate portal
│   │   │
│   │   ├── 📁 auth/              # Authentication pages
│   │   │   ├── ConsumerRegister.tsx     # B2C registration
│   │   │   ├── Login.tsx                # General login
│   │   │   ├── Register.tsx             # B2B registration (invite-only)
│   │   │   └── index.ts                 # Auth exports
│   │   │
│   │   ├── 📁 brand/             # Brand partner pages
│   │   │   ├── BrandDashboard.tsx       # Brand overview
│   │   │   └── BrandOrders.tsx          # Brand order management
│   │   │
│   │   ├── 📁 retailer/          # B2B retailer pages
│   │   │   ├── RetailerDashboard.tsx    # Retailer overview
│   │   │   └── RetailerOrders.tsx       # Retailer orders
│   │   │
│   │   │   # Consumer/B2C Pages (root level)
│   │   ├── ConsumerBrandDetail.tsx      # B2C brand page
│   │   ├── ConsumerBrands.tsx           # B2C brand listing
│   │   ├── ConsumerCheckout.tsx         # B2C checkout
│   │   ├── ConsumerLogin.tsx            # B2C login
│   │   ├── ConsumerOrderHistory.tsx     # B2C order history
│   │   ├── ConsumerPreorderCart.tsx     # B2C preorder cart
│   │   ├── ConsumerPreorders.tsx        # B2C preorder listing
│   │   ├── ConsumerProductDetail.tsx    # B2C product page
│   │   ├── ConsumerShop.tsx             # B2C shop homepage
│   │   ├── ConsumerUnifiedCart.tsx      # B2C unified cart
│   │   │
│   │   │   # B2B Pages
│   │   ├── B2BCart.tsx                  # B2B shopping cart
│   │   ├── BrandDetail.tsx              # B2B brand showcase
│   │   ├── Brands.tsx                   # B2B brand listing
│   │   ├── Checkout.tsx                 # B2B checkout
│   │   ├── CheckoutSuccess.tsx          # Order confirmation
│   │   ├── Dashboard.tsx                # User dashboard
│   │   ├── Messages.tsx                 # Messaging system
│   │   ├── OrderDetailEnhanced.tsx      # Order details view
│   │   ├── Orders.tsx                   # Order listing
│   │   ├── Preorder.tsx                 # Preorder landing
│   │   ├── PreorderDetail.tsx           # Preorder details
│   │   ├── ProductDetail.tsx            # B2B product page
│   │   ├── Profile.tsx                  # User profile
│   │   ├── Wishlist.tsx                 # Saved products
│   │   │
│   │   │   # Marketing/Info Pages
│   │   ├── About.tsx                    # About us
│   │   ├── Careers.tsx                  # Career opportunities
│   │   ├── Contact.tsx                  # Contact form
│   │   ├── FAQ.tsx                      # Frequently asked questions
│   │   ├── ForBrands.tsx                # Brand partnership info
│   │   ├── ForRetailers.tsx             # Retailer info
│   │   ├── HowItWorks.tsx               # Platform guide
│   │   ├── Landing.tsx                  # Homepage
│   │   │
│   │   │   # Legal Pages
│   │   ├── CookiePolicy.tsx             # Cookie policy
│   │   ├── Privacy.tsx                  # Privacy policy
│   │   ├── RefundPolicy.tsx             # Refund policy
│   │   └── Terms.tsx                    # Terms of service
│   │
│   ├── 📁 routes/                # Route configuration
│   │   └── index.tsx             # Route definitions
│   │
│   ├── 📁 scripts/               # Utility scripts
│   │   └── initializeFirebase.ts # Firebase initialization
│   │
│   ├── 📁 services/              # Service layer (API/business logic)
│   │   ├── 📁 firebase/          # Firebase services
│   │   │   ├── affiliate.service.ts     # Affiliate tracking
│   │   │   ├── auth.service.ts          # Authentication
│   │   │   ├── brand.service.ts         # Brand operations
│   │   │   ├── cart.service.ts          # Cart persistence
│   │   │   ├── dashboard.service.ts     # Dashboard data
│   │   │   ├── discount.service.ts      # Discount codes
│   │   │   ├── message.service.ts       # Messaging
│   │   │   ├── order.service.ts         # Order management
│   │   │   ├── preorder.service.ts      # Preorder campaigns
│   │   │   ├── product.service.ts       # Product catalog
│   │   │   ├── storageService.ts        # File storage
│   │   │   └── index.ts                 # Service exports
│   │   │
│   │   ├── 📁 invoice/           # Invoice generation
│   │   │   └── invoice.service.ts       # PDF invoice creation
│   │   │
│   │   ├── 📁 stripe/            # Payment processing
│   │   │   └── stripe.service.ts        # Stripe integration
│   │   │
│   │   ├── currency.service.ts  # Currency conversion
│   │   └── index.ts              # Service exports
│   │
│   ├── 📁 stores/                # State management (Zustand)
│   │   ├── auth.store.ts        # Authentication state
│   │   ├── cart.store.ts        # B2B cart state
│   │   ├── consumer-cart.store.ts # B2C cart state
│   │   ├── currency.store.ts    # Currency preferences
│   │   ├── preorder.store.ts    # Preorder state
│   │   ├── ui.store.ts          # UI preferences (theme, language)
│   │   └── index.ts              # Store exports
│   │
│   ├── 📁 styles/                # Global styles
│   │   └── index.css             # Tailwind CSS imports
│   │
│   ├── 📁 theme/                 # Design system
│   │   ├── colors.ts            # Color palette
│   │   ├── spacing.ts           # Spacing scale
│   │   ├── typography.ts        # Font settings
│   │   └── index.ts              # Theme exports
│   │
│   ├── 📁 types/                 # TypeScript definitions
│   │   ├── affiliate.ts         # Affiliate types
│   │   ├── discount.ts          # Discount types
│   │   ├── preorder.ts          # Preorder types
│   │   └── index.ts              # Main type definitions
│   │
│   ├── 📁 utils/                 # Utility functions
│   │   ├── currency.ts          # Currency helpers
│   │   ├── firebase-init.ts     # Firebase initialization
│   │   ├── format.ts            # Formatting utilities
│   │   ├── imageUtils.ts        # Image processing
│   │   ├── invoice-pdf.ts       # PDF generation
│   │   └── product-helpers.ts   # Product utilities
│   │
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Application entry point
│   └── vite-env.d.ts            # Vite type definitions
│
│   # Configuration Files (root)
├── .env                          # Environment variables (local)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── .nvmrc                        # Node version specification
├── CLAUDE.md                     # AI assistant instructions
├── firebase.json                 # Firebase configuration
├── firestore.indexes.json       # Firestore database indexes
├── firestore.rules              # Firestore security rules
├── index.html                    # HTML entry point
├── netlify.toml                  # Netlify deployment config
├── package.json                  # Dependencies & scripts
├── package-lock.json             # Dependency lock file
├── postcss.config.js             # PostCSS configuration
├── serviceAccountKey.json        # Firebase service account
├── storage.rules                 # Firebase storage rules
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── tsconfig.node.json            # Node TypeScript config
└── vite.config.ts                # Vite bundler config
```

## Key Architecture Notes

### 🏗️ Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with persistence)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Payments**: Stripe
- **Deployment**: Netlify

### 🔐 Authentication & Authorization
- **Invite-only B2B**: Retailers need invite codes to register
- **Open B2C**: Consumers can register freely
- **Role-based access**: Admin, Retailer, Brand, Consumer, Affiliate
- **Protected routes**: Different UI for each user type

### 💼 Business Logic
- **Dual marketplace**: Separate B2B and B2C flows
- **MOQ validation**: Minimum order quantities for B2B
- **Multi-currency**: KRW, USD, CNY support
- **Multi-language**: English, Korean, Chinese
- **Preorder campaigns**: Time-limited group buying
- **Affiliate system**: Tracking and commission management

### 📊 Data Flow
1. **Services** → Firebase API calls
2. **Stores** → Zustand state management
3. **Components** → React UI rendering
4. **Types** → Full TypeScript coverage

### 🎨 Design System
- **Primary**: Rose Gold (#D4A5A5)
- **Secondary**: Deep Charcoal (#1A1A1A)
- **Background**: Soft Pink (#FDF8F6)
- **Typography**: Inter + Noto Sans KR
- **Components**: Consistent UI component library

### 🚀 Key Features
- **B2B Platform**: Wholesale ordering for retailers
- **B2C Shop**: Direct-to-consumer sales
- **Preorder System**: Group buying campaigns
- **Multi-language**: i18n support
- **Multi-currency**: Real-time conversion
- **Affiliate Program**: Referral tracking
- **Admin Panel**: Full CRUD operations
- **Invoice Generation**: PDF invoices
- **Order Workflow**: 9-stage order process

### 📦 Deployment
- **Hosting**: Netlify (static site + functions)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Functions**: Netlify Functions (Stripe webhooks)
- **CDN**: Netlify Edge Network

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Deploy to production
npm run firebase:deploy
```

## Environment Variables Required

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Currency API
VITE_EXCHANGE_RATE_API_KEY
```