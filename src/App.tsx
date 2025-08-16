import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './routes'
import { ScrollToTop } from './components/utils/ScrollToTop'
import { AuthProvider } from './components/auth'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAffiliateTracking } from './hooks/useAffiliateTracking'
import { useCurrencyRates } from './hooks/useCurrencyRates'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

// Component to handle affiliate tracking
function AffiliateTracker() {
  useAffiliateTracking()
  return null
}

// Component to handle currency rates initialization
function CurrencyInitializer() {
  useCurrencyRates()
  return null
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AffiliateTracker />
            <CurrencyInitializer />
            <ScrollToTop />
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
