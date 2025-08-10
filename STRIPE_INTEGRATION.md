# Stripe Integration Documentation

## Overview
This e-commerce platform uses Stripe for payment processing with support for affiliate tracking and discount codes.

## Architecture

### Components
1. **Frontend Components**
   - `ConsumerCart.tsx` - Shopping cart with discount code input
   - `ConsumerCheckout.tsx` - Checkout form that creates Stripe session
   - `CheckoutSuccess.tsx` - Success page after payment
   - `DiscountCodeInput.tsx` - Discount code entry component

2. **Services**
   - `stripe.service.ts` - Stripe API client
   - `affiliate.service.ts` - Affiliate code validation

3. **Serverless Functions** (Netlify Functions)
   - `stripe-checkout.ts` - Creates Stripe checkout sessions
   - `stripe-webhook.ts` - Handles Stripe webhooks
   - `stripe-customer.ts` - Customer management

4. **State Management**
   - `consumer-cart.store.ts` - Cart state with affiliate tracking
   - `useAffiliateTracking.ts` - Hook for UTM parameter tracking

## Setup Instructions

### 1. Stripe Account Setup
1. Create a Stripe account at https://stripe.com
2. Get your test API keys from https://dashboard.stripe.com/test/apikeys
3. Note your:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)

### 2. Environment Variables
Update `.env` with your Stripe keys:
```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Firebase Admin SDK (for webhook order creation)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 3. Firebase Service Account
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Copy the values to your .env file

### 4. Webhook Configuration

#### Local Development
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local Netlify Functions
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook

# Copy the webhook signing secret shown and update STRIPE_WEBHOOK_SECRET in .env
```

#### Production (Netlify) - REQUIRED SETUP
1. **Deploy to Netlify first**
2. **Go to Stripe Dashboard**: https://dashboard.stripe.com/webhooks
3. **Click "Add endpoint"**
4. **Endpoint URL**: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
5. **Select events to listen for**:
   - `checkout.session.completed` (Required for order creation)
   - `payment_intent.succeeded` (For payment confirmation)
   - `payment_intent.payment_failed` (For error handling)
   - `customer.created` (Optional - for customer tracking)
   - `customer.updated` (Optional - for customer updates)
6. **Copy the signing secret** (starts with `whsec_`)
7. **Add to Netlify Environment Variables**:
   - Go to Netlify > Site Settings > Environment Variables
   - Add all these variables:
     ```
     STRIPE_SECRET_KEY=sk_live_51PNvQd...
     STRIPE_WEBHOOK_SECRET=whsec_...
     FIREBASE_PROJECT_ID=lovingyourskinshop
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@lovingyourskinshop.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
     ```

## Payment Flow

### 1. Cart Page (`/shop/cart`)
- User adds products to cart
- Can enter discount code (affiliate code)
- UTM parameters auto-detected and applied

### 2. Checkout Page (`/shop/checkout`)
- User enters shipping information
- Creates Stripe checkout session
- Redirects to Stripe hosted checkout

### 3. Stripe Checkout
- User enters payment details
- Stripe processes payment
- Redirects to success/cancel URL

### 4. Success Page (`/shop/checkout/success`)
- Shows order confirmation
- Clears cart
- Links to order history

### 5. Webhook Processing
- Stripe sends webhook to Netlify Function
- Function creates order in Firestore
- Updates affiliate statistics
- Creates commission record

## Affiliate System

### UTM Parameter Tracking
URLs with UTM parameters are automatically tracked:
```
https://site.com/shop?utm_source=affiliate&utm_medium=AFFCODE123
```

### Manual Code Entry
Users can enter discount codes in cart:
- Validates against Firebase affiliate codes
- Applies percentage or fixed discounts
- Tracks for commission calculation

### Commission Tracking
When order completes via webhook:
1. Affiliate stats updated (clicks, conversions, revenue)
2. Commission record created
3. Available in admin dashboard

## Testing

### Test Card Numbers
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`

### Test Flow
1. Add products to cart
2. Apply test discount code (if configured)
3. Proceed to checkout
4. Use test card
5. Verify order created in Firestore

## Troubleshooting

### Common Issues

#### "Failed to create checkout session"
- Check Stripe keys in .env
- Verify server is running
- Check browser console for errors

#### Webhook not creating orders
- Verify Firebase Admin credentials
- Check webhook signing secret
- View Netlify Function logs

#### Discount code not working
- Verify affiliate code exists in Firebase
- Check code isn't expired
- Ensure usage limits not exceeded

## Security Considerations

1. **Never expose secret keys** - Only publishable key in frontend
2. **Validate webhook signatures** - Prevents fake webhook calls
3. **Use HTTPS in production** - Required by Stripe
4. **Implement rate limiting** - Prevent abuse
5. **Validate discount codes server-side** - Don't trust client

## Monitoring

### Stripe Dashboard
- View payments: https://dashboard.stripe.com/payments
- Check webhooks: https://dashboard.stripe.com/webhooks
- Review logs: https://dashboard.stripe.com/logs

### Netlify Functions
- View logs: Netlify Dashboard > Functions tab
- Monitor errors and performance

### Firebase
- Check Firestore for created orders
- Monitor affiliate statistics

## Future Enhancements

1. **Subscription support** - Recurring payments
2. **Multiple payment methods** - PayPal, Apple Pay, etc.
3. **Saved payment methods** - For returning customers
4. **Partial refunds** - Admin functionality
5. **Invoice customization** - Custom branding
6. **Tax calculation** - Dynamic based on location
7. **Shipping calculation** - Real-time rates
8. **Inventory sync** - Update stock after purchase