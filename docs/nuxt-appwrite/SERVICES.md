# SERVICES.md - External Service Integrations

## 🔌 Service Architecture Overview

LovingYourSkin integrates multiple external services to provide a complete e-commerce platform. Each service is wrapped in a service layer for consistency and testability.

## 🏗 Core Services

### 1. Appwrite Platform Services
**Provider**: Appwrite Cloud
**Purpose**: Backend-as-a-Service platform

#### Authentication Service
```typescript
// appwrite/auth.service.ts
class AuthService {
  async register(email: string, password: string, name: string): Promise<User>
  async login(email: string, password: string): Promise<Session>
  async logout(): Promise<void>
  async getCurrentUser(): Promise<User>
  async updatePassword(oldPassword: string, newPassword: string): Promise<User>
  async sendPasswordRecovery(email: string): Promise<void>
  async confirmPasswordRecovery(userId: string, secret: string, password: string): Promise<void>
  async createJWT(): Promise<JWT>
  async updatePrefs(prefs: Preferences): Promise<User>
}
```

**Configuration**:
```typescript
// appwrite.config.ts
export const appwriteConfig = {
  endpoint: process.env.APPWRITE_ENDPOINT,
  projectId: process.env.APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
}
```

**Multi-Role Implementation**:
```typescript
// Custom role management on top of Appwrite Auth
interface AuthFlow {
  // B2B Registration with invite
  validateInviteCode(code: string): Promise<InviteValidation>
  registerWithInvite(inviteCode: string, userData: RegisterData): Promise<User>
  
  // B2C Registration (open)
  registerConsumer(userData: ConsumerRegisterData): Promise<User>
  
  // Role-based login redirect
  loginWithRoleRedirect(email: string, password: string): Promise<RedirectPath>
}
```

**Security Features**:
- JWT tokens with 1-hour expiry
- Refresh token rotation
- Session management per device
- OAuth providers (Google, Apple)
- Two-factor authentication (TOTP)

---

#### Database Service
```typescript
// appwrite/database.service.ts
class DatabaseService {
  // CRUD Operations
  async create<T>(collectionId: string, data: T): Promise<Document<T>>
  async get<T>(collectionId: string, documentId: string): Promise<Document<T>>
  async update<T>(collectionId: string, documentId: string, data: Partial<T>): Promise<Document<T>>
  async delete(collectionId: string, documentId: string): Promise<void>
  
  // Queries
  async list<T>(collectionId: string, queries?: Query[]): Promise<DocumentList<T>>
  async search<T>(collectionId: string, search: string): Promise<DocumentList<T>>
  
  // Bulk Operations
  async bulkCreate<T>(collectionId: string, documents: T[]): Promise<Document<T>[]>
  async bulkUpdate<T>(collectionId: string, updates: BulkUpdate<T>[]): Promise<Document<T>[]>
}
```

**Query Builder**:
```typescript
// Complex query construction
const orders = await db.list('orders', [
  Query.equal('userId', userId),
  Query.equal('status', 'completed'),
  Query.greaterThan('total', 100),
  Query.orderDesc('createdAt'),
  Query.limit(10)
])
```

**Realtime Subscriptions**:
```typescript
// Subscribe to collection changes
const unsubscribe = db.subscribe('orders', (event) => {
  if (event.type === 'create') {
    // New order created
  } else if (event.type === 'update') {
    // Order updated
  }
})
```

---

#### Storage Service
```typescript
// appwrite/storage.service.ts
class StorageService {
  // File Operations
  async uploadFile(bucketId: string, file: File): Promise<FileUpload>
  async getFileUrl(bucketId: string, fileId: string): string
  async getFilePreview(bucketId: string, fileId: string, options?: PreviewOptions): string
  async deleteFile(bucketId: string, fileId: string): Promise<void>
  
  // Bucket Management
  async createBucket(name: string, permissions: string[]): Promise<Bucket>
  async listFiles(bucketId: string): Promise<FileList>
}
```

**Bucket Structure**:
```
products/          - Product images
  primary/        - Main product images
  gallery/        - Additional images
  variants/       - Variant-specific images
brands/           - Brand logos and banners
documents/        - Invoices, shipping labels
user-uploads/     - User avatars, attachments
```

**Image Processing**:
```typescript
// Generate responsive images
const imageUrl = storage.getFilePreview('products', fileId, {
  width: 800,
  height: 800,
  quality: 85,
  format: 'webp'
})
```

---

