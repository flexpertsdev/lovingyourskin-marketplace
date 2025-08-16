import { useCurrencyStore } from '../stores/currency.store'

export class CurrencyService {
  private static readonly API_URL = 'https://api.exchangerate.host/latest'
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  /**
   * Fetch latest exchange rates from USD to EUR and GBP
   */
  static async fetchExchangeRates() {
    try {
      const response = await fetch(`${this.API_URL}?base=USD&symbols=EUR,GBP`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }

      const data = await response.json()
      
      if (!data.success || !data.rates) {
        throw new Error('Invalid response from exchange rate API')
      }

      return {
        EUR: data.rates.EUR,
        GBP: data.rates.GBP
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      // Return fallback rates
      return {
        EUR: 0.92,
        GBP: 0.79
      }
    }
  }

  /**
   * Initialize or update exchange rates if needed
   */
  static async initializeRates() {
    const { lastUpdated, updateExchangeRates, setLoading, setError } = useCurrencyStore.getState()
    
    // Check if we need to update rates (older than 24 hours or never updated)
    const shouldUpdate = !lastUpdated || 
      (new Date().getTime() - new Date(lastUpdated).getTime() > this.CACHE_DURATION)
    
    if (shouldUpdate) {
      setLoading(true)
      try {
        const rates = await this.fetchExchangeRates()
        updateExchangeRates(rates)
      } catch (error) {
        setError('Failed to update exchange rates')
      } finally {
        setLoading(false)
      }
    }
  }

  /**
   * Convert amount from USD to target currency
   */
  static convert(amountUSD: number, toCurrency: 'USD' | 'EUR' | 'GBP'): number {
    if (toCurrency === 'USD') return amountUSD
    
    const { exchangeRates } = useCurrencyStore.getState()
    return amountUSD * exchangeRates[toCurrency]
  }
}
