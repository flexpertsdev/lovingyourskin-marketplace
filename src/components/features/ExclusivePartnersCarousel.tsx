import React, { useState, useEffect } from 'react'
import { cn } from '../../lib/utils/cn'
import { Brand } from '../../types'
import { PartnerCard } from './PartnerCard'

interface ExclusivePartnersCarouselProps {
  partners: Brand[]
}

export const ExclusivePartnersCarousel: React.FC<ExclusivePartnersCarouselProps> = ({ partners }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Create an extended array for infinite scroll effect
  const extendedPartners = partners.length > 0 
    ? [...partners, ...partners, ...partners] // Triple the array for smooth infinite scroll
    : []

  useEffect(() => {
    if (partners.length === 0) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setCurrentIndex((prev) => {
        // Reset to middle set when reaching the end
        if (prev >= partners.length * 2 - 1) {
          setTimeout(() => {
            setIsTransitioning(false)
            setCurrentIndex(partners.length - 1)
          }, 700)
          return prev + 1
        }
        return prev + 1
      })
    }, 6000) // Change every 6 seconds for slower movement

    return () => clearInterval(interval)
  }, [partners.length])

  // Handle manual navigation
  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setCurrentIndex(partners.length + index) // Jump to middle set
  }

  const handlePrevious = () => {
    setIsTransitioning(true)
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentIndex(partners.length)
        }, 700)
        return prev - 1
      }
      return prev - 1
    })
  }

  const handleNext = () => {
    setIsTransitioning(true)
    setCurrentIndex((prev) => {
      if (prev >= partners.length * 2 - 1) {
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentIndex(partners.length - 1)
        }, 700)
        return prev + 1
      }
      return prev + 1
    })
  }

  if (partners.length === 0) {
    return null
  }

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div 
          className={cn(
            "flex",
            isTransitioning ? "transition-transform duration-700 ease-in-out" : ""
          )}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {extendedPartners.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="w-full flex-shrink-0"
            >
              <div className="max-w-6xl mx-auto px-4">
                <PartnerCard 
                  brand={{
                    name: brand.name,
                    logo: brand.logo,
                    heroImage: brand.heroImage,
                    description: brand.description,
                    highlights: brand.featureTags
                  }}
                  variant="side-by-side"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Previous partner"
      >
        <svg className="w-6 h-6 text-deep-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Next partner"
      >
        <svg className="w-6 h-6 text-deep-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {partners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "transition-all duration-300",
              (currentIndex % partners.length) === index
                ? "w-8 h-2 bg-rose-gold rounded-full" 
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400 rounded-full"
            )}
            aria-label={`Go to partner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}