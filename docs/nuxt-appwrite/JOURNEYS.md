# JOURNEYS.md - User Experience Flows

## 🎯 Journey Overview

Comprehensive user flows for all personas, detailing step-by-step interactions, decision points, and system responses.

## 👤 User Personas

### Primary Personas
1. **Sarah** - Retailer (Boutique owner in London)
2. **Min-Jung** - Brand Representative (K-Beauty brand manager)
3. **Emma** - Consumer (Beauty enthusiast, 28)
4. **David** - Admin (Platform operations manager)
5. **Lisa** - Affiliate (Beauty influencer)

---

## 🏪 B2B Retailer Journeys

### 1. Retailer Onboarding Journey
**Persona**: Sarah, boutique owner
**Goal**: Register and start ordering wholesale products

#### Journey Steps:

##### Step 1: Discovery
```
Landing Page → "For Retailers" → Learn about platform
↓
View benefits, MOQ requirements, pricing structure
↓
Click "Request Invite"
```
**Pages**: `/`, `/for-retailers`
**Actions**: Read content, watch video
**Emotions**: Curious → Interested

##### Step 2: Invite Request
```
Fill invite request form:
- Company details
- Business license
- Expected monthly volume
↓
Submit → Receive confirmation email
```
**Database**: Create `invite_requests` entry
**Services**: SendGrid email
**Wait Time**: 24-48 hours for approval

##### Step 3: Registration
```
Receive invite code via email → Click link
↓
Enter invite code → Validate
↓
Complete registration:
- Personal details
- Company association (auto-filled)
- Password creation
↓
Email verification
```
**Pages**: `/register`
**Database**: 
- Validate `invite_codes.code`
- Create `users` entry
- Link to `companies`
**State**: `authState.user = newUser`

##### Step 4: First Login
```
Login → Retailer Dashboard
↓
Welcome tour (optional)
↓
Complete profile:
- Shipping address
- Billing information
- Tax ID
```
**Pages**: `/login`, `/retailer/dashboard`, `/profile`
**Features**: Onboarding checklist

##### Step 5: First Browse
```
Explore brands → View products
↓
Understand MOQ indicators
↓
Add items to cart
```
**Pages**: `/brands`, `/products`
**Education**: MOQ tooltips, help videos

##### Success Metrics:
- Time to first order: <7 days
- Profile completion: 100%
- First order value: >£1,500

---

### 2. B2B Purchasing Journey
**Persona**: Sarah (returning customer)
**Goal**: Place a wholesale order meeting MOQ requirements

#### Journey Steps:

##### Step 1: Browse Catalog
```
Login → Dashboard → "Browse Brands"
↓
Filter by:
- Category (skincare)
- Certifications (vegan)
- MOQ range
↓
Select brand (MOQ: £500)
```
**Pages**: `/brands`
**Database**: Query `products` with filters
**State**: `catalogState.filters`

##### Step 2: Product Selection
```
View brand products → Check wholesale prices
↓
Select product → Choose variants:
- Size: 50ml
- Quantity: 24 units (2 cartons)
↓
"Add to Cart" → Continue shopping
```
**Pages**: `/brands/:id`, `/products/:id`
**Validation**: Check inventory.b2b.available
**Cart State**: `cartState.addItem()`

##### Step 3: MOQ Management
```
Cart shows MOQ progress:
Brand A: £350/£500 (70%) ⚠️
↓
System suggests:
"Add £150 more to meet MOQ"
↓
View suggested products → Add bestseller
↓
MOQ met: £520/£500 ✓
```
**Pages**: `/cart`
**Features**: MOQ validation, product suggestions
**Components**: `<MOQProgress />`, `<SuggestedProducts />`

##### Step 4: Checkout Process
```
Review cart → Proceed to checkout
↓
Step 1: Confirm shipping address
Step 2: Review order
Step 3: Select payment terms (NET 30)
Step 4: Accept T&C
↓
Place order → Receive confirmation
```
**Pages**: `/checkout`
**Database**: 
- Create `orders` document
- Update inventory
- Generate invoice
**Services**: 
- Stripe Invoice creation
- SendGrid confirmation email

