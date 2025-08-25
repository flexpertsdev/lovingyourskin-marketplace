# DATABASE.md - Complete Schema Architecture

## 🗄 Appwrite Database Structure

### Database Configuration
- **Database Name**: `lovingyourskin_production`
- **Region**: EU-West (Frankfurt)
- **Backup**: Daily automated backups
- **Indexes**: Optimized for common queries

## 📊 Collections Schema

### 1. Users Collection
**Collection ID**: `users`
**Description**: Multi-role user accounts with company associations

```typescript
interface User {
  // Appwrite System Fields
  $id: string                    // Appwrite document ID
  $createdAt: string             // ISO timestamp
  $updatedAt: string             // ISO timestamp
  
  // Authentication
  email: string                   // Unique, indexed
  role: UserRole                  // Enum: admin|retailer|brand|consumer|affiliate
  
  // Profile
  name: string
  phoneNumber?: string
  language: 'en' | 'ko' | 'zh'   // UI language preference
  avatar?: string                 // Storage bucket reference
  
  // Associations
  companyId?: string             // Reference to companies collection
  brandId?: string               // For brand users
  salesRepId?: string            // Auto-linked from invite
  affiliateId?: string           // Links to affiliate code
  
  // Consumer Features
  wishlist?: string[]            // Array of product IDs
  addresses?: Address[]          // Embedded documents
  newsletter?: boolean
  
  // Metadata
  lastLoginAt?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  active: boolean
  
  // Settings
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

// Embedded Address Document
interface Address {
  id: string
  label?: string                // "Home", "Work", etc.
  name: string
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}
```

**Indexes**:
- `email` (unique)
- `role`
- `companyId`
- `active`

**Permissions**:
- Read: User can read own document
- Update: User can update own document (except role)
- Create: Public (handled by auth functions)
- Delete: Admin only

---

### 2. Companies Collection
**Collection ID**: `companies`
**Description**: Retailer and brand company entities

```typescript
interface Company {
  $id: string
  $createdAt: string
  $updatedAt: string
  
  // Basic Info
  name: string                   // Indexed
  slug: string                   // URL-safe, unique
  type: 'retailer' | 'brand'
  
  // Contact
  contactEmail: string
  contactPhone: string
  website?: string
  
  // Address
  address: {
    street: string
    city: string
    state?: string
    postalCode: string
    country: string              // ISO code
  }
  
  // Business Details
  taxId?: string                 // VAT/Tax number
  businessLicense?: string
  yearEstablished?: number
  
  // Retailer-specific
  retailerType?: 'online' | 'physical' | 'both'
  storeLocations?: number
  monthlyOrders?: number         // Estimated volume
  
  // Brand-specific
  brandStory?: string
  certifications?: string[]      // Array of certification IDs
  technologies?: Technology[]
  minimumOrder?: number          // MOQ value
  leadTime?: string             // "2-3 weeks"
  
  // Status
  status: 'pending' | 'active' | 'suspended'
  verificationStatus: 'unverified' | 'pending' | 'verified'
  verifiedAt?: string
  
  // Metadata
  applicationDate?: string
  approvedDate?: string
  approvedBy?: string           // Admin user ID
  notes?: string                // Internal notes
  
  // Statistics
  stats: {
    totalOrders: number
    totalRevenue: number
    lastOrderDate?: string
  }
}

interface Technology {
  name: string
  patent?: string
  description: string
}
```

**Indexes**:
- `slug` (unique)
- `type`
- `status`
- `name`

---

### 3. Products Collection
**Collection ID**: `products`
**Description**: Master product catalog with variants

