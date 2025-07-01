import React from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../types'
import { Card, CardContent, Badge, Button } from '../ui'
import { cn } from '../../lib/utils/cn'

interface BrandCardProps {
  brand: Brand
  className?: string
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, className }) => {
  return (
    <Link to={`/brands/${brand.id}`}>
      <Card 
        variant="interactive" 
        padding="none"
        className={cn('h-full overflow-hidden', className)}
      >
        {/* Brand Hero Image */}
        <div className="relative h-48 bg-gradient-to-br from-soft-pink to-rose-gold/20 flex items-center justify-center">
          {brand.logo ? (
            <img 
              src={brand.logo} 
              alt={brand.name.en}
              className="max-h-24 max-w-[200px] object-contain"
            />
          ) : (
            <h3 className="text-2xl font-light text-deep-charcoal tracking-wider">
              {brand.name.en}
            </h3>
          )}
          
          {/* Certification Badge */}
          {brand.certifications?.includes('CPNP') && (
            <Badge 
              variant="success" 
              size="small"
              className="absolute top-4 right-4"
            >
              CPNP Certified
            </Badge>
          )}
        </div>
        
        <CardContent className="p-6">
          {/* Brand Name */}
          <h3 className="text-xl font-medium text-deep-charcoal mb-2">
            {brand.name.en}
          </h3>
          
          {/* Tagline */}
          <p className="text-rose-gold italic mb-4">
            {brand.description.en.split('.')[0]}
          </p>
          
          {/* Brand Info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Origin:</span>
              <span className="text-deep-charcoal font-medium">{brand.country}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Products:</span>
              <span className="text-deep-charcoal font-medium">{brand.productCount} items</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Min. Order:</span>
              <span className="text-deep-charcoal font-medium">{brand.minimumOrder} items</span>
            </div>
          </div>
          
          {/* Categories */}
          {brand.categories && brand.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {brand.categories.slice(0, 3).map((category, index) => (
                <span 
                  key={index}
                  className="text-xs px-3 py-1 bg-soft-pink text-text-primary rounded-full"
                >
                  {category}
                </span>
              ))}
              {brand.categories.length > 3 && (
                <span className="text-xs px-3 py-1 text-text-secondary">
                  +{brand.categories.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* CTA */}
          <div className="pt-4 border-t border-border-gray">
            <Button variant="secondary" size="small" fullWidth>
              View Products
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}