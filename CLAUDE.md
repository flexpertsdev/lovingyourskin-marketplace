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

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: 
  - Zustand for client state (auth, cart, UI)
  - React Query for server state
- **Routing**: React Router v7
- **Backend**: Firebase (configured but using mock services during development)
- **Internationalization**: react-i18next (installed, not yet configured)

### Firebase Integration Status
- **Project**: lovingyourskinshop (Firebase project configured)
- **Services**: Auth, Firestore, Storage, Analytics initialized in `src/lib/firebase/config.ts`
- **Service Toggle**: Use `src/config/services.config.ts` to switch between mock and Firebase services
- **Current Status**: All services set to use mock implementations (useFirebase: false)
- **Firebase Auth Service**: Already implemented in `src/services/firebase/auth.service.ts`

### Key Architectural Patterns

#### 1. Service Layer Pattern
All API interactions go through services in `src/services/`. Service implementations can be toggled between mock and Firebase:
- Mock services in `src/services/mock/` for development
- Firebase services in `src/services/firebase/` for production
- Toggle via `src/config/services.config.ts`
- Services return typed responses matching `src/types/index.ts`

#### 2. State Management Strategy
- **Auth Store** (`stores/auth.store.ts`): User authentication, persisted to localStorage
- **Cart Store** (`stores/cart.store.ts`): Shopping cart with MOQ validation, persisted
- **UI Store** (`stores/ui.store.ts`): Language preference, theme, UI state, persisted

#### 3. Multi-Language Architecture
The app supports English (en), Korean (ko), and Chinese (zh):
- Language preference stored in UI store
- All data types include multi-language fields (name, description)
- Mock data includes translations

#### 4. Business Logic: MOQ (Minimum Order Quantity)
Core business rule implemented in cart store:
- Each brand has minimum order requirements
- Cart validates MOQ per brand
- Visual progress indicators show MOQ status
- Checkout only allowed when all brands meet MOQ

#### 5. Authentication Flow
- Invite-only registration system
- Registration requires valid invite code
- Auth service validates codes and creates users
- Role-based access (admin, retailer, brand)

### Project Structure
```
src/
├── components/      # Reusable UI components
│   ├── ui/         # Base components (Button, Input, etc.)
│   ├── features/   # Feature components (BrandCard, ProductCard)
│   └── layout/     # Layout components (Header, Footer)
├── pages/          # Page components (route endpoints)
├── services/       # API service layer (mock → Firebase)
├── stores/         # Zustand state stores
├── types/          # TypeScript type definitions
├── routes/         # Route configuration
└── theme/          # Design system constants
```

### Type System
All data types are defined in `src/types/index.ts`. Key entities:
- User (with roles: admin, retailer, brand)
- Product (with multi-language support, certifications)
- Brand (with products, stats, technologies)
- Order (with 9-status workflow)
- Cart (with MOQ validation)

### Design System
- Primary color: Rose Gold (#D4A5A5)
- Background: Soft Pink (#FDF8F6)
- Typography: Inter + Noto Sans KR
- Mobile-first responsive design
- Components use Tailwind classes with `cn()` utility for conditional styling
- Spacing and sizing use Tailwind's default scale
- Card components with variants: default, elevated, interactive
- Consistent hover effects and transitions

### Component Patterns
- All UI components in `src/components/ui/` follow a consistent pattern
- Use React.forwardRef for proper ref forwarding
- Props interfaces defined with TypeScript
- Variants handled through props, not CSS classes
- Compound components pattern (e.g., Card, CardHeader, CardContent)