```typescript
interface Product {
  $id: string
  $createdAt: string
  $updatedAt: string
  
  // Identification
  sku: string                    // Master SKU
  slug: string                   // URL-safe, unique
  barcode?: string
  
  // Brand Association
  brandId: string                // Reference to companies
  brandName: string              // Denormalized for performance
  
  // Basic Info
  name: {
    en: string
    ko?: string
    zh?: string
  }
  description: {
    en: string
    ko?: string
    zh?: string
  }
  shortDescription?: {
    en: string
    ko?: string
    zh?: string
  }
  
  // Categorization
  category: string               // Main category
  subcategory?: string
  tags: string[]                 // Searchable tags
  
  // Media
  images: {
    primary: string              // Main image URL
    gallery: string[]            // Additional images
    lifestyle?: string[]         // Lifestyle/usage images
  }
  videos?: string[]              // Video URLs
  
  // Product Details
  ingredients?: {
    en: string
    ko?: string
    zh?: string
  }
  usage?: {
    en: string
    ko?: string
    zh?: string
  }
  benefits?: string[]            // Key benefits list
  
  // Status & Availability
  status: 'draft' | 'active' | 'presale' | 'discontinued' | 'out-of-stock'
  isB2B: boolean                 // Available for wholesale
  isB2C: boolean                 // Available for retail
  featured: boolean
  isNew: boolean
  isBestseller: boolean
  
  // Pre-order Configuration
  isPreorder: boolean
  preorderConfig?: {
    startDate: string
    endDate: string
    discount: number             // Percentage
    minimumQuantity?: number
    maximumQuantity?: number
    estimatedShipDate: string
  }
  
  // Specifications
  specifications: {
    volume?: string              // "50ml", "100g"
    weight?: string
    dimensions?: string
    texture?: string
    scent?: string
    color?: string
    skinType?: string[]          // ["dry", "oily", "combination"]
    concerns?: string[]          // ["acne", "aging", "brightening"]
    keyIngredients?: string[]
    
    // Certifications
    certifications?: string[]    // ["vegan", "cruelty-free", "organic"]
    awards?: string[]
    
    // Sun Protection
    spf?: string
    paRating?: string
    
    // Expiry
    shelfLife?: string          // "24 months"
    pao?: string                // Period After Opening "12M"
    expiryDate?: string
    
    // Clinical
    clinicallyTested?: boolean
    dermatologistTested?: boolean
    hypoallergenic?: boolean
    
    // Origin
    madeIn?: string             // Country
    patent?: string
  }
  
  // Variants
  hasVariants: boolean
  variants: ProductVariant[]
  
  // SEO
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
}

interface ProductVariant {
  variantId: string              // Unique variant ID
  sku: string                    // Variant SKU
  
  // Variant Attributes
  attributes: {
    size?: string                // "30ml", "50ml", "100ml"
    color?: string               // "Rose", "Pearl"
    colorHex?: string            // "#D4A5A5"
    type?: string                // "Cream", "Serum", "Mist"
  }
  
  // Status
  isDefault: boolean
  status: 'active' | 'inactive'
  
  // Inventory
  inventory: {
    b2b: {
      stock: number              // Total stock
      available: number          // Available for sale
      reserved: number           // Reserved in carts/orders
      location?: string          // Warehouse location
    }
    b2c: {
      stock: number
      available: number
      reserved: number
      location?: string
    }
  }
  
  // Pricing
  pricing: {
    b2b: {
      enabled: boolean
      wholesalePrice: number
      minOrderQuantity: number   // MOQ for this variant
      unitsPerCarton?: number
      currency: string
      
      // Tiered Pricing
      tiers?: Array<{
        minQuantity: number
        price: number
      }>
    }
    b2c: {
      enabled: boolean
      retailPrice: number
      compareAtPrice?: number    // Original price for sales
      salePrice?: number
      currency: string
    }
  }
  
  // Media (variant-specific)
  images?: string[]
  
  // Weight & Shipping
  weight?: number                // grams
  dimensions?: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }
}
```

**Indexes**:
- `slug` (unique)
- `brandId`
- `status`
- `category`
- `isB2B`
- `isB2C`
- `featured`

---

### 4. Orders Collection
**Collection ID**: `orders`
**Description**: B2B and B2C order records

