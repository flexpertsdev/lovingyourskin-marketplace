import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'medium', 
    fullWidth = false,
    loading = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-rose-gold text-white hover:bg-rose-gold-dark hover:transform hover:-translate-y-0.5 hover:shadow-lg',
      secondary: 'bg-white text-text-primary border border-border-gray hover:bg-soft-pink-hover hover:border-rose-gold',
      ghost: 'text-text-primary hover:bg-soft-pink-hover'
    }
    
    const sizes = {
      small: 'px-4 py-2 text-sm rounded-2xl min-h-[36px]',
      medium: 'px-6 py-3 text-base rounded-3xl min-h-[44px]',
      large: 'px-10 py-4 text-base rounded-[30px] min-h-[48px]'
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
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'