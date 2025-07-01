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
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: 
  - Zustand for client state (auth, cart, UI)
  - React Query for server state
- **Routing**: React Router v6
- **Backend**: Currently mock services, planned Firebase integration

### Key Architectural Patterns

#### 1. Service Layer Pattern
All API interactions go through services in `src/services/`. Currently using mock implementations that simulate real API behavior. When migrating to Firebase:
- Replace mock service implementations but keep the interface
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