#### Functions Service
```typescript
// appwrite/functions.service.ts
class FunctionsService {
  // Execute serverless functions
  async execute(functionId: string, data?: any): Promise<Execution>
  async executeAsync(functionId: string, data?: any): Promise<ExecutionId>
  
  // Scheduled functions
  async schedule(functionId: string, schedule: string): Promise<void>
}
```

**Serverless Functions**:
```typescript
// functions/processOrder.ts
export default async function(req: Request, res: Response) {
  const { orderId } = req.body
  
  // Process order
  await validateInventory(orderId)
  await chargePayment(orderId)
  await sendConfirmationEmail(orderId)
  await notifyBrand(orderId)
  
  return res.json({ success: true })
}
```

**Function Triggers**:
- Order processing
- Email notifications
- Inventory updates
- Report generation
- Cache warming
- Data migrations

---

#### Realtime Service
```typescript
// appwrite/realtime.service.ts
class RealtimeService {
  // Channel subscriptions
  subscribe(channel: string, callback: (event: RealtimeEvent) => void): Unsubscribe
  
  // Specific subscriptions
  subscribeToDocument(collectionId: string, documentId: string, callback: Function): Unsubscribe
  subscribeToCollection(collectionId: string, callback: Function): Unsubscribe
  subscribeToMessages(threadId: string, callback: Function): Unsubscribe
}
```

**Use Cases**:
- Order status updates
- Message notifications
- Inventory changes
- Price updates
- User presence

---

## 💳 Stripe Payment Services

### 2. Stripe Checkout (B2C)
**Purpose**: Immediate payment processing for consumers

#### Checkout Session Creation
```typescript
// services/stripe/checkout.service.ts
interface StripeCheckoutService {
  async createSession(params: {
    items: CartItem[]
    customer: CustomerInfo
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
  }): Promise<CheckoutSession>
}
```

**Implementation**:
```typescript
async createB2CCheckoutSession(data: CheckoutData) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'apple_pay', 'google_pay'],
    line_items: data.items.map(item => ({
      price_data: {
        currency: data.currency,
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: [item.product.image],
          metadata: {
            productId: item.product.id,
            variantId: item.variantId
          }
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    })),
    mode: 'payment',
    success_url: `${BASE_URL}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/shop/cart`,
    customer_email: data.customer.email,
    shipping_address_collection: {
      allowed_countries: ['GB', 'FR', 'DE', 'CH']
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: data.currency },
          display_name: 'Free shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 7 }
          }
        }
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 999, currency: data.currency },
          display_name: 'Express shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 2 },
            maximum: { unit: 'business_day', value: 3 }
          }
        }
      }
    ],
    // Discount codes
    allow_promotion_codes: true,
    // Affiliate tracking
    metadata: {
      affiliateCode: data.affiliateCode,
      affiliateUserId: data.affiliateUserId,
      orderType: 'b2c'
    },
    // Tax calculation
    automatic_tax: { enabled: true },
    // Invoice generation
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: 'Order from LovingYourSkin',
        metadata: { orderId: data.orderId },
        custom_fields: [
          { name: 'Order Number', value: data.orderNumber }
        ]
      }
    }
  })
  
  return session
}
```

**Webhook Handling**:
```typescript
// webhooks/stripe.webhook.ts
async handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object)
      break
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object)
      break
  }
}

async handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Update order status
  await updateOrder(session.metadata.orderId, {
    status: 'paid',
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent
  })
  
  // Process affiliate commission
  if (session.metadata.affiliateCode) {
    await processAffiliateCommission({
      code: session.metadata.affiliateCode,
      orderId: session.metadata.orderId,
      amount: session.amount_total
    })
  }
  
  // Send confirmation email
  await sendOrderConfirmation(session.metadata.orderId)
  
  // Update inventory
  await updateInventory(session.metadata.orderId)
}
```

---

### 3. Stripe Invoicing (B2B)
**Purpose**: Invoice-based payments with terms for retailers

#### Invoice Creation
```typescript
// services/stripe/invoice.service.ts
interface StripeInvoiceService {
  async createInvoice(params: {
    customer: B2BCustomer
    items: InvoiceItem[]
    paymentTerms: number // Days
    metadata?: Record<string, string>
  }): Promise<Invoice>
  
  async sendInvoice(invoiceId: string): Promise<Invoice>
  async markPaid(invoiceId: string): Promise<Invoice>
  async voidInvoice(invoiceId: string): Promise<Invoice>
}
```

