import React from 'react'
import { useCurrencyStore } from '../../stores/currency.store'
import { formatConvertedPrice, getCurrencySymbol } from '../../utils/currency'
import { CurrencyService } from '../../services/currency.service'

interface PriceDisplayProps {
  amountUSD: number
  label?: string
  size?: 'small' | 'medium' | 'large'
  showCurrency?: boolean
}

/**
 * Component to display prices with automatic currency conversion
 * Example usage:
 * <PriceDisplay amountUSD={99.99} label="/item" />
 * <PriceDisplay amountUSD={1200} size="large" />
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  amountUSD, 
  label = '',
  size = 'medium',
  showCurrency = true 
}) => {
  const { currentCurrency } = useCurrencyStore()
  
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg font-medium'
  }
  
  return (
    <span className={`${sizeClasses[size]} text-rose-gold`}>
      {showCurrency ? (
        formatConvertedPrice(amountUSD, currentCurrency)
      ) : (
        <>
          {getCurrencySymbol(currentCurrency)}
          {CurrencyService.convert(amountUSD, currentCurrency).toFixed(2)}
        </>
      )}
      {label && <span className="text-text-secondary">{label}</span>}
    </span>
  )
}
