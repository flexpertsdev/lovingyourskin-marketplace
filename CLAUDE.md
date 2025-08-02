# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Preview production build
npm run preview
```

### Firebase Commands
```bash
# Start Firebase emulators
npm run firebase:emulators

# Deploy to Firebase
npm run firebase:deploy

# Deploy only functions
npm run firebase:deploy:functions

# Deploy only hosting
npm run firebase:deploy:hosting
```

### Migration Scripts
```bash
# Migrate data to Firebase
npm run migrate:firebase

# Fix brand data migration
npm run migrate:fix-brands

# Test migration with emulators
npm run migrate:test
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: 
  - Zustand for client state (auth, cart, UI) with persistence
  - React Query for server state caching
- **Routing**: React Router v7 with role-based protection
- **Backend**: Firebase (Auth, Firestore, Storage, Analytics)
- **Form Handling**: React Hook Form with Zod validation
- **Deployment**: Netlify
- **Internationalization**: react-i18next (installed, not yet configured)

### Firebase Integration
- **Project**: lovingyourskinshop (Firebase project configured)
- **Services**: Auth, Firestore, Storage, Analytics initialized
- **Service Configuration**: All services now use Firebase implementations
- **Emulator Ports**: Auth (9099), Firestore (8080), Storage (9199), UI (4000)
- **Security**: Firebase Rules in `firestore.rules` and `storage.rules`

### Key Architectural Patterns

#### 1. Service Layer Pattern
All API interactions go through services in `src/services/`. The application uses Firebase services for all data operations:
- Firebase services in `src/services/firebase/`
- Mock services in `src/services/mock/` (for development/testing)
- Services return typed responses matching `src/types/index.ts`
- Central export through `src/services/index.ts`
- Service configuration in `src/config/services.config.ts`

#### 2. State Management Strategy
- **Auth Store** (`stores/auth.store.ts`): User authentication, persisted to localStorage
- **Cart Store** (`stores/consumer-cart.store.ts`): Shopping cart with MOQ validation, persisted
- **UI Store** (`stores/ui.store.ts`): Language preference, theme, UI state, persisted
- All stores use Zustand with persistence middleware

#### 3. Multi-Language Architecture
The app supports English (en), Korean (ko), and Chinese (zh):
- Language preference stored in UI store
- All data types include multi-language fields (name, description)
- Product and brand data includes translations
- UI language switcher in header

#### 4. Business Logic: MOQ (Minimum Order Quantity)
Core business rule implemented in cart store:
- Each brand has minimum order requirements
- Cart validates MOQ per brand
- Visual progress indicators show MOQ status
- Checkout only allowed when all brands meet MOQ
- Separate B2B (retailer) and B2C (consumer) cart logic

#### 5. Authentication Flow
- Invite-only registration system for B2B users
- Registration requires valid invite code
- Auth service validates codes and creates users
- Role-based access: admin, retailer, brand, consumer
- Consumer (B2C) registration is open (no invite required)
- Protected routes based on user roles

#### 6. Routing Architecture
Routes are organized by access level:
- Public routes: Landing, marketing pages, legal pages
- Protected routes: Require authentication
- Role-specific routes: Admin, Retailer, Brand, Consumer
- Route protection handled by `ProtectedRoute` component
- Consumer shop has separate route prefix `/consumer/*` or `/shop/*`

### Project Structure
```
src/
├── components/      # Reusable UI components
│   ├── ui/         # Base components (Button, Input, etc.)
│   ├── features/   # Feature components (BrandCard, ProductCard)
│   ├── layout/     # Layout components (Header, Footer)
│   ├── admin/      # Admin-specific components
│   ├── auth/       # Authentication components
│   └── dashboard/  # Dashboard components
├── pages/          # Page components (route endpoints)
│   ├── admin/      # Admin pages
│   └── auth/       # Auth pages
├── services/       # Service layer
│   ├── firebase/   # Firebase service implementations
│   ├── mock/       # Mock service implementations
│   ├── invoice/    # Invoice generation
│   └── stripe/     # Payment processing (future)
├── stores/         # Zustand state stores
├── types/          # TypeScript type definitions
├── routes/         # Route configuration
├── lib/            # External library configurations
│   ├── firebase/   # Firebase setup
│   └── utils/      # Utility functions
├── hooks/          # Custom React hooks
├── data/           # Static data and constants
├── theme/          # Design system constants
└── scripts/        # Migration and setup scripts
```

### Type System
All data types are defined in `src/types/index.ts`. Key entities:
- **User**: Includes role, company association, language preference
- **Product**: Multi-language support, pricing, certifications, MOQ
- **Brand**: Company info, products, stats, technologies
- **Order**: 9-status workflow for B2B orders
- **Cart**: Separate types for B2B (CartItem) and B2C (ConsumerCartItem)
- **Invoice**: Supports both B2B and B2C formats
- **InviteCode**: For invite-only registration system

### Design System
- Primary color: Rose Gold (#D4A5A5)
- Secondary: Deep Charcoal (#1A1A1A)
- Background: Soft Pink (#FDF8F6)
- Typography: Inter + Noto Sans KR
- Mobile-first responsive design
- Components use Tailwind classes with `cn()` utility for conditional styling
- Consistent spacing using Tailwind's default scale
- Card components with variants: default, elevated, interactive
- Smooth transitions (300ms default)
- Focus states with rose-gold ring

### Component Patterns
- All UI components in `src/components/ui/` follow consistent patterns
- Use React.forwardRef for proper ref forwarding
- TypeScript interfaces for all props
- Variants handled through props, not CSS classes
- Compound components pattern (e.g., Card with CardHeader, CardContent)
- Loading states handled with Spinner component
- Error boundaries for error handling

### Data Flow
1. User actions trigger service calls
2. Services interact with Firebase or return mock data
3. Data is typed and validated
4. State updates in Zustand stores
5. Components re-render with new data
6. Persistence layer saves critical state

### Testing Utilities
- `/test-auth-flow`: Test authentication flow
- `/test-invite-code`: Test invite code system
- `/test-firebase`: Test Firebase connection
- `/components`: Component demonstration page

### Performance Considerations
- React Query for API response caching
- Lazy loading for route-based code splitting
- Image optimization with proper sizing
- Debounced search inputs
- Memoized expensive computations
- Virtual scrolling for large lists (planned)