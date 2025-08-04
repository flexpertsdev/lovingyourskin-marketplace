import React from 'react'
import { Link } from 'react-router-dom'
import { Product } from '../../types'
import { Card, CardContent, Badge } from '../ui'
import { cn } from '../../lib/utils/cn'

interface ProductCardProps {
  product: Product
  className?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  // Get prices from the unified price structure
  const getItemPrice = (): number => {
    // For B2B, use wholesale price if available
    if (product.price.wholesale !== undefined) {
      return product.price.wholesale
    }
    // Fallback to retail price
    if (product.price.retail !== undefined) {
      return product.price.retail
    }
    // Legacy support for retailPrice field
    if (product.retailPrice?.item) {
      return product.retailPrice.item
    }
    return 0
  }
  
  const getCartonPrice = (): number => {
    const itemPrice = getItemPrice()
    return itemPrice * product.itemsPerCarton
  }
  
  const getCurrency = (): string => {
    const currency = product.price.currency || product.retailPrice?.currency || 'GBP'
    if (currency === 'USD') return '$'
    if (currency === 'EUR') return '€'
    if (currency === 'CHF') return 'CHF '
    return '£'
  }
  
  return (
    <Link to={`/products/${product.id}`}>
      <Card 
        variant="interactive" 
        padding="none"
        className={cn('h-full overflow-hidden', className)}
      >
        {/* Product Image */}
        <div className="relative aspect-square bg-soft-pink flex items-center justify-center text-medium-gray">
          {product.images?.[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.name.en}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl">📦</div>
          )}
          
          {/* Stock Badge */}
          {product.stockLevel === 'low' && (
            <Badge 
              variant="warning" 
              size="small"
              className="absolute top-2 right-2"
            >
              Low Stock
            </Badge>
          )}
          {product.stockLevel === 'out' && (
            <Badge 
              variant="error" 
              size="small"
              className="absolute top-2 right-2"
            >
              Out of Stock
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          {/* Product Name */}
          <h3 className="font-medium text-deep-charcoal mb-1 line-clamp-2">
            {product.name.en}
          </h3>
          
          {/* Product Details */}
          <p className="text-sm text-text-secondary mb-3">
            {product.volume}
          </p>
          
          {/* Pricing */}
          <div className="space-y-1">
            <div className="text-rose-gold font-medium">
              {getCurrency()}{getItemPrice().toFixed(2)}/item
            </div>
            <div className="text-xs text-text-secondary">
              {getCurrency()}{getCartonPrice().toFixed(2)}/carton ({product.itemsPerCarton} items)
            </div>
          </div>
          
          {/* MOQ Info */}
          <div className="mt-3 pt-3 border-t border-border-gray">
            <p className="text-xs text-text-secondary">
              Min. order: {product.moq} items
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}