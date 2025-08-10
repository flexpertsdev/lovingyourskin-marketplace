# Stripe Integration Test Guide

## Prerequisites
- Development server running at http://localhost:3011
- Test Stripe keys configured in .env

## Test Flow

### 1. Add Products to Cart
1. Navigate to http://localhost:3011/shop
2. Add any product to cart
3. Go to cart at http://localhost:3011/shop/cart

### 2. Test Discount Code
1. In the cart, click "Have a discount code?"
2. Try entering a test code (you may need to create one in Firebase)
3. Verify discount is applied

### 3. Proceed to Checkout
1. Click "Proceed to Checkout"
2. If not logged in, you'll be redirected to login
3. Fill in the checkout form:
   - Name, Email, Phone
   - Shipping address
4. Click "Continue to Payment"

### 4. Stripe Checkout
- You should be redirected to Stripe's hosted checkout page
- Use test card: 4242 4242 4242 4242
- Any future expiry date and any 3-digit CVC
- Complete the payment

### 5. Success Page
- After successful payment, you'll be redirected to /shop/checkout/success
- The cart should be cleared
- You should see an order confirmation

## Test Card Numbers

### Successful Payment
- 4242 4242 4242 4242 - Visa
- 5555 5555 4444 4242 - Mastercard Debit

### Declined Cards
- 4000 0000 0000 0002 - Card declined
- 4000 0000 0000 9995 - Insufficient funds

## Webhook Testing

For local webhook testing, you'll need to:
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login to Stripe: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook`
4. Update STRIPE_WEBHOOK_SECRET in .env with the signing secret shown

## Current Test Keys
The .env file contains test Stripe keys that allow testing without real payments.
To use your own keys:
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your test publishable and secret keys
3. Update .env file

## Troubleshooting

### Checkout Session Creation Fails
- Check browser console for errors
- Verify Stripe keys are correct in .env
- Check network tab for failed API calls

### Redirect to Stripe Fails
- Ensure VITE_STRIPE_PUBLISHABLE_KEY is set
- Check if Stripe.js loaded correctly
- Look for Content Security Policy errors

### Webhook Not Working
- Webhooks only work in production or with Stripe CLI forwarding
- Check Netlify Functions logs for webhook errors
- Verify FIREBASE_SERVICE_ACCOUNT_KEY is set for order creation