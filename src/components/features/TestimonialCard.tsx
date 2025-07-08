import React from 'react'
import { Card, CardContent } from '../ui'
import { cn } from '../../lib/utils/cn'

export interface TestimonialProps {
  company: string
  logo: string
  quote: string
  author: string
  role?: string
  companyDetails?: string
  rating?: number
  className?: string
}

export const TestimonialCard: React.FC<TestimonialProps> = ({
  company,
  logo,
  quote,
  author,
  role,
  companyDetails,
  rating = 5,
  className
}) => {
  return (
    <Card 
      variant="default" 
      className={cn("h-full hover:shadow-lg transition-shadow duration-300", className)}
    >
      <CardContent className="flex flex-col h-full">
        {/* Quote Icon */}
        <div className="text-rose-gold/20 mb-4">
          <svg 
            className="w-12 h-12" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        {/* Company Logo */}
        <div className="mb-6 h-16 flex items-center">
          <img 
            src={logo} 
            alt={`${company} logo`}
            className="max-h-full w-auto object-contain"
          />
        </div>

        {/* Rating Stars */}
        {rating && (
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={cn(
                  "w-5 h-5",
                  i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                )}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        )}

        {/* Quote */}
        <blockquote className="flex-1 mb-6">
          <p className="text-text-secondary italic leading-relaxed">
            "{quote}"
          </p>
        </blockquote>

        {/* Author Info */}
        <div className="border-t border-border-gray pt-4">
          <p className="font-medium text-deep-charcoal">
            {author}
            {role && <span className="text-text-secondary font-normal">, {role}</span>}
          </p>
          {companyDetails && (
            <p className="text-sm text-text-secondary mt-1">
              {company} • {companyDetails}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}