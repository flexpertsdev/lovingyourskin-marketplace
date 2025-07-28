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
- **Backend**: Firebase (Auth, Firestore, Storage, Analytics)
- **Deployment**: Netlify
- **Internationalization**: react-i18next (installed, not yet configured)

### Firebase Integration
- **Project**: lovingyourskin (Firebase project configured)
- **Services**: Auth, Firestore, Storage, Analytics initialized
- **Service Configuration**: All services now use Firebase implementations
- **Emulator Ports**: Auth (9099), Firestore (8080), Storage (9199), UI (4000)

### Key Architectural Patterns

#### 1. Service Layer Pattern
All API interactions go through services in `src/services/`. The application uses Firebase services for all data operations:
- Firebase services in `src/services/firebase/`
- Services return typed responses matching `src/types/index.ts`
- Central export through `src/services/index.ts`

#### 2. State Management Strategy
- **Auth Store** (`stores/auth.store.ts`): User authentication, persisted to localStorage
- **Cart Store** (`stores/consumer-cart.store.ts`): Shopping cart with MOQ validation, persisted
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
- Role-based access (admin, retailer, brand, consumer)

### Project Structure
```
src/
├── components/      # Reusable UI components
│   ├── ui/         # Base components (Button, Input, etc.)
│   ├── features/   # Feature components (BrandCard, ProductCard)
│   ├── layout/     # Layout components (Header, Footer)
│   ├── admin/      # Admin-specific components
│   └── auth/       # Authentication components
├── pages/          # Page components (route endpoints)
├── services/       # Firebase service layer
├── stores/         # Zustand state stores
├── types/          # TypeScript type definitions
├── routes/         # Route configuration
├── lib/            # Firebase configuration
├── data/           # Static data and constants
└── theme/          # Design system constants
```

### Type System
All data types are defined in `src/types/index.ts`. Key entities:
- User (with roles: admin, retailer, brand, consumer)
- Product (with multi-language support, certifications)
- Brand (with products, stats, technologies)
- Order (with 9-status workflow)
- Cart (with MOQ validation)
- Invoice (B2B and B2C support)

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