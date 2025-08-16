import { useEffect } from 'react'
import { CurrencyService } from '../services/currency.service'

/**
 * Hook to initialize and maintain exchange rates
 */
export const useCurrencyRates = () => {
  useEffect(() => {
    // Initialize rates on mount
    CurrencyService.initializeRates()

    // Update rates every 24 hours while app is running
    const interval = setInterval(() => {
      CurrencyService.initializeRates()
    }, 24 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])
}
