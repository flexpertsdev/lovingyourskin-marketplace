import React from 'react'
import { CurrencySelector } from '../components/features/CurrencySelector'
import { ProductCard } from '../components/features/ProductCard'
import { useCurrencyStore } from '../stores/currency.store'
import { formatConvertedPrice } from '../utils/currency'

// Example product data
const exampleProduct = {
  id: '1',
  name: 'Premium Face Serum',
  price: {
    retail: 45.00,
    wholesale: 35.00
  },
  volume: '30ml',
  itemsPerCarton: 12,
  moq: 24,
  stockLevel: 'in' as const,
  images: []
}

export const CurrencyDemo: React.FC = () => {
  const { currentCurrency, exchangeRates, lastUpdated, isLoading } = useCurrencyStore()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-light mb-8">Currency Conversion Demo</h1>
      
      {/* Currency Selector Section */}
      <div className="mb-8 p-6 bg-soft-pink rounded-lg">
        <h2 className="text-xl mb-4">Select Your Currency</h2>
        <CurrencySelector />
        
        <div className="mt-4 text-sm text-text-secondary">
          <p>Current Exchange Rates (from USD):</p>
          <ul className="mt-2">
            <li>EUR: {exchangeRates.EUR.toFixed(4)}</li>
            <li>GBP: {exchangeRates.GBP.toFixed(4)}</li>
          </ul>
          {lastUpdated && (
            <p className="mt-2">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
          {isLoading && <p className="mt-2 text-rose-gold">Updating rates...</p>}
        </div>
      </div>

      {/* Price Examples */}
      <div className="mb-8">
        <h2 className="text-xl mb-4">Price Conversion Examples</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[10, 50, 100].map((amount) => (
            <div key={amount} className="p-4 border border-border-gray rounded-lg">
              <p className="text-sm text-text-secondary mb-2">USD ${amount}</p>
              <p className="text-lg font-medium text-rose-gold">
                {formatConvertedPrice(amount, currentCurrency)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Card Example */}
      <div className="mb-8">
        <h2 className="text-xl mb-4">Product Card with Currency</h2>
        <div className="max-w-sm">
          <ProductCard product={exampleProduct} />
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="mt-12 p-6 bg-light-gray rounded-lg">
        <h3 className="text-lg font-medium mb-3">Implementation Notes</h3>
        <ul className="space-y-2 text-sm">
          <li>✓ Exchange rates are fetched from exchangerate.host API (free, no limits)</li>
          <li>✓ Rates are cached for 24 hours to minimize API calls</li>
          <li>✓ User's currency preference is persisted in localStorage</li>
          <li>✓ All prices are stored in USD and converted for display only</li>
          <li>✓ Stripe will handle actual currency conversion during payment</li>
        </ul>
      </div>
    </div>
  )
}
