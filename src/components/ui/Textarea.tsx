import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block mb-2 text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 text-sm border rounded-lg transition-colors duration-200 resize-none',
            'bg-white text-text-primary placeholder:text-medium-gray',
            'border-border-gray hover:border-rose-gold/50',
            'focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/10',
            'disabled:bg-light-gray disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-error-red focus:border-error-red focus:ring-error-red/10',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="mt-1 text-xs text-text-secondary">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-xs text-error-red">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'