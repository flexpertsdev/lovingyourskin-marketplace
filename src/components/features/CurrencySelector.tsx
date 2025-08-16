import React from 'react'
import { useCurrencyStore, Currency } from '../../stores/currency.store'
import { cn } from '../../lib/utils/cn'

interface CurrencySelectorProps {
  className?: string
  size?: 'small' | 'medium'
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  className, 
  size = 'medium' 
}) => {
  const { currentCurrency, setCurrency } = useCurrencyStore()

  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'EUR', label: 'EUR', symbol: '€' },
    { value: 'GBP', label: 'GBP', symbol: '£' }
  ]

  return (
    <select
      value={currentCurrency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className={cn(
        'bg-white border border-border-gray rounded-md',
        'text-text-primary font-medium',
        'focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-rose-gold',
        'transition-colors cursor-pointer',
        {
          'px-2 py-1 text-sm': size === 'small',
          'px-3 py-2': size === 'medium'
        },
        className
      )}
      aria-label="Select currency"
    >
      {currencies.map((curr) => (
        <option key={curr.value} value={curr.value}>
          {curr.symbol} {curr.label}
        </option>
      ))}
    </select>
  )
}
