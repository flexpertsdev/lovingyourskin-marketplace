# LovingYourSkin Marketplace - Project Overview

## 🌟 Vision

LovingYourSkin is a premium B2B/B2C hybrid marketplace connecting innovative K-Beauty brands with global retailers and consumers. We curate and distribute the finest Korean skincare products, providing a seamless wholesale platform for retailers while offering consumers direct access to authentic, cutting-edge beauty innovations.

## 🎨 Brand Identity

### Visual Design
- **Primary Color**: Rose Gold (#D4A5A5) - Luxury, femininity, sophistication
- **Secondary Color**: Deep Charcoal (#1A1A1A) - Premium, professional
- **Background**: Soft Pink (#FDF8F6) - Warmth, approachability
- **Typography**: Inter + Noto Sans KR - Clean, modern, multilingual

### Design Philosophy
- **Minimal Luxury**: Clean interfaces with generous whitespace
- **Mobile-First**: Optimized for mobile commerce (70% of beauty shopping)
- **Flutter-Inspired**: Component-driven, prop-based configuration
- **Zero CSS Required**: All styling through semantic props

### Logo & Assets
- Minimalist wordmark with rose gold accent
- Responsive logo variants for different contexts
- Premium product photography with consistent styling
- Soft shadows and subtle animations for depth

## 🏗 Design Patterns & System

### Architecture Patterns
1. **Component-Driven Development**
   - Atomic design methodology
   - Reusable, composable components
   - Props control everything (no CSS classes)

2. **Mobile-First Responsive**
   - Touch-optimized interfaces (min 44px targets)
   - Progressive enhancement for desktop
   - PWA capabilities built-in

3. **Multi-Tenant Architecture**
   - Role-based access control (RBAC)
   - Isolated data per user type
   - Shared component library

4. **Event-Driven State**
   - Reactive state management (Pinia)
   - Optimistic UI updates
   - Real-time synchronization

### Technical Patterns
- **Service Layer**: All API calls through service modules
- **Type-Safe**: Full TypeScript coverage
- **Composables**: Reusable business logic
- **Server-Side Rendering**: SEO optimization for public pages
- **API-First**: Decoupled frontend/backend

## 🚀 Key Features

### Dual Marketplace
- **B2B Wholesale**: MOQ-based ordering for retailers
- **B2C Shop**: Direct-to-consumer with immediate checkout
- **Unified Inventory**: Real-time stock synchronization

### Registration & Access
- **Invite-Only B2B**: Controlled retailer onboarding
- **Open B2C Registration**: Consumer self-service
- **Affiliate Program**: Commission-based referrals

### Commerce Features
- **Multi-Language**: EN/KO/ZH support throughout
- **Multi-Currency**: GBP/EUR/CHF with real-time conversion
- **Pre-Order Campaigns**: Early access with discounts
- **MOQ Validation**: Per-brand minimum orders
- **Wishlist & Comparison**: Consumer engagement tools

### Order Management
- **9-Status Workflow**: Detailed order lifecycle
- **Invoice Generation**: Automated PDF creation
- **Messaging System**: Order-specific communication
- **Document Management**: Shipping labels, customs forms

## 💼 Business Model

### Revenue Streams
1. **B2B Wholesale Margin**: 25-35% markup on wholesale
2. **B2C Retail Margin**: 60-80% markup on retail
3. **Affiliate Commissions**: 5-15% performance-based
4. **Pre-Order Campaigns**: Cash flow optimization
5. **Featured Placements**: Brand promotion fees

### Value Proposition
- **For Brands**: Global distribution, marketing support
- **For Retailers**: Curated selection, flexible terms
- **For Consumers**: Authentic products, exclusive access
- **For Affiliates**: Competitive commissions, marketing tools

## 👥 User Types

### 1. Admin
- Platform management
- User & order oversight
- Analytics & reporting
- Content moderation

### 2. Retailer (B2B Customer)
- Browse wholesale catalog
- MOQ-based ordering
- Invoice payment terms
- Order tracking

### 3. Brand
- Product management
- Order fulfillment
- Performance analytics
- Messaging with buyers

### 4. Consumer (B2C Customer)
- Shop retail products
- Immediate checkout
- Order history
- Wishlist management

### 5. Affiliate
- Custom discount codes
- Commission tracking
- Performance dashboard
- Payout management

## 📄 Page Structure Overview

### Public Pages (15)
- Landing, About, Contact
- How It Works, For Brands, For Retailers
- Legal pages (Terms, Privacy, etc.)

### Authentication (6)
- Login/Register (B2B & B2C separate)
- Invite validation
- Password recovery

### B2B Commerce (12)
- Brand showcase
- Product catalog
- MOQ cart & checkout
- Order management

### B2C Commerce (15)
- Consumer shop
- Product details
- Unified cart
- Express checkout

### Admin Panel (15)
- Dashboards
- User management
- Product management
- Order processing

### Role Dashboards (12)
- Retailer dashboard
- Brand dashboard
- Affiliate dashboard
- Performance metrics

## 🛤 User Journey Summary

### B2B Retailer Journey
1. Receive invite → Register
2. Browse brands → View products
3. Add to cart → Meet MOQs
4. Checkout → Invoice payment
5. Track order → Receive goods

### B2C Consumer Journey
1. Browse shop → View products
2. Add to cart → Apply discounts
3. Express checkout → Card payment
4. Track order → Leave review

### Admin Workflow
1. Monitor platform → Manage users
2. Process orders → Handle issues
3. Generate reports → Make decisions

## 🔧 Technology Stack

### Frontend
- **Framework**: Nuxt 3 (Vue 3)
- **Styling**: Tailwind CSS + Design Tokens
- **State**: Pinia stores
- **Types**: TypeScript
- **Forms**: VeeValidate + Zod
- **I18n**: @nuxtjs/i18n

### Backend
- **Platform**: Appwrite Cloud
- **Database**: Appwrite Database (NoSQL)
- **Auth**: Appwrite Auth (multi-role)
- **Storage**: Appwrite Storage
- **Functions**: Appwrite Functions
- **Realtime**: Appwrite Realtime

### Integrations
- **Payments**: Stripe (Checkout + Connect)
- **Email**: SendGrid
- **Analytics**: Plausible
- **CDN**: Cloudflare
- **Monitoring**: Sentry

## 🏛 Service Architecture

### Core Services
1. **Authentication Service**
   - Multi-role auth
   - Invite validation
   - Session management

2. **Commerce Service**
   - Product catalog
   - Cart management
   - Order processing

3. **Payment Service**
   - Stripe integration
   - Invoice generation
   - Commission calculation

4. **Messaging Service**
   - Order conversations
   - Notifications
   - Email triggers

5. **Analytics Service**
   - User tracking
   - Sales metrics
   - Performance KPIs

### Data Flow
```
User Action → Nuxt Frontend → API Layer → Appwrite Services → Database
                    ↓                           ↓
                Stripe API                 Email Service
```

## 📊 Database Overview

### Core Collections
- **users**: Multi-role user accounts
- **companies**: Retailer & brand entities
- **products**: Master catalog with variants
- **orders**: Transaction records
- **messages**: Communication threads
- **inviteCodes**: Registration control
- **affiliateCodes**: Discount & commission

### Relationships
- Users ↔ Companies (many-to-one)
- Products ↔ Brands (many-to-one)
- Orders ↔ Users (many-to-one)
- Orders ↔ Products (many-to-many)
- Messages ↔ Orders (many-to-one)

## 🎯 Success Metrics

### Business KPIs
- Monthly Active Retailers
- Average Order Value (AOV)
- Customer Lifetime Value (CLV)
- Gross Merchandise Value (GMV)
- Conversion Rate

### Technical KPIs
- Page Load Time (<2s)
- API Response Time (<200ms)
- Uptime (99.9%)
- Error Rate (<1%)
- Mobile Performance Score (>90)

## 🚦 Getting Started

1. **Prerequisites**
   - Node.js 18+
   - Appwrite Account
   - Stripe Account
   - SendGrid Account

2. **Installation**
   ```bash
   git clone [repository]
   cd lovingyourskin-nuxt
   npm install
   cp .env.example .env
   ```

3. **Configuration**
   - Set up Appwrite project
   - Configure Stripe keys
   - Set environment variables

4. **Development**
   ```bash
   npm run dev
   ```

## 📚 Related Documentation

- [FEATURES.md](./FEATURES.md) - Detailed feature specifications
- [PAGES.md](./PAGES.md) - Complete page architecture
- [JOURNEYS.md](./JOURNEYS.md) - User experience flows
- [SERVICES.md](./SERVICES.md) - External service integrations
- [DATABASE.md](./DATABASE.md) - Schema and data models

## 📝 License

Proprietary - All rights reserved

---

*Building the future of K-Beauty distribution, one component at a time.*