import React from 'react'
import { Container } from './Container'
import { cn } from '../../lib/utils/cn'

interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
  centered?: boolean
  variant?: 'default' | 'hero' | 'minimal'
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  className,
  centered = true,
  variant = 'default'
}) => {
  const variants = {
    default: 'bg-soft-pink py-12',
    hero: 'bg-gradient-to-br from-soft-pink to-white py-20',
    minimal: 'bg-white py-8 border-b border-border-gray'
  }
  
  return (
    <div className={cn(variants[variant], className)}>
      <Container>
        <div className={cn(
          'max-w-3xl',
          centered && 'mx-auto text-center'
        )}>
          <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal tracking-wide">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </div>
  )
}