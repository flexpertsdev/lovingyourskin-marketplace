import { CurrencyService } from '../services/currency.service'
import { Currency } from '../stores/currency.store'

/**
 * Format currency values with proper symbol and locale
 */
export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
  const locale = currency === 'EUR' ? 'de-DE' : currency === 'GBP' ? 'en-GB' : 'en-US'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format currency without the currency symbol
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Parse a currency string back to number
 */
export const parseCurrency = (value: string): number => {
  // Remove currency symbols and commas
  const cleanValue = value.replace(/[€£$,]/g, '')
  return parseFloat(cleanValue) || 0
}

/**
 * Convert and format price from USD to selected currency
 */
export const formatConvertedPrice = (amountUSD: number, currency: Currency): string => {
  const convertedAmount = CurrencyService.convert(amountUSD, currency)
  return formatCurrency(convertedAmount, currency)
}

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case 'EUR': return '€'
    case 'GBP': return '£'
    case 'USD': 
    default: return '$'
  }
}
