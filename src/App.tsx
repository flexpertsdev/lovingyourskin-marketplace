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
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                  border: '1px solid #F5E6E6',
                  padding: '12px 16px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(212, 165, 165, 0.15)',
                },
                success: {
                  iconTheme: {
                    primary: '#D4A5A5',
                    secondary: '#FFFFFF',
                  },
                  style: {
                    background: '#FDF8F6',
                    color: '#1A1A1A',
                    border: '1px solid #D4A5A5',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                  style: {
                    background: '#FEF2F2',
                    color: '#1A1A1A',
                    border: '1px solid #FCA5A5',
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