```typescript
interface Order {
  $id: string
  $createdAt: string
  $updatedAt: string
  
  // Order Identification
  orderNumber: string            // Human-readable, unique
  orderType: 'b2b' | 'b2c'
  
  // User Association
  userId: string                 // User who placed order
  userEmail: string              // Denormalized
  userName: string               // Denormalized
  
  // B2B Specific
  companyId?: string             // Retailer company
  companyName?: string           // Denormalized
  salesRepId?: string            // Assigned sales rep
  
  // Brand Association
  brandId: string                // Orders are per brand
  brandName: string              // Denormalized
  
  // Status Management
  status: OrderStatus            // 9-status workflow
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  
  // Items
  items: OrderItem[]
  itemCount: number              // Total items
  
  // Pricing
  pricing: {
    subtotal: number
    discount?: {
      code?: string
      type: 'percentage' | 'fixed'
      value: number
      amount: number             // Calculated discount
    }
    shipping: number
    tax: number
    total: number
    currency: string
    
    // B2B Specific
    wholesaleTotal?: number
    markup?: number
  }
  
  // Affiliate Tracking
  affiliate?: {
    code: string                 // Affiliate code used
    userId: string               // Affiliate user ID
    commission: number           // Commission amount
    status: 'pending' | 'approved' | 'paid'
  }
  
  // Shipping
  shippingAddress: {
    name: string
    company?: string
    street: string
    city: string
    state?: string
    postalCode: string
    country: string
    phone?: string
  }
  
  shippingMethod?: {
    carrier: string
    service: string
    trackingNumber?: string
    trackingUrl?: string
    estimatedDelivery?: string
    actualDelivery?: string
  }
  
  // Payment
  payment: {
    method: 'stripe_card' | 'stripe_invoice' | 'bank_transfer' | 'paypal'
    
    // Stripe
    stripeSessionId?: string
    stripePaymentIntentId?: string
    stripeInvoiceId?: string
    stripeCustomerId?: string
    
    // Invoice (B2B)
    invoiceNumber?: string
    invoicePdf?: string
    paymentTerms?: number        // Days
    dueDate?: string
  }
  
  // Timeline
  timeline: OrderEvent[]
  
  // Documents
  documents: OrderDocument[]
  
  // Communication
  messageThreadId?: string       // Reference to messages
  
  // Metadata
  source: 'web' | 'mobile' | 'api' | 'admin'
  ip?: string
  userAgent?: string
  notes?: string                 // Internal notes
  tags?: string[]               // For filtering/organization
}

interface OrderItem {
  productId: string
  variantId?: string
  sku: string
  name: string
  image?: string
  
  // Quantity
  quantity: number
  unit: 'piece' | 'carton' | 'case'
  
  // Pricing
  unitPrice: number
  discount?: number              // Per-item discount
  tax?: number                   // Per-item tax
  total: number
  
  // Status
  fulfillmentStatus?: 'pending' | 'processing' | 'shipped' | 'delivered'
  
  // Metadata
  notes?: string
  customization?: any            // For personalized products
}

interface OrderEvent {
  timestamp: string
  status: OrderStatus
  description: string
  userId?: string                // Who triggered
  metadata?: any
}

interface OrderDocument {
  id: string
  type: 'invoice' | 'receipt' | 'shipping_label' | 'customs' | 'other'
  name: string
  url: string                    // Storage reference
  uploadedAt: string
  uploadedBy?: string
}

// Enums
type OrderStatus = 
  | 'pending'          // Order placed, awaiting confirmation
  | 'confirmed'        // Order confirmed by admin/system
  | 'processing'       // Payment processing
  | 'invoiced'        // Invoice sent (B2B)
  | 'paid'            // Payment received
  | 'preparing'       // Order being prepared
  | 'shipped'         // Order shipped
  | 'delivered'       // Order delivered
  | 'completed'       // Order completed (after return period)
  | 'cancelled'       // Order cancelled
  | 'refunded'        // Order refunded

type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partial'

type FulfillmentStatus =
  | 'unfulfilled'
  | 'partial'
  | 'fulfilled'
  | 'returned'
```

**Indexes**:
- `orderNumber` (unique)
- `userId`
- `companyId`
- `brandId`
- `status`
- `createdAt`

---

### 5. Carts Collection
**Collection ID**: `carts`
**Description**: Shopping cart persistence

