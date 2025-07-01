import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive'
  padding?: 'none' | 'small' | 'medium' | 'large'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'medium', children, ...props }, ref) => {
    const baseStyles = 'bg-white rounded-xl border'
    
    const variants = {
      default: 'border-border-gray shadow-sm',
      elevated: 'border-border-gray shadow-md',
      interactive: 'border-border-gray shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer'
    }
    
    const paddings = {
      none: '',
      small: 'p-4',
      medium: 'p-6',
      large: 'p-8'
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('mb-4', className)} {...props} />
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3 className={cn('text-xl font-medium text-deep-charcoal', className)} {...props} />
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p className={cn('text-sm text-text-secondary mt-1', className)} {...props} />
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('', className)} {...props} />
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('mt-4 pt-4 border-t border-border-gray', className)} {...props} />
)