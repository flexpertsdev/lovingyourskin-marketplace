/**
 * Format currency values consistently across the app
 * All prices are stored in USD
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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
  const cleanValue = value.replace(/[$,]/g, '')
  return parseFloat(cleanValue) || 0
}