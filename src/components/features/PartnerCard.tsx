import React from 'react'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils/cn'

interface PartnerCardProps {
  brand: {
    name: string
    logo: string
    heroImage: string
    description: string
    highlights?: string[]
  }
  variant?: 'split' | 'overlay' | 'side-by-side'
  className?: string
}

export const PartnerCard: React.FC<PartnerCardProps> = ({ 
  brand, 
  variant = 'split',
  className 
}) => {
  if (variant === 'split') {
    return (
      <Card 
        padding="none" 
        className={cn(
          'overflow-hidden hover:shadow-xl transition-all duration-300',
          className
        )}
      >
        {/* Hero Image Section */}
        <div className="relative h-64 md:h-72 overflow-hidden bg-gradient-to-br from-soft-pink/20 to-white">
          <img 
            src={brand.heroImage}
            alt={`${brand.name} products`}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
        
        {/* Content Section */}
        <div className="p-8 bg-white">
          <img 
            src={brand.logo}
            alt={brand.name}
            className="h-12 mb-6 object-contain"
          />
          <h3 className="text-xl font-medium text-deep-charcoal mb-3">
            {brand.name}
          </h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            {brand.description}
          </p>
          
          {brand.highlights && brand.highlights.length > 0 && (
            <ul className="space-y-2">
              {brand.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-rose-gold mt-1">•</span>
                  <span className="text-sm text-text-secondary">{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    )
  }
  
  if (variant === 'overlay') {
    return (
      <Card 
        padding="none" 
        className={cn(
          'overflow-hidden hover:shadow-xl transition-all duration-300 relative',
          className
        )}
      >
        {/* Full Background Image */}
        <div className="relative h-96 md:h-[450px]">
          <img 
            src={brand.heroImage}
            alt={`${brand.name} products`}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <img 
              src={brand.logo}
              alt={brand.name}
              className="h-12 mb-4 object-contain filter brightness-0 invert"
            />
            <h3 className="text-2xl font-medium mb-3">{brand.name}</h3>
            <p className="leading-relaxed opacity-90">
              {brand.description}
            </p>
          </div>
        </div>
      </Card>
    )
  }
  
  // Side-by-side variant (default for desktop, stacks on mobile)
  return (
    <Card 
      padding="none" 
      className={cn(
        'overflow-hidden hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="lg:w-1/2 h-64 lg:h-auto lg:min-h-[400px] relative overflow-hidden">
          <img 
            src={brand.heroImage}
            alt={`${brand.name} products`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        {/* Content Section */}
        <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center bg-white">
          <img 
            src={brand.logo}
            alt={brand.name}
            className="h-14 mb-6 object-contain"
          />
          <h3 className="text-2xl font-medium text-deep-charcoal mb-4">
            {brand.name}
          </h3>
          <p className="text-text-secondary leading-relaxed mb-6">
            {brand.description}
          </p>
          
          {brand.highlights && brand.highlights.length > 0 && (
            <div className="space-y-3">
              {brand.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-rose-gold" />
                  </div>
                  <span className="text-sm text-text-secondary">{highlight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}