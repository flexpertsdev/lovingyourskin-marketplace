#!/bin/bash

# Loving Your Skin - Self-Executing Build Script
# This script sets up the entire project from scratch

set -e  # Exit on error

echo "🌸 Setting up Loving Your Skin B2B Platform..."

# Check for required tools
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is required but not installed."
        echo "Please install $1 and run this script again."
        exit 1
    fi
}

echo "📋 Checking prerequisites..."
check_command node
check_command npm
check_command git

# Create project structure
echo "📁 Creating project structure..."
mkdir -p src/{components/{ui,layout,features,shared},pages/{public,auth,retailer,admin,brand},hooks,lib/{firebase,api,utils},contexts,store,types,routes,styles}
mkdir -p public/{fonts,images,locales}
mkdir -p firebase/functions/src

# Initialize package.json
echo "📦 Initializing package.json..."
cat > package.json << 'EOL'
{
  "name": "lovingyourskin",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "firebase:emulators": "firebase emulators:start",
    "firebase:deploy": "firebase deploy",
    "firebase:deploy:functions": "firebase deploy --only functions",
    "firebase:deploy:hosting": "firebase deploy --only hosting"
  }
}
EOL

# Install dependencies
echo "📥 Installing dependencies..."
npm install react react-dom react-router-dom
npm install zustand @tanstack/react-query axios i18next react-i18next
npm install react-hook-form @hookform/resolvers zod
npm install firebase
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D prettier prettier-plugin-tailwindcss

# Initialize TypeScript
echo "🔧 Configuring TypeScript..."
cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

cat > tsconfig.node.json << 'EOL'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOL

# Configure Vite
echo "⚡ Configuring Vite..."
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
EOL

# Initialize Tailwind CSS
echo "🎨 Configuring Tailwind CSS..."
npx tailwindcss init -p

cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rose-gold': '#D4A5A5',
        'soft-pink': '#FFE5E5',
        'light-pink': '#FFF0F0',
        'deep-charcoal': '#2D2D2D',
        'medium-gray': '#6B6B6B',
      },
      fontFamily: {
        'sans': ['Inter', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
EOL

# Create index.html
echo "📄 Creating index.html..."
cat > index.html << 'EOL'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loving Your Skin - B2B Korean Beauty Marketplace</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL

# Create main entry files
echo "🚀 Creating main application files..."
cat > src/main.tsx << 'EOL'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOL

cat > src/App.tsx << 'EOL'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { I18nextProvider } from 'react-i18next'
import i18n from './lib/i18n'
import AppRoutes from './routes/AppRoutes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  )
}

export default App
EOL

cat > src/styles/index.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-deep-charcoal antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-rose-gold text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-100 p-6;
  }
}
EOL

# Create environment files
echo "🔐 Creating environment templates..."
cat > .env.example << 'EOL'
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Environment
VITE_ENV=development
EOL

cp .env.example .env.local

# Create Firebase configuration
echo "🔥 Setting up Firebase structure..."
cat > firebase.json << 'EOL'
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "firebase/functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run lint",
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  },
  "firestore": {
    "rules": "firebase/firestore.rules",
    "indexes": "firebase/firestore.indexes.json"
  },
  "storage": {
    "rules": "firebase/storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true
    }
  }
}
EOL

# Create Netlify configuration
echo "🚀 Configuring Netlify..."
cat > netlify.toml << 'EOL'
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
EOL

# Create ESLint configuration
echo "🔍 Configuring ESLint..."
cat > .eslintrc.cjs << 'EOL'
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
EOL

# Create Prettier configuration
echo "💅 Configuring Prettier..."
cat > .prettierrc << 'EOL'
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOL

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
dist-ssr/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*
*.log

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log
firebase-export-*

# Misc
*.local
EOL

# Create minimal working components
echo "🏗️ Creating minimal working components..."

# Create routes
cat > src/routes/AppRoutes.tsx << 'EOL'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LandingPage from '../pages/public/LandingPage'
import LoginPage from '../pages/auth/LoginPage'
import RetailerDashboard from '../pages/retailer/Dashboard'
import AdminDashboard from '../pages/admin/Dashboard'
import BrandDashboard from '../pages/brand/Dashboard'

export default function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={`/${user.role}`} />} />
      
      {/* Protected Routes */}
      <Route path="/retailer/*" element={
        user?.role === 'retailer' ? <RetailerDashboard /> : <Navigate to="/login" />
      } />
      <Route path="/admin/*" element={
        user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
      } />
      <Route path="/brand/*" element={
        user?.role === 'brand' ? <BrandDashboard /> : <Navigate to="/login" />
      } />
    </Routes>
  )
}
EOL

# Create basic auth context
cat > src/contexts/AuthContext.tsx << 'EOL'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { auth } from '../lib/firebase/config'

