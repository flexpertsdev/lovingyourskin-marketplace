import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Currency = 'USD' | 'EUR' | 'GBP'

interface CurrencyState {
  currentCurrency: Currency
  exchangeRates: {
    EUR: number
    GBP: number
  }
  lastUpdated: string | null
  isLoading: boolean
  error: string | null
  setCurrency: (currency: Currency) => void
  updateExchangeRates: (rates: { EUR: number; GBP: number }) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currentCurrency: 'USD',
      exchangeRates: {
        EUR: 0.92, // Default fallback rates
        GBP: 0.79
      },
      lastUpdated: null,
      isLoading: false,
      error: null,
      setCurrency: (currency) => set({ currentCurrency: currency }),
      updateExchangeRates: (rates) => set({ 
        exchangeRates: rates, 
        lastUpdated: new Date().toISOString(),
        error: null 
      }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({ 
        currentCurrency: state.currentCurrency,
        exchangeRates: state.exchangeRates,
        lastUpdated: state.lastUpdated
      })
    }
  )
)
