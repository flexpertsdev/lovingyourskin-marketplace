import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 text-sm border rounded-lg transition-colors duration-200',
            'bg-white text-text-primary placeholder:text-medium-gray',
            'border-border-gray hover:border-rose-gold/50',
            'focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/10',
            'disabled:bg-light-gray disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-error-red focus:border-error-red focus:ring-error-red/10',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-text-secondary">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-error-red">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'