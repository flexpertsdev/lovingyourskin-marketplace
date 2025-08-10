interface ProgressProps {
  value: number
  className?: string
  barClassName?: string
}

export function Progress({ value, className = '', barClassName = '' }: ProgressProps) {
  // Ensure value is between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full bg-rose-gold transition-all duration-300 ease-out ${barClassName}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}