**B2B Invoice Flow**:
```typescript
async createB2BInvoice(orderData: B2BOrder) {
  // Create or get Stripe customer
  const customer = await stripe.customers.create({
    email: orderData.company.email,
    name: orderData.company.name,
    address: {
      line1: orderData.company.address.street,
      city: orderData.company.address.city,
      postal_code: orderData.company.address.postalCode,
      country: orderData.company.address.country
    },
    metadata: {
      companyId: orderData.company.id,
      taxId: orderData.company.taxId
    }
  })
  
  // Create invoice items
  for (const item of orderData.items) {
    await stripe.invoiceItems.create({
      customer: customer.id,
      price_data: {
        currency: orderData.currency,
        product: item.productId,
        unit_amount: Math.round(item.wholesalePrice * 100)
      },
      quantity: item.quantity,
      description: `${item.productName} - Wholesale`,
      metadata: {
        orderId: orderData.id,
        productId: item.productId
      }
    })
  }
  
  // Create invoice
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: 'send_invoice',
    days_until_due: orderData.paymentTerms || 30,
    description: `Order #${orderData.orderNumber}`,
    metadata: {
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      orderType: 'b2b'
    },
    custom_fields: [
      { name: 'Purchase Order', value: orderData.poNumber },
      { name: 'VAT Number', value: orderData.company.taxId }
    ],
    footer: 'Payment terms: NET ' + (orderData.paymentTerms || 30)
  })
  
  // Send invoice
  await stripe.invoices.sendInvoice(invoice.id)
  
  return invoice
}
```

**Payment Terms Management**:
```typescript
// Payment terms based on customer history
function getPaymentTerms(customer: B2BCustomer): number {
  if (customer.orderCount === 0) return 15 // First order: NET 15
  if (customer.orderCount < 5) return 30  // NET 30
  if (customer.totalSpent > 10000) return 60 // VIP: NET 60
  return 30 // Default: NET 30
}
```

---

### 4. Stripe Connect (Affiliate Payouts)
**Purpose**: Automated commission payouts to affiliates

#### Affiliate Onboarding
```typescript
// services/stripe/connect.service.ts
interface StripeConnectService {
  async createConnectedAccount(affiliate: Affiliate): Promise<ConnectedAccount>
  async createAccountLink(accountId: string): Promise<AccountLink>
  async createPayout(accountId: string, amount: number): Promise<Transfer>
  async getBalance(accountId: string): Promise<Balance>
}
```

**Connect Account Setup**:
```typescript
async onboardAffiliate(userId: string) {
  const user = await getUser(userId)
  
  // Create connected account
  const account = await stripe.accounts.create({
    type: 'express',
    country: user.country,
    email: user.email,
    capabilities: {
      transfers: { requested: true }
    },
    metadata: {
      userId: user.id,
      affiliateCode: user.affiliateCode
    }
  })
  
  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${BASE_URL}/affiliate/onboarding/refresh`,
    return_url: `${BASE_URL}/affiliate/dashboard`,
    type: 'account_onboarding'
  })
  
  // Save Stripe account ID
  await updateUser(userId, {
    stripeConnectId: account.id,
    stripeOnboardingComplete: false
  })
  
  return accountLink.url
}
```

**Commission Processing**:
```typescript
async processMonthlyCommissions() {
  const affiliates = await getAffiliatesWithPendingCommissions()
  
  for (const affiliate of affiliates) {
    const commission = await calculateCommission(affiliate.id)
    
    if (commission.amount > 10) { // Minimum payout threshold
      // Create transfer
      const transfer = await stripe.transfers.create({
        amount: Math.round(commission.amount * 100),
        currency: 'gbp',
        destination: affiliate.stripeConnectId,
        description: `Commission for ${commission.month}`,
        metadata: {
          affiliateId: affiliate.id,
          month: commission.month,
          orderCount: commission.orderCount
        }
      })
      
      // Record payout
      await createPayout({
        affiliateId: affiliate.id,
        amount: commission.amount,
        stripeTransferId: transfer.id,
        status: 'paid',
        month: commission.month
      })
      
      // Send notification
      await sendPayoutNotification(affiliate.id, commission)
    }
  }
}
```

---

## 📧 Email Services

### 5. SendGrid Email Service
**Purpose**: Transactional and marketing emails

#### Email Service Implementation
```typescript
// services/email/sendgrid.service.ts
class SendGridService {
  // Transactional Emails
  async sendOrderConfirmation(order: Order): Promise<void>
  async sendShippingNotification(order: Order, tracking: TrackingInfo): Promise<void>
  async sendInvoice(invoice: Invoice): Promise<void>
  async sendPasswordReset(email: string, token: string): Promise<void>
  
  // Marketing Emails
  async sendWelcomeSeries(user: User): Promise<void>
  async sendAbandonedCart(cart: Cart): Promise<void>
  async sendNewsletterLink: string): Promise<void>
  
  // Bulk Operations
  async sendBulkEmail(recipients: string[], template: string, data: any): Promise<void>
}
```

**Email Templates**:
```typescript
// Email template configuration
const emailTemplates = {
  // Transactional
  ORDER_CONFIRMATION: 'd-order-confirmation-template-id',
  INVOICE_B2B: 'd-invoice-b2b-template-id',
  SHIPPING_NOTIFICATION: 'd-shipping-notification-template-id',
  PASSWORD_RESET: 'd-password-reset-template-id',
  
  // Marketing
  WELCOME_B2C: 'd-welcome-consumer-template-id',
  WELCOME_B2B: 'd-welcome-retailer-template-id',
  ABANDONED_CART: 'd-abandoned-cart-template-id',
  REORDER_REMINDER: 'd-reorder-reminder-template-id',
  
  // Affiliate
  COMMISSION_PAYOUT: 'd-commission-payout-template-id',
  PERFORMANCE_REPORT: 'd-performance-report-template-id'
}
```

**Dynamic Email Content**:
```typescript
async sendOrderConfirmation(order: Order) {
  const msg = {
    to: order.customerEmail,
    from: 'orders@lovingyourskin.com',
    templateId: emailTemplates.ORDER_CONFIRMATION,
    dynamicTemplateData: {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: formatCurrency(item.price, order.currency),
        image: item.productImage
      })),
      subtotal: formatCurrency(order.subtotal, order.currency),
      shipping: formatCurrency(order.shipping, order.currency),
      tax: formatCurrency(order.tax, order.currency),
      total: formatCurrency(order.total, order.currency),
      shippingAddress: formatAddress(order.shippingAddress),
      estimatedDelivery: formatDate(order.estimatedDelivery),
      trackingUrl: order.trackingUrl
    }
  }
  
  await sgMail.send(msg)
  
  // Log email sent
  await logEmail({
    type: 'order_confirmation',
    recipient: order.customerEmail,
    orderId: order.id,
    sentAt: new Date()
  })
}
```

**Email Automation Flows**:
```typescript
// Abandoned cart recovery
async function abandonedCartFlow() {
  const abandonedCarts = await getAbandonedCarts({
    lastActivity: { $lt: Date.now() - 3600000 }, // 1 hour
    emailSent: false
  })
  
  for (const cart of abandonedCarts) {
    // First email: 1 hour
    await sendAbandonedCartEmail(cart, {
      subject: "You left something behind!",
      discount: 0
    })
    
    // Schedule follow-ups
    await scheduleEmail(cart.userId, 'ABANDONED_CART_24H', { delay: '24h', discount: 10 })
    await scheduleEmail(cart.userId, 'ABANDONED_CART_72H', { delay: '72h', discount: 15 })
  }
}
```

---

## 📊 Analytics Services

### 6. Plausible Analytics
**Purpose**: Privacy-focused web analytics

#### Analytics Implementation
```typescript
// services/analytics/plausible.service.ts
class PlausibleService {
  // Page tracking
  trackPageView(path: string, props?: any): void
  
  // Event tracking
  trackEvent(name: string, props?: EventProps): void
  
  // E-commerce events
  trackPurchase(order: Order): void
  trackAddToCart(product: Product): void
  trackCheckoutStarted(value: number): void
  
  // Custom goals
  trackGoal(goal: string, props?: any): void
}
```

**E-commerce Tracking**:
```typescript
// Track conversion funnel
plausible.trackEvent('Product Viewed', {
  productId: product.id,
  productName: product.name,
  category: product.category,
  price: product.price
})

plausible.trackEvent('Add to Cart', {
  productId: product.id,
  quantity: quantity,
  value: product.price * quantity
})

plausible.trackEvent('Checkout Started', {
  value: cart.total,
  items: cart.items.length
})

plausible.trackEvent('Purchase', {
  orderId: order.id,
  value: order.total,
  currency: order.currency,
  items: order.items.length
})
```

---

## 🔍 Search Services

### 7. Algolia Search (Future)
**Purpose**: Advanced product search and discovery

#### Search Configuration
```typescript
// services/search/algolia.service.ts
interface AlgoliaService {
  // Indexing
  async indexProduct(product: Product): Promise<void>
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void>
  async deleteProduct(productId: string): Promise<void>
  
  // Searching
  async search(query: string, filters?: SearchFilters): Promise<SearchResults>
  async searchWithFacets(query: string, facets: string[]): Promise<FacetedResults>
  async getSuggestions(query: string): Promise<string[]>
}
```

---

## 🚚 Shipping Services

### 8. ShipStation Integration (Future)
**Purpose**: Shipping label generation and tracking

```typescript
// services/shipping/shipstation.service.ts
interface ShipStationService {
  async createShipment(order: Order): Promise<Shipment>
  async generateLabel(shipment: Shipment): Promise<ShippingLabel>
  async trackPackage(trackingNumber: string): Promise<TrackingInfo>
  async calculateRates(params: RateParams): Promise<ShippingRate[]>
}
```

---

## 🎨 CDN & Media Services

### 9. Cloudflare CDN
**Purpose**: Global content delivery and optimization

#### CDN Configuration
```typescript
// Image optimization
const imageUrl = `https://cdn.lovingyourskin.com/resize=w:800,h:800,fit:cover,f:webp/${originalUrl}`

// Cache headers
response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
response.headers.set('CDN-Cache-Control', 'max-age=31536000')
```

---

## 🔔 Notification Services

### 10. Push Notifications (PWA)
**Purpose**: Browser push notifications

```typescript
// services/notifications/push.service.ts
class PushService {
  async requestPermission(): Promise<boolean>
  async subscribe(userId: string): Promise<PushSubscription>
  async sendNotification(userId: string, notification: Notification): Promise<void>
  async sendBulkNotification(userIds: string[], notification: Notification): Promise<void>
}
```

---

## 🤖 AI Services (Future)

### 11. OpenAI Integration
**Purpose**: Product recommendations and customer support

```typescript
// services/ai/openai.service.ts
interface OpenAIService {
  async getProductRecommendations(user: User, context: Context): Promise<Product[]>
  async generateProductDescription(product: Product): Promise<string>
  async chatSupport(message: string, context: ChatContext): Promise<string>
}
```

---

## 🔧 Service Configuration

### Environment Variables
```env
# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SendGrid
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=hello@lovingyourskin.com
SENDGRID_FROM_NAME=LovingYourSkin

# Plausible
PLAUSIBLE_DOMAIN=lovingyourskin.com
PLAUSIBLE_API_KEY=xxx

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_API_TOKEN=xxx
```

### Service Initialization
```typescript
// services/index.ts
import { AppwriteService } from './appwrite'
import { StripeService } from './stripe'
import { SendGridService } from './sendgrid'
import { PlausibleService } from './plausible'

export const services = {
  auth: new AppwriteService.Auth(),
  database: new AppwriteService.Database(),
  storage: new AppwriteService.Storage(),
  functions: new AppwriteService.Functions(),
  realtime: new AppwriteService.Realtime(),
  
  payment: new StripeService(),
  email: new SendGridService(),
  analytics: new PlausibleService()
}
```

---

## 🔒 Security Considerations

### API Key Management
- Store keys in environment variables
- Use server-side functions for sensitive operations
- Rotate keys regularly
- Implement rate limiting

### Webhook Security
```typescript
// Verify webhook signatures
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

### PCI Compliance
- Never store credit card details
- Use Stripe Elements for card input
- Implement CSP headers
- Regular security audits

---

## 📈 Service Monitoring

### Health Checks
```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    appwrite: await checkAppwrite(),
    stripe: await checkStripe(),
    sendgrid: await checkSendGrid(),
    timestamp: new Date()
  }
  
  res.json(health)
})
```

### Error Tracking (Sentry)
```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app })
  ],
  tracesSampleRate: 0.1
})
```

---

## 🚀 Deployment Considerations

### Service Regions
- Appwrite: EU-West (Frankfurt)
- Stripe: Global
- SendGrid: Global
- Cloudflare: Global edge network

### Failover Strategy
- Primary: Appwrite Cloud
- Backup: Self-hosted Appwrite
- CDN fallback: Multiple providers
- Email fallback: AWS SES

### Performance Optimization
- Cache API responses
- Batch operations
- Async processing
- Queue management

---

## 📚 Related Documentation

- [README.md](./README.md) - Project overview
- [FEATURES.md](./FEATURES.md) - Feature specifications
- [DATABASE.md](./DATABASE.md) - Database schemas
- [PAGES.md](./PAGES.md) - Page architecture
- [JOURNEYS.md](./JOURNEYS.md) - User flows

---

*Comprehensive external service integration documentation for the LovingYourSkin marketplace platform.*