interface AuthContextType {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
EOL

# Create useAuth hook
cat > src/hooks/useAuth.ts << 'EOL'
import { useAuthContext } from '../contexts/AuthContext'

export function useAuth() {
  const context = useAuthContext()
  
  return {
    user: context.user,
    isLoading: context.isLoading,
    isAuthenticated: !!context.user,
  }
}
EOL

# Create Firebase config
cat > src/lib/firebase/config.ts << 'EOL'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

export default app
EOL

# Create i18n configuration
cat > src/lib/i18n.ts << 'EOL'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: 'Welcome to Loving Your Skin',
          login: 'Login',
          // Add more translations
        }
      },
      ko: {
        translation: {
          welcome: '러빙유어스킨에 오신 것을 환영합니다',
          login: '로그인',
        }
      },
      zh: {
        translation: {
          welcome: '欢迎来到爱你的肌肤',
          login: '登录',
        }
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
EOL

# Create basic pages
echo "📄 Creating basic pages..."

# Landing Page
cat > src/pages/public/LandingPage.tsx << 'EOL'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function LandingPage() {
  const { t, i18n } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-pink to-white">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-rose-gold">Loving Your Skin</h1>
        <div className="flex gap-4 items-center">
          <select 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="px-3 py-1 rounded border border-gray-300"
          >
            <option value="en">EN</option>
            <option value="ko">KO</option>
            <option value="zh">ZH</option>
          </select>
          <Link to="/login" className="btn-primary">
            {t('login')}
          </Link>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">{t('welcome')}</h2>
        <p className="text-xl text-medium-gray mb-8">
          The premier B2B marketplace for Korean beauty brands
        </p>
        <Link to="/login" className="btn-primary inline-block">
          Get Started
        </Link>
      </main>
    </div>
  )
}
EOL

# Login Page
cat > src/pages/auth/LoginPage.tsx << 'EOL'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase/config'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-pink">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
EOL

# Create dashboard pages
mkdir -p src/pages/{retailer,admin,brand}

cat > src/pages/retailer/Dashboard.tsx << 'EOL'
export default function RetailerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold p-6">Retailer Dashboard</h1>
      <p className="px-6">Welcome to your retailer dashboard!</p>
    </div>
  )
}
EOL

cat > src/pages/admin/Dashboard.tsx << 'EOL'
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold p-6">Admin Dashboard</h1>
      <p className="px-6">Welcome to the admin dashboard!</p>
    </div>
  )
}
EOL

cat > src/pages/brand/Dashboard.tsx << 'EOL'
export default function BrandDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold p-6">Brand Dashboard</h1>
      <p className="px-6">Welcome to your brand dashboard!</p>
    </div>
  )
}
EOL

# Create README
cat > README.md << 'EOL'
# Loving Your Skin - B2B Korean Beauty Marketplace

A modern B2B platform connecting Korean beauty brands with international retailers.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Firebase CLI (optional for local development)
- GitHub account
- Netlify account

### Automated Setup

```bash
# Clone and run the setup script
chmod +x setup.sh
./setup.sh
```

This will install all dependencies and create the project structure.

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase config
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## 📦 Deployment to Netlify

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lovingyourskin.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Build settings will be auto-detected from `netlify.toml`
   - Add environment variables in Netlify dashboard:
     - All `VITE_FIREBASE_*` variables from your `.env.local`
   - Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   # Build the project
   npm run build
   
   # Deploy to Netlify
   netlify deploy --prod --dir=dist
   ```

## 🔐 Environment Variables

Required environment variables for production:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript compiler check

### Firebase Emulators

```bash
# Start Firebase emulators for local development
npm run firebase:emulators
```

## 📁 Project Structure

```
lovingyourskin/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Core libraries and utilities
│   ├── contexts/      # React Context providers
│   ├── store/         # Zustand state management
│   ├── types/         # TypeScript types
│   └── routes/        # React Router configuration
├── public/            # Static assets
├── firebase/          # Firebase configuration
└── netlify.toml       # Netlify configuration
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `netlify.toml` - Netlify deployment configuration
- `firebase.json` - Firebase configuration

## 📚 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State**: Zustand, React Query
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Deployment**: Netlify
- **i18n**: react-i18next (EN, KO, ZH)

## 🚀 Next Steps

1. Set up Firebase project and add configuration
2. Implement authentication flows
3. Build out component library
4. Add product catalog features
5. Implement order management
6. Set up Firebase Functions for backend logic

## 📞 Support

For issues or questions, please open an issue on GitHub.
EOL

# Create Firebase rules
cat > firebase/firestore.rules << 'EOL'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access on all documents to authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOL

cat > firebase/storage.rules << 'EOL'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOL

# Create Firebase Functions package.json
cat > firebase/functions/package.json << 'EOL'
{
  "name": "functions",
  "scripts": {
    "lint": "eslint --ext .js,.ts .",
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.12.0",
    "@typescript-eslint/parser": "^5.12.0",
    "eslint": "^8.9.0",
    "eslint-config-google": "^0.14.0",
    "eslint-plugin-import": "^2.25.4",
    "typescript": "^4.9.0"
  },
  "private": true
}
EOL

# Create deploy script
cat > deploy.sh << 'EOL'
#!/bin/bash

echo "🚀 Deploying Loving Your Skin to Production..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Netlify
if command -v netlify &> /dev/null; then
    echo "🌐 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
else
    echo "📝 Netlify CLI not installed."
    echo "Please deploy manually through Netlify dashboard or install Netlify CLI:"
    echo "npm install -g netlify-cli"
fi

echo "🎉 Deployment complete!"
EOL

chmod +x deploy.sh

# Initialize git and create first commit
git add .
git commit -m "Initial commit - Loving Your Skin B2B Platform"

echo "✅ Setup complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Configure your Firebase project and update .env.local"
echo "2. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/lovingyourskin.git"
echo "   git push -u origin main"
echo "3. Connect GitHub repo to Netlify"
echo "4. Add environment variables in Netlify dashboard"
echo "5. Deploy!"
echo ""
echo "📝 To run locally: npm run dev"
echo "📦 To build: npm run build"
echo "🚀 To deploy: ./deploy.sh"
EOL

chmod +x setup.sh