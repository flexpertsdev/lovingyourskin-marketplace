import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'small' | 'medium'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'medium',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full'
  
  const variants = {
    default: 'bg-light-gray text-text-primary',
    success: 'bg-success-green text-white',
    warning: 'bg-warning-amber text-white',
    error: 'bg-error-red text-white',
    info: 'bg-rose-gold text-white'
  }
  
  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-xs'
  }
  
  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}