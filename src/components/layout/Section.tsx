import React from 'react'
import { cn } from '../../lib/utils/cn'

interface SectionProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  background?: 'white' | 'gray' | 'pink' | 'transparent'
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  size = 'md',
  background = 'transparent'
}) => {
  const sizes = {
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24'
  }
  
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-light-gray',
    pink: 'bg-soft-pink',
    transparent: ''
  }
  
  return (
    <section className={cn(
      sizes[size],
      backgrounds[background],
      className
    )}>
      {children}
    </section>
  )
}