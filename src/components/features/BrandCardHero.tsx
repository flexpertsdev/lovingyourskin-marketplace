import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Brand } from '../../types'
import { cn } from '../../lib/utils/cn'

interface BrandCardHeroProps {
  brand: Brand
  variant?: 'split' | 'side-by-side'
  className?: string
}

export const BrandCardHero: React.FC<BrandCardHeroProps> = ({ 
  brand, 
  variant = 'side-by-side',
  className 
}) => {
  // Use heroImage if available, otherwise fallback to first heroImages or a gradient
  const heroImage = brand.heroImage || (brand.heroImages && brand.heroImages[0]) || null
  
  const cardContent = (
    <>
      {variant === 'split' && (
        <>
          {/* Hero Image Section */}
          <div className="relative h-64 md:h-72 overflow-hidden bg-gradient-to-br from-soft-pink/20 to-white">
            {heroImage ? (
              <img 
                src={heroImage}
                alt={`${brand.name.en} products`}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-gold/10 to-soft-pink flex items-center justify-center">
                <img 
                  src={brand.logo}
                  alt={brand.name.en}
                  className="max-h-24 max-w-[200px] object-contain opacity-50"
                />
              </div>
            )}
            {/* Subtle gradient overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            
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
          
          {/* Content Section */}
          <div className="p-8 bg-white">
            <img 
              src={brand.logo}
              alt={brand.name.en}
              className="h-12 mb-6 object-contain"
            />
            <h3 className="text-xl font-medium text-deep-charcoal mb-3">
              {brand.name.en}
            </h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              {brand.description.en}
            </p>
            
            {/* Brand Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-text-secondary">Products:</span>
                <span className="ml-2 text-deep-charcoal font-medium">{brand.productCount}</span>
              </div>
              <div>
                <span className="text-text-secondary">Min. Order:</span>
                <span className="ml-2 text-deep-charcoal font-medium">{brand.minimumOrder}</span>
              </div>
              <div>
                <span className="text-text-secondary">Origin:</span>
                <span className="ml-2 text-deep-charcoal font-medium">{brand.country}</span>
              </div>
            </div>
          </div>
        </>
      )}
      
      {variant === 'side-by-side' && (
        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="lg:w-1/2 h-64 lg:h-[400px] relative overflow-hidden bg-gradient-to-br from-soft-pink/20 to-white">
            {heroImage ? (
              <img 
                src={heroImage}
                alt={`${brand.name.en} products`}
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-gold/10 to-soft-pink flex items-center justify-center">
                <img 
                  src={brand.logo}
                  alt={brand.name.en}
                  className="max-h-32 max-w-[250px] object-contain opacity-50"
                />
              </div>
            )}
            
            {/* Certification Badge */}
            {brand.certifications?.includes('CPNP') && (
              <Badge 
                variant="success" 
                size="small"
                className="absolute top-4 left-4"
              >
                CPNP Certified
              </Badge>
            )}
          </div>
          
          {/* Content Section */}
          <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center bg-white">
            <img 
              src={brand.logo}
              alt={brand.name.en}
              className="h-14 mb-6 object-contain"
            />
            <h3 className="text-2xl font-medium text-deep-charcoal mb-4">
              {brand.name.en}
            </h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              {brand.description.en}
            </p>
            
            {/* Brand Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-rose-gold/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-rose-gold" />
                </div>
                <span className="text-sm text-text-secondary">
                  <strong className="text-deep-charcoal">{brand.productCount}</strong> products available
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-rose-gold/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-rose-gold" />
                </div>
                <span className="text-sm text-text-secondary">
                  Minimum order: <strong className="text-deep-charcoal">{brand.minimumOrder} items</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-rose-gold/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-rose-gold" />
                </div>
                <span className="text-sm text-text-secondary">
                  Made in <strong className="text-deep-charcoal">{brand.country}</strong>
                </span>
              </div>
            </div>
            
            {/* Categories */}
            {brand.categories && brand.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {brand.categories.slice(0, 4).map((category, index) => (
                  <span 
                    key={index}
                    className="text-xs px-3 py-1 bg-soft-pink text-text-primary rounded-full"
                  >
                    {category}
                  </span>
                ))}
                {brand.categories.length > 4 && (
                  <span className="text-xs px-3 py-1 text-text-secondary">
                    +{brand.categories.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
  
  return (
    <Link to={`/brands/${brand.id}`} className="block">
      <Card 
        padding="none" 
        className={cn(
          'overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer',
          'transform hover:-translate-y-1',
          className
        )}
      >
        {cardContent}
      </Card>
    </Link>
  )
}