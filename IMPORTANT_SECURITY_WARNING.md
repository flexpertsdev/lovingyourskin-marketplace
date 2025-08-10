# ⚠️ SECURITY WARNING - LIVE STRIPE KEYS IN USE ⚠️

## CRITICAL: This project is currently configured with LIVE Stripe keys!

### Current Configuration:
- **Environment**: LIVE MODE
- **Keys Location**: `.env` file
- **Status**: Real payments will be processed

### Important Notes:

1. **LIVE KEYS ARE ACTIVE** 
   - Any payments made will be REAL transactions
   - Real money will be charged to customers
   - All transactions will appear in your live Stripe dashboard

2. **For Development/Testing**
   - Switch to TEST keys from Stripe Dashboard > API Keys > Test mode
   - Test keys start with `pk_test_` and `sk_test_`
   - Update `.env` file with test keys for development

3. **Security Best Practices**
   - Never commit `.env` file to git (already in .gitignore)
   - Never share your secret key (`sk_live_`) publicly
   - Rotate keys immediately if exposed
   - Use environment variables in production (Netlify, Vercel, etc.)

4. **Webhook Configuration**
   - You still need to configure webhook endpoint in Stripe Dashboard
   - Go to: https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-domain.netlify.app/.netlify/functions/stripe-webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET` in production environment

5. **Before Going Live**
   - Test thoroughly with TEST keys first
   - Verify all checkout flows work correctly
   - Ensure webhook properly creates orders in Firestore
   - Test affiliate tracking and commission calculations
   - Configure proper error handling and logging

### To Switch Between Test and Live Mode:

#### For Testing (Recommended for Development):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
```

#### For Production:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
```

### Test Card Numbers (TEST MODE ONLY):
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Live Mode Checklist:
- [ ] All product prices are correct
- [ ] Shipping costs are configured
- [ ] Tax calculations are accurate
- [ ] Refund policy is clear
- [ ] Terms of service are updated
- [ ] SSL certificate is valid
- [ ] Error handling is robust
- [ ] Customer support is ready

---

**Remember**: With great power comes great responsibility. Handle live keys with extreme care!