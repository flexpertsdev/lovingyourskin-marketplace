import React, { useState, useEffect } from 'react'
import { cn } from '../../lib/utils/cn'

interface BrandSlide {
  id: string
  brandName: string
  imageUrl: string
  altText: string
}

const brandSlides: BrandSlide[] = [
  {
    id: 'sunnicorn-1',
    brandName: 'Sunnicorn',
    imageUrl: '/assets/sunnicorn/brand-bg-img-03.jpg',
    altText: 'Sunnicorn premium K-beauty products'
  },
  {
    id: 'lalucell-1',
    brandName: 'LaluCell',
    imageUrl: '/assets/lalucell/hero1.png',
    altText: 'LaluCell innovative skincare solutions'
  },
  {
    id: 'thecelllab-1',
    brandName: 'The Cell Lab',
    imageUrl: '/assets/thecelllab/blue_001.jpg',
    altText: 'The Cell Lab advanced cosmetics'
  },
  {
    id: 'baohlab-1',
    brandName: 'Baohlab',
    imageUrl: '/assets/baohlab/hero1.jpg',
    altText: 'Baohlab natural beauty products'
  },
  {
    id: 'sunnicorn-2',
    brandName: 'Sunnicorn',
    imageUrl: '/assets/sunnicorn/sus-bg-img-01.jpg',
    altText: 'Sunnicorn sustainable beauty'
  },
  {
    id: 'lalucell-2',
    brandName: 'LaluCell',
    imageUrl: '/assets/lalucell/hero2.jpeg',
    altText: 'LaluCell premium skincare'
  },
  {
    id: 'thecelllab-2',
    brandName: 'The Cell Lab',
    imageUrl: '/assets/thecelllab/blue_05.jpg',
    altText: 'The Cell Lab scientific beauty'
  },
  {
    id: 'baohlab-2',
    brandName: 'Baohlab',
    imageUrl: '/assets/baohlab/hero2.jpg',
    altText: 'Baohlab K-beauty essentials'
  }
]

export const BrandHeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({})

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % brandSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isHovered])

  // Preload images
  useEffect(() => {
    brandSlides.forEach((slide) => {
      const img = new Image()
      img.src = slide.imageUrl
      img.onload = () => {
        setImageLoaded(prev => ({ ...prev, [slide.id]: true }))
      }
    })
  }, [])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section 
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br from-soft-pink to-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images with Ken Burns Effect */}
      <div className="absolute inset-0">
        {brandSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-in-out",
              index === currentIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
            )}
          >
            <div className="relative w-full h-full">
              {/* Image with Ken Burns animation */}
              <div 
                className={cn(
                  "absolute inset-0 bg-cover bg-center transition-transform duration-20000",
                  index === currentIndex && "animate-ken-burns"
                )}
                style={{
                  backgroundImage: imageLoaded[slide.id] ? `url(${slide.imageUrl})` : undefined,
                  backgroundColor: !imageLoaded[slide.id] ? 'rgba(212, 165, 165, 0.1)' : undefined
                }}
              />
              
              {/* Gradient overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        {/* Main Heading */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-wide drop-shadow-2xl">
            Only the best
          </h2>
          <div className="flex items-center justify-center gap-4 text-white/90">
            <span className="w-12 h-[1px] bg-white/60"></span>
            <p className="text-xl md:text-2xl font-light tracking-wider uppercase">
              Exclusive Brands
            </p>
            <span className="w-12 h-[1px] bg-white/60"></span>
          </div>
        </div>

        {/* Current Brand Name */}
        <div className="mb-12 overflow-hidden">
          <div
            className="transition-all duration-500 ease-in-out"
            style={{
              transform: `translateY(${currentIndex * -100}%)`,
            }}
          >
            {brandSlides.map((slide) => (
              <div
                key={slide.id}
                className="h-12 flex items-center justify-center"
              >
                <span className="text-white/80 text-lg md:text-xl font-medium tracking-wider">
                  {slide.brandName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-2">
          {brandSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "w-8 bg-white" 
                  : "bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Fade for smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      {/* Custom styles for Ken Burns effect */}
      <style>{`
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.1) translate(-2%, -2%);
          }
        }
        
        .animate-ken-burns {
          animation: ken-burns 20s ease-out infinite alternate;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </section>
  )
}