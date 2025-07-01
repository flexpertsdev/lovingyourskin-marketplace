import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block mb-2 text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-3 text-sm border rounded-lg transition-colors duration-200 appearance-none',
            'bg-white text-text-primary',
            'border-border-gray hover:border-rose-gold/50',
            'focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/10',
            'disabled:bg-light-gray disabled:cursor-not-allowed disabled:opacity-60',
            'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")] bg-[position:right_0.75rem_center] bg-[length:1.25rem] bg-no-repeat pr-10',
            error && 'border-error-red focus:border-error-red focus:ring-error-red/10',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && (
          <p id={`${selectId}-hint`} className="mt-1 text-xs text-text-secondary">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-xs text-error-red">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'