```typescript
interface Cart {
  $id: string
  $createdAt: string
  $updatedAt: string
  
  // Owner
  userId: string                 // User ID or session ID
  userType: 'guest' | 'user'
  cartType: 'b2b' | 'b2c' | 'preorder'
  
  // Items
  items: CartItem[]
  
  // MOQ Tracking (B2B)
  moqStatus?: {
    [brandId: string]: {
      brandName: string
      required: number
      current: number
      met: boolean
    }
  }
  
  // Calculations
  totals: {
    items: number
    quantity: number
    subtotal: number
    discount?: number
    estimated_tax?: number
    estimated_shipping?: number
    estimated_total?: number
    currency: string
  }
  
  // Applied Codes
  discountCode?: string
  affiliateCode?: string
  
  // Metadata
  expiresAt?: string            // For guest carts
  lastActivity: string
  source?: string
  abandoned?: boolean
  recoveryEmailSent?: boolean
}

interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  
  // Snapshot of product data
  snapshot: {
    name: string
    image: string
    price: number
    sku: string
  }
  
  // Pre-order
  preOrderDiscount?: number
  
  addedAt: string
  updatedAt: string
}
```

---

### 6. InviteCodes Collection
**Collection ID**: `invite_codes`
**Description**: B2B registration control system

```typescript
interface InviteCode {
  $id: string
  $createdAt: string
  $updatedAt: string
  
  // Code Details
  code: string                   // Unique 6-8 char code
  type: 'single' | 'multi'       // Single or multi-use
  
  // Target
  role: UserRole                 // Role to assign
  email?: string                 // Specific email (single-use)
  companyId?: string             // Pre-assign to company
  salesRepId?: string            // Assign sales rep
  
  // Affiliate Setup
  isAffiliate?: boolean
  affiliateConfig?: {
    commissionPercent: number    // Default commission
    discountPercent: number      // Default customer discount
    tier?: 'bronze' | 'silver' | 'gold'
  }
  
  // Usage
  maxUses?: number               // For multi-use codes
  usedCount: number
  usedBy: string[]               // User IDs
  
  // Validity
  validFrom?: string
  expiresAt: string
  active: boolean
  
  // Metadata
  createdBy: string              // Admin who created
  notes?: string
  tags?: string[]
}
```

---

### 7. AffiliateCodes Collection
**Collection ID**: `affiliate_codes`
**Description**: Public discount codes for affiliates

```typescript
interface AffiliateCode {
  $id: string
  $createdAt: string
  $updatedAt: string
  
  // Code
  code: string                   // Public code "SAVE20"
  
  // Owner
  userId: string                 // Affiliate user
  userName: string               // Display name
  
  // Configuration
  discountType: 'percentage' | 'fixed'
  discountValue: number          // Customer discount
  commissionPercent: number      // Affiliate commission
  
  // Restrictions
  minimumOrder?: number
  maximumDiscount?: number
  validProducts?: string[]       // Product IDs
  validBrands?: string[]         // Brand IDs
  validCategories?: string[]
  
  // Usage Limits
  maxUses?: number
  maxUsesPerCustomer?: number
  
  // Validity
  validFrom?: string
  validUntil?: string
  active: boolean
  
  // Statistics
  stats: {
    usageCount: number
    uniqueCustomers: number
    totalSales: number
    totalDiscount: number
    totalCommission: number
    conversionRate: number
    lastUsed?: string
  }
  
  // Metadata
  description?: string
  campaignName?: string
  tags?: string[]
}
```

---

### 8. Messages Collection
**Collection ID**: `messages`
**Description**: Order-specific communication threads

```typescript
interface MessageThread {
  $id: string
  $createdAt: string
  $updatedAt: string
  
  // Association
  orderId: string                // One thread per order
  orderNumber: string            // Denormalized
  
  // Participants
  participants: Participant[]
  
  // Messages
  messages: Message[]
  messageCount: number
  
  // Status
  status: 'open' | 'closed' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  
  // Unread Tracking
  unreadCounts: {
    [userId: string]: number
  }
  
  // Latest Message (denormalized)
  lastMessage?: {
    content: string
    senderId: string
    senderName: string
    timestamp: string
  }
  
  // Metadata
  tags?: string[]
  assignedTo?: string            // Staff member ID
}

interface Participant {
  userId: string
  name: string
  email: string
  role: 'buyer' | 'seller' | 'admin' | 'system'
  avatar?: string
  joinedAt: string
  lastSeen?: string
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  
  // Content
  type: 'text' | 'system' | 'attachment'
  content: string
  
  // Attachments
  attachments?: Array<{
    id: string
    name: string
    type: string
    size: number
    url: string
  }>
  
  // Status
  readBy: string[]               // User IDs who read
  editedAt?: string
  deletedAt?: string
  
  // Metadata
  metadata?: any                 // System message data
  timestamp: string
}
```

---

### 9. Invoices Collection
**Collection ID**: `invoices`
**Description**: B2B and B2C invoice records

```typescript
interface Invoice {
  $id: string
  $createdAt: string
  $updatedAt: string
  
  // Identification
  invoiceNumber: string          // Sequential, unique
  orderId: string
  orderNumber: string            // Denormalized
  
  // Type
  type: 'b2b' | 'b2c' | 'credit_note'
  
  // Status
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  
  // Parties
  seller: {
    name: string
    address: string
    taxId: string
    email: string
    phone: string
  }
  
  buyer: {
    name: string
    company?: string
    address: string
    taxId?: string
    email: string
    phone?: string
  }
  
  // Line Items
  items: InvoiceItem[]
  
  // Totals
  totals: {
    subtotal: number
    discount?: number
    shipping: number
    taxRate: number
    tax: number
    total: number
    currency: string
  }
  
  // Payment
  paymentTerms?: number          // Days (B2B)
  dueDate?: string               // B2B
  paymentMethod?: string
  
  // Stripe
  stripeInvoiceId?: string
  stripePdfUrl?: string
  stripeHostedUrl?: string
  
  // Documents
  pdfUrl?: string                // Generated PDF
  
  // Timeline
  sentAt?: string
  viewedAt?: string
  paidAt?: string
  reminderSentAt?: string[]
  
  // Notes
  notes?: string                 // Invoice notes
  internalNotes?: string         // Not shown to customer
}

interface InvoiceItem {
  productId?: string
  sku: string
  name: string
  description?: string
  quantity: number
  unit: string
  unitPrice: number
  discount?: number
  tax?: number
  total: number
}
```

---

### 10. PreorderCampaigns Collection
**Collection ID**: `preorder_campaigns`
**Description**: Pre-order campaign management

```typescript
interface PreorderCampaign {
  $id: string
  $createdAt: string
  $updatedAt: string
  
  // Campaign Info
  name: string
  slug: string
  description: string
  
  // Products
  products: Array<{
    productId: string
    variantIds?: string[]
    discount: number             // Percentage
  }>
  
  // Timeline
  startDate: string
  endDate: string
  shipDate: string               // Estimated shipping
  
  // Limits
  minimumOrder?: number
  maximumOrder?: number
  totalQuantityLimit?: number
  perCustomerLimit?: number
  
  // Status
  status: 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled'
  
  // Statistics
  stats: {
    totalOrders: number
    totalQuantity: number
    totalRevenue: number
    uniqueCustomers: number
  }
  
  // Marketing
  bannerImage?: string
  emailTemplate?: string
  landingPage?: string
  
  // Metadata
  createdBy: string
  tags?: string[]
}
```

---

## 🔑 Enums & Constants

### UserRole
```typescript
type UserRole = 'admin' | 'retailer' | 'brand' | 'consumer' | 'affiliate'
```

### Language
```typescript
type Language = 'en' | 'ko' | 'zh'
```

### Currency
```typescript
type Currency = 'GBP' | 'EUR' | 'CHF' | 'USD'
```

### ProductStatus
```typescript
type ProductStatus = 'draft' | 'active' | 'presale' | 'discontinued' | 'out-of-stock'
```

### CertificationType
```typescript
type CertificationType = 
  | 'CPNP'
  | 'CPNP_UK'
  | 'CPNP_EU'
  | 'CPNP_CH'
  | 'VEGAN'
  | 'CRUELTY_FREE'
  | 'EWG'
  | 'DERMATOLOGIST_TESTED'
  | 'CARBON_NEUTRAL'
  | 'ORGANIC'
  | 'HALAL'
```

### PaymentMethod
```typescript
type PaymentMethod = 
  | 'stripe_card'
  | 'stripe_invoice'
  | 'bank_transfer'
  | 'paypal'
  | 'alipay'
  | 'wechat_pay'
```

---

## 🔄 State Management Types

### AuthState
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  permissions: string[]
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}
```

### CartState
```typescript
interface CartState {
  cart: Cart | null
  isLoading: boolean
  
  // B2B
  moqStatus: MOQStatus[]
  canCheckout: boolean
  
  // Actions
  addItem: (product: Product, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  applyDiscount: (code: string) => Promise<void>
}
```

### UIState
```typescript
interface UIState {
  theme: 'light' | 'dark'
  language: Language
  currency: Currency
  
  // Navigation
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  
  // Modals
  activeModal: string | null
  modalData: any
  
  // Notifications
  notifications: Notification[]
  
  // Loading States
  globalLoading: boolean
  loadingTasks: Set<string>
}
```

---

## 🔐 Appwrite Configuration

### Security Rules

#### Users Collection
```javascript
{
  read: ["user:self", "role:admin"],
  create: ["role:admin", "function:auth"],
  update: ["user:self", "role:admin"],
  delete: ["role:admin"]
}
```

#### Orders Collection
```javascript
{
  read: ["user:owner", "role:admin", "role:brand:order.brandId"],
  create: ["user:authenticated", "function:checkout"],
  update: ["role:admin", "role:brand:order.brandId"],
  delete: ["role:admin"]
}
```

#### Products Collection
```javascript
{
  read: ["role:all"],  // Public read
  create: ["role:admin", "role:brand"],
  update: ["role:admin", "role:brand:product.brandId"],
  delete: ["role:admin"]
}
```

### Indexes

#### Compound Indexes
1. **orders_user_status**: `userId` + `status`
2. **products_brand_status**: `brandId` + `status`
3. **messages_order_timestamp**: `orderId` + `timestamp`

#### Text Search Indexes
1. **products_search**: `name.en` + `description.en` + `tags`
2. **brands_search**: `name` + `description`

---

## 📡 API Request/Response Types

### Stripe Checkout Request
```typescript
interface StripeCheckoutRequest {
  mode: 'payment' | 'subscription'
  lineItems: Array<{
    price_data: {
      currency: string
      product_data: {
        name: string
        description?: string
        images?: string[]
      }
      unit_amount: number
    }
    quantity: number
  }>
  customer_email?: string
  success_url: string
  cancel_url: string
  metadata?: Record<string, string>
}
```

### Stripe Webhook Event
```typescript
interface StripeWebhookEvent {
  id: string
  object: 'event'
  type: string
  created: number
  data: {
    object: any  // Varies by event type
  }
  livemode: boolean
  pending_webhooks: number
  request: {
    id: string | null
    idempotency_key: string | null
  }
}
```

### Appwrite Function Context
```typescript
interface AppwriteFunctionContext {
  req: {
    headers: Record<string, string>
    method: string
    url: string
    query: Record<string, string>
    body: any
  }
  res: {
    send: (body: any, status?: number) => void
    json: (data: any, status?: number) => void
    empty: () => void
  }
  log: (message: string) => void
  error: (message: string) => void
}
```

---

## 🔄 Migration from Firebase

### Data Mapping

#### Firebase → Appwrite
- `Firestore Document` → `Appwrite Document`
- `Firebase Auth User` → `Appwrite Account + Users Collection`
- `Cloud Storage` → `Appwrite Storage`
- `Cloud Functions` → `Appwrite Functions`
- `Firestore Timestamp` → `ISO 8601 String`

### Collection Naming
- Firebase: `camelCase` (e.g., `userProfiles`)
- Appwrite: `snake_case` (e.g., `user_profiles`)

### ID Strategy
- Use Appwrite's `ID.unique()` for new documents
- Preserve Firebase IDs during migration for references
- Store Firebase ID in `legacyId` field if needed

---

## 📚 Related Documentation

- [README.md](./README.md) - Project overview
- [FEATURES.md](./FEATURES.md) - Feature specifications
- [PAGES.md](./PAGES.md) - Page architecture
- [JOURNEYS.md](./JOURNEYS.md) - User flows
- [SERVICES.md](./SERVICES.md) - External integrations

---

*Single source of truth for all data structures in the LovingYourSkin marketplace.*