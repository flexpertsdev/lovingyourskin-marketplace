import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'medium', 
    fullWidth = false,
    loading = false,
    disabled,
    icon,
    iconPosition = 'left',
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95'
    
    const variants = {
      primary: 'bg-rose-gold text-white hover:bg-rose-gold-dark hover:shadow-lg shadow-sm',
      secondary: 'bg-white text-deep-charcoal border-2 border-border-gray hover:bg-soft-pink hover:border-rose-gold',
      ghost: 'text-text-primary hover:bg-soft-pink-hover',
      danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg shadow-sm',
      success: 'bg-success-green text-white hover:bg-green-600 hover:shadow-lg shadow-sm'
    }
    
    const sizes = {
      small: 'px-4 py-2 text-sm rounded-full min-h-[36px]',
      medium: 'px-6 py-3 text-base rounded-full min-h-[44px]',
      large: 'px-8 py-4 text-base rounded-full min-h-[52px]'
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'