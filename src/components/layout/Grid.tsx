import React from 'react'
import { cn } from '../../lib/utils/cn'

interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 3,
  gap = 'md',
  className
}) => {
  const columns = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }
  
  const gaps = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }
  
  return (
    <div className={cn(
      'grid',
      columns[cols],
      gaps[gap],
      className
    )}>
      {children}
    </div>
  )
}