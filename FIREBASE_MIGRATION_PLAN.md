# Firebase Migration Plan

## Overview
This document outlines the complete migration from mock services to Firebase for the Loving Your Skin application.

## Migration Status ✅

### Completed Tasks
1. ✅ **Firebase Auth Service** - Complete implementation with invite code system
2. ✅ **Firebase Product Service** - Full CRUD operations for products and brands
3. ✅ **Firebase Order Service** - Order lifecycle management with integrated messaging
4. ✅ **Firebase Cart Service** - Hybrid local storage + Firebase sync approach
5. ✅ **Firebase Message Service** - Contact form and message management
6. ✅ **Firebase Dashboard Service** - Analytics and reporting
7. ✅ **Service Exports Updated** - All services now export Firebase implementations
8. ✅ **Migration Scripts Created** - Data migration tooling ready

### Architecture Changes

#### Service Layer
All services have been migrated from mock to Firebase:
- `/src/services/firebase/auth.service.ts` - Authentication with invite codes
- `/src/services/firebase/product.service.ts` - Product and brand management
- `/src/services/firebase/order.service.ts` - Order processing and tracking
- `/src/services/firebase/cart.service.ts` - Shopping cart with persistence
- `/src/services/firebase/message.service.ts` - Contact messages
- `/src/services/firebase/dashboard.service.ts` - Analytics and stats

#### Data Storage
- **Before**: Mock data in JSON files and memory
- **After**: Firebase Firestore collections with real-time sync

#### Cart Strategy
- Uses hybrid approach: localStorage for anonymous users
- Syncs to Firebase when user logs in
- Merges carts intelligently on login

## Migration Steps

### 1. Pre-Migration Checklist
- [x] Backup current data
- [x] Test Firebase connection
- [x] Verify Firebase project configuration
- [ ] Set up Firebase security rules
- [ ] Configure Firebase indexes

### 2. Data Migration Process

#### Run Migration Script
```bash
# Test migration with emulators
npm run migrate:test

# Run actual migration
npm run migrate:firebase
```

#### Migration Script Actions
1. Migrates users (without passwords - requires manual auth setup)
2. Migrates brands from `mock-data/brands.json`
3. Migrates products from `mock-data/products.json`
4. Migrates orders (if any exist)
5. Creates default admin user

### 3. Post-Migration Tasks

#### Firebase Authentication Setup
1. Go to Firebase Console > Authentication
2. Enable Email/Password authentication
3. Manually create users for migrated accounts
4. Set passwords for each user
5. Send password reset emails to users

#### Security Rules
Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

#### Indexes
Deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

### 4. Testing Plan

#### Component Testing
- [ ] User registration with invite codes
- [ ] User login/logout
- [ ] Product browsing
- [ ] Cart operations (add/remove/update)
- [ ] Order placement
- [ ] Order tracking
- [ ] Admin dashboard
- [ ] Contact form submission

#### Data Verification
- [ ] All products visible
- [ ] All brands loaded
- [ ] User roles working
- [ ] Cart persistence across sessions
- [ ] Order history accurate

### 5. Cleanup Tasks

#### Remove Mock Services
After successful migration and testing:
1. Delete `/src/services/mock/` directory
2. Delete mock data files
3. Remove `SERVICE_CONFIG` from codebase
4. Update imports throughout the app

#### Files to Remove
- `/src/services/mock/*.ts`
- `/src/data/*.ts` (mock data files)
- `/src/config/services.config.ts` (no longer needed)

### 6. Production Deployment

#### Environment Variables
Ensure production environment has:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

#### Deployment Steps
1. Build production bundle: `npm run build`
2. Deploy to Firebase Hosting: `npm run firebase:deploy`
3. Monitor Firebase Console for errors
4. Test all critical paths

## Rollback Plan

If issues arise:
1. Revert service exports in `/src/services/index.ts`
2. Re-enable mock services via `SERVICE_CONFIG`
3. Investigate and fix Firebase issues
4. Retry migration

## Key Differences to Note

### Multi-Language Support
- Mock: Separate fields (`nameEn`, `nameKo`, `nameZh`)
- Firebase: Object structure (`name: { en, ko, zh }`)
- Migration script handles conversion

### Price Structure
- Mock: Various price formats
- Firebase: Standardized to `wholesalePrice` and `retailPrice`
- Cart service handles both formats for compatibility

### Authentication
- Mock: Stored passwords (insecure)
- Firebase: Proper authentication service
- Passwords cannot be migrated - manual setup required

## Support and Troubleshooting

### Common Issues
1. **Auth errors**: Check Firebase Auth is enabled
2. **Permission denied**: Review security rules
3. **Data not loading**: Check indexes are deployed
4. **Cart sync issues**: Clear localStorage and re-login

### Monitoring
- Firebase Console > Firestore for data
- Firebase Console > Authentication for users
- Browser DevTools > Application > Local Storage for cart

## Success Criteria
- [ ] All users can log in
- [ ] Products display correctly
- [ ] Orders can be placed
- [ ] Admin functions work
- [ ] No console errors
- [ ] Performance acceptable

## Timeline
- Migration script execution: ~5 minutes
- Testing: 2-4 hours
- User account setup: 1-2 hours
- Full validation: 1 day

## Next Steps
1. Run migration script
2. Set up user authentication
3. Test all features
4. Remove mock services
5. Deploy to production
6. Monitor for 24-48 hours