import React from 'react'
import { Link } from 'react-router-dom'
import { Product } from '../../types'
import { Card, CardContent, Badge } from '../ui'
import { cn } from '../../lib/utils/cn'
import { getProductName, getProductPrimaryImage } from '../../utils/product-helpers'
import { formatConvertedPrice } from '../../utils/currency'
import { useCurrencyStore } from '../../stores/currency.store'

interface ProductCardProps {
  product: Product
  className?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { currentCurrency } = useCurrencyStore()
  
  // Get prices from the unified price structure
  const getItemPrice = (): number => {
    // Check for variant-based B2B pricing first (new structure)
    if (product.variants?.[0]?.pricing?.b2b?.wholesalePrice) {
      return product.variants[0].pricing.b2b.wholesalePrice
    }
    // For B2B, use wholesale price if available (legacy)
    if (product.price?.wholesale !== undefined) {
      return product.price.wholesale
    }
    // Fallback to retail price
    if (product.price?.retail !== undefined) {
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
    // Check for variant-based units per carton first
    const unitsPerCarton = product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                          product.itemsPerCarton || 
                          1
    return itemPrice * unitsPerCarton
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
          {getProductPrimaryImage(product) ? (
            <img 
              src={getProductPrimaryImage(product)} 
              alt={getProductName(product)}
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
            {getProductName(product)}
          </h3>
          
          {/* Product Details */}
          <p className="text-sm text-text-secondary mb-3">
            {product.volume}
          </p>
          
          {/* Pricing - Now with currency conversion */}
          <div className="space-y-1">
            <div className="text-rose-gold font-medium">
              {formatConvertedPrice(getItemPrice(), currentCurrency)}/item
            </div>
            <div className="text-xs text-text-secondary">
              {formatConvertedPrice(getCartonPrice(), currentCurrency)}/carton ({product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || product.itemsPerCarton || 1} items)
            </div>
          </div>
          
          {/* MOQ Info */}
          <div className="mt-3 pt-3 border-t border-border-gray">
            <p className="text-xs text-text-secondary">
              Min. order: {product.variants?.[0]?.pricing?.b2b?.minOrderQuantity || product.moq || 1} items
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