##### Step 5: Post-Purchase
```
Order confirmation page
↓
Email: Invoice PDF + Order details
↓
Dashboard: Track order status
↓
Messages: Communicate with brand
```
**Pages**: `/orders/:id`, `/messages`
**Timeline**: 
- Day 0: Order placed
- Day 1: Order confirmed
- Day 3: Shipped
- Day 5: Delivered
- Day 30: Payment due

##### Friction Points:
- MOQ confusion (solved with progress bars)
- Payment terms unclear (added explanations)
- Shipping costs surprise (early calculation)

---

### 3. Reorder Journey
**Persona**: Sarah (frequent buyer)
**Goal**: Quickly reorder previous items

#### Quick Reorder Flow:
```
Dashboard → "Recent Orders" → Find order
↓
Click "Reorder" → Items added to cart
↓
Adjust quantities if needed
↓
Express checkout (saved details)
↓
Order placed in <2 minutes
```
**Pages**: `/retailer/dashboard`, `/cart`, `/checkout`
**Features**: One-click reorder, saved preferences

---

## 🛍 B2C Consumer Journeys

### 4. Consumer Shopping Journey
**Persona**: Emma, beauty enthusiast
**Goal**: Purchase K-Beauty products for personal use

#### Journey Steps:

##### Step 1: Discovery
```
Social media ad → Landing page
↓
Browse without login
↓
See product → Click for details
```
**Pages**: `/shop`
**State**: Guest browsing
**Tracking**: UTM parameters, analytics

##### Step 2: Product Exploration
```
Product detail page:
- View images gallery
- Read ingredients
- Check reviews (4.5 stars)
↓
Select variant (Rose Gold shade)
↓
"Add to Cart" → Continue shopping
```
**Pages**: `/shop/products/:id`
**Features**: 
- Image zoom
- Review display
- Variant selector
**State**: `cartState.b2c.addItem()`

##### Step 3: Cart Review
```
View cart → See recommendations
↓
Apply influencer code "LISA20"
↓
Discount applied: -20%
↓
Free shipping threshold: £50
Current: £45 → Add one more item
```
**Pages**: `/shop/cart`
**Database**: Validate `affiliate_codes`
**Features**: 
- Discount application
- Shipping calculator
- Recommendations

##### Step 4: Checkout
```
Click "Checkout" → Prompted to login
↓
Choose: Create account / Guest checkout
↓
Enter shipping address
↓
Payment: Apple Pay (one-click)
↓
Order complete!
```
**Pages**: `/shop/checkout`
**Services**: Stripe Checkout Session
**Features**: 
- Express payment buttons
- Guest checkout
- Address autocomplete

##### Step 5: Post-Purchase
```
Success page → Order #12345
↓
Email: Receipt + Tracking
↓
Create account prompt (10% off next order)
↓
Track order → Delivered
↓
Review prompt after 7 days
```
**Pages**: `/shop/checkout/success`
**Email Flow**: 
- Immediate: Order confirmation
- Day 2: Shipping notification
- Day 5: Delivered
- Day 7: Review request
- Day 30: Replenishment reminder

---

### 5. Pre-Order Campaign Journey
**Persona**: Emma
**Goal**: Get early access to new products with discount

#### Journey Steps:

##### Step 1: Campaign Discovery
```
Email: "Exclusive Pre-Order: 30% Off"
↓
Click → Pre-order landing page
↓
Countdown timer: "Ends in 48 hours"
```
**Pages**: `/shop/preorders`
**Urgency**: Limited time, limited quantity

##### Step 2: Product Selection
```
View pre-order products
↓
"Pre-Order" badge + "30% Off"
↓
Add multiple items to pre-order cart
↓
Cart shows: Ships in 4 weeks
```
**Pages**: `/shop/preorders/:campaignId`
**State**: `cartState.preorderCart`
**UI**: Clear pre-order indicators

##### Step 3: Pre-Order Checkout
```
Special pre-order checkout
↓
Payment upfront
↓
Clear shipping timeline
↓
Order confirmation
```
**Pages**: `/shop/checkout?mode=preorder`
**Messaging**: 
- "Payment now, ships March 15"
- "You saved £45 with pre-order discount"

##### Step 4: Waiting Period
```
Weekly updates via email
↓
"Your pre-order is being prepared"
↓
Shipping notification
↓
Delivered
```
**Timeline**: 4-week wait
**Engagement**: Status updates, sneak peeks

---

## 👨‍💼 Admin Journeys

### 6. Admin Order Management Journey
**Persona**: David, operations manager
**Goal**: Process daily orders efficiently

#### Daily Workflow:

##### Morning Review:
```
Login → Admin Dashboard
↓
View KPIs:
- New orders: 23
- Pending confirmation: 5
- Issues: 2
↓
Click "Pending Orders"
```
**Pages**: `/admin`, `/admin/orders`
**Priority**: Issues first, then pending

##### Order Processing:
```
Select order → Review details
↓
Check inventory availability
↓
Confirm order → Status: Confirmed
↓
Auto-email to customer
↓
Notify brand → Prepare shipment
```
**Database**: Update `orders.status`
**Automation**: Status change triggers

##### Issue Resolution:
```
Payment failed order → Contact customer
↓
Open message thread
↓
Resolve payment → Update status
↓
Close issue
```
**Pages**: `/admin/orders/:id`, `/admin/messages`
**SLA**: Respond within 2 hours

---

### 7. Admin User Management Journey
**Persona**: David
**Goal**: Onboard new retailer

#### Steps:
```
Receive invite request → Review application
↓
Verify business details
↓
Approve → Generate invite code
↓
Send invite email
↓
Monitor registration
↓
First order → Check-in call
```
**Pages**: `/admin/users`
**Database**: Create `invite_codes`
**Timeline**: 48-hour approval SLA

---

## 🤝 Brand Journeys

### 8. Brand Order Fulfillment Journey
**Persona**: Min-Jung, brand manager
**Goal**: Fulfill retailer orders efficiently

#### Order Receipt:
```
Email notification: "New order #4567"
↓
Login → Brand Dashboard
↓
View order details:
- Retailer: Sarah's Boutique
- Products: 5 SKUs
- Total: £2,500
```
**Pages**: `/brand/dashboard`, `/brand/orders`
**Real-time**: Instant notifications

#### Fulfillment Process:
```
Review inventory → All available ✓
↓
Print packing list
↓
Prepare shipment
↓
Generate shipping label
↓
Update status: "Shipped"
↓
Enter tracking number
```
**Features**: 
- Packing list generation
- Shipping integration
- Status updates

#### Communication:
```
Order message: "Shipment delayed 1 day"
↓
Retailer responds: "No problem"
↓
Ship next day → Update tracking
```
**Pages**: `/brand/orders/:id/messages`
**SLA**: Respond within 4 hours

---

## 💰 Affiliate Journeys

### 9. Affiliate Onboarding Journey
**Persona**: Lisa, beauty influencer
**Goal**: Start earning commissions

#### Registration:
```
Receive affiliate invite → Enter code
↓
Register with affiliate role
↓
Complete profile:
- Social media links
- Audience demographics
- Payment details (Stripe Connect)
```
**Pages**: `/register`, `/affiliate/dashboard`
**Database**: Create affiliate user

#### Code Creation:
```
Dashboard → "Create Code"
↓
Code: "LISA20"
Settings:
- Customer discount: 20%
- Commission: 10%
↓
Generate marketing materials
```
**Pages**: `/affiliate/codes`
**Assets**: Banners, links, copy

#### Performance Tracking:
```
Share code on Instagram
↓
Track in dashboard:
- Uses: 47
- Sales: £3,200
- Commission: £320
↓
Monthly payout via Stripe
```
**Real-time**: Live statistics
**Payments**: Automated monthly

---

## 🔄 Cross-Journey Touchpoints

### Email Journeys

#### Welcome Series (B2C):
```
Day 0: Welcome + 10% off
Day 3: Brand story
Day 7: Bestsellers
Day 14: Skincare tips
Day 21: Exclusive offer
```

#### Abandoned Cart:
```
1 hour: Reminder
24 hours: 10% discount
72 hours: Last chance
```

#### Re-engagement:
```
30 days inactive: We miss you + 15% off
60 days: Exclusive preview
90 days: Final offer
```

### Customer Service Journeys

#### Return Request:
```
Order page → "Request Return"
↓
Select items + reason
↓
Generate return label
↓
Ship back → Refund processed
```
**Timeline**: 5-7 days
**Pages**: `/orders/:id/return`

#### Support Ticket:
```
Contact form → Ticket created
↓
Auto-response with ticket #
↓
Agent responds within 4 hours
↓
Resolution → Satisfaction survey
```
**SLA**: First response 4 hours
**Resolution**: 24-48 hours

---

## 📊 Journey Analytics

### Key Metrics

#### Conversion Funnels:
```
B2B Funnel:
Visit → Register: 15%
Register → Browse: 90%
Browse → Cart: 40%
Cart → Purchase: 60%
Overall: 3.2%

B2C Funnel:
Visit → Product View: 45%
View → Cart: 12%
Cart → Purchase: 68%
Overall: 3.7%
```

#### Drop-off Points:
1. **Registration** (B2B): Invite code confusion
2. **Cart** (B2B): MOQ requirements
3. **Checkout** (B2C): Account creation friction
4. **Payment**: Unexpected shipping costs

### Optimization Opportunities:
- Simplify invite code entry
- Better MOQ education
- Guest checkout prominence
- Earlier shipping calculation

---

## 🎯 Journey Optimization

### A/B Tests Running:
1. **Checkout Flow**: Multi-step vs. single page
2. **MOQ Display**: Progress bar vs. text
3. **Cart Recovery**: Discount vs. free shipping
4. **Registration**: Required vs. optional

### Personalization:
- **Returning Visitors**: Show previously viewed
- **Frequent Buyers**: VIP pricing tiers
- **Abandoned Carts**: Targeted recovery
- **Location-Based**: Currency, shipping

---

## 🔗 Journey Cross-References

### Journeys → Pages:
- Onboarding → `/register`, `/profile`
- Shopping → `/shop`, `/products`, `/cart`
- Checkout → `/checkout`, `/success`
- Management → `/admin/*`, `/brand/*`

### Journeys → Features:
- MOQ Journey → MOQ Validation System
- Checkout → Payment Processing
- Affiliate → Commission Tracking
- Pre-order → Campaign Management

### Journeys → Database:
- Registration → `users`, `companies`
- Shopping → `products`, `carts`
- Orders → `orders`, `invoices`
- Messages → `messages`

### Journeys → Services:
- Payment → Stripe
- Email → SendGrid
- Auth → Appwrite Auth
- Analytics → Plausible

---

## 📱 Mobile Journey Adaptations

### Mobile-Specific Flows:
- One-thumb navigation
- Bottom sheet filters
- Swipe galleries
- Touch ID/Face ID checkout
- App-like experience (PWA)

### Mobile Optimizations:
- Larger touch targets
- Simplified forms
- Progressive disclosure
- Offline cart persistence
- Push notifications

---

## 🚀 Future Journey Enhancements

### Planned Improvements:
1. **AI Recommendations**: Personalized product suggestions
2. **Virtual Try-On**: AR for makeup products
3. **Subscription Model**: Auto-replenishment
4. **Live Chat**: Real-time support
5. **Social Commerce**: Instagram shopping
6. **Loyalty Program**: Points and rewards
7. **B2B Financing**: Payment plans
8. **Dropshipping**: Direct from brand

---

## 📚 Related Documentation

- [README.md](./README.md) - Project overview
- [FEATURES.md](./FEATURES.md) - Feature specifications
- [PAGES.md](./PAGES.md) - Page architecture
- [DATABASE.md](./DATABASE.md) - Data schemas
- [SERVICES.md](./SERVICES.md) - External integrations

---

*Comprehensive user journey documentation for the LovingYourSkin marketplace platform.*