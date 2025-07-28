import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../components/layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

// Icon components
const BusinessIcon = () => (
  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

const BoutiqueIcon = () => (
  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

export const Welcome: React.FC = () => {
  const navigate = useNavigate()
  const [hoveredSide, setHoveredSide] = useState<'business' | 'boutique' | null>(null)

  const businessBenefits = [
    'Wholesale pricing & bulk orders',
    'Verified retailer network',
    'Direct brand partnerships',
    'Exclusive B2B support'
  ]

  const boutiqueBenefits = [
    'Premium K-beauty products',
    'Retail-friendly pricing',
    'Fast shipping options',
    'Exclusive pre-orders'
  ]

  return (
    <div className="min-h-screen bg-soft-pink">
      <Container className="py-8">
        {/* Logo Header */}
        <div className="text-center mb-12">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/lovingyourskinshop.firebasestorage.app/o/WhatsApp_Image_2025-06-22_at_11.43.11-removebg-preview.png?alt=media&token=237442fd-02cb-48ee-9628-1c68fd45add5" 
            alt="Loving Your Skin" 
            className="h-20 mx-auto object-contain mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal mb-4">
            Welcome to Loving Your Skin
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Your gateway to authentic Korean beauty. Choose your journey below.
          </p>
        </div>

        {/* Split Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Business Side */}
          <div 
            onMouseEnter={() => setHoveredSide('business')}
            onMouseLeave={() => setHoveredSide(null)}
            className="relative"
          >
            <Card 
              className={`h-full transition-all duration-300 cursor-pointer border-2 ${
                hoveredSide === 'business' 
                  ? 'border-rose-gold shadow-2xl transform scale-105' 
                  : 'border-transparent hover:border-gray-200'
              }`}
              onClick={() => navigate('/login')}
            >
              <div className="p-8 lg:p-12 text-center">
                <div className={`mb-6 transition-colors duration-300 ${
                  hoveredSide === 'business' ? 'text-rose-gold' : 'text-deep-charcoal'
                }`}>
                  <BusinessIcon />
                </div>
                
                <h2 className="text-3xl font-light text-deep-charcoal mb-4">
                  For Business
                </h2>
                
                <p className="text-text-secondary mb-8">
                  Join our exclusive B2B marketplace for verified retailers and beauty professionals
                </p>

                <div className="space-y-3 mb-8 text-left">
                  {businessBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-rose-gold mt-0.5 flex-shrink-0">
                        <CheckIcon />
                      </span>
                      <span className="text-text-secondary">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full transition-all duration-300 ${
                    hoveredSide === 'business' 
                      ? 'bg-rose-gold hover:bg-rose-gold-dark' 
                      : ''
                  }`}
                >
                  Enter B2B Portal
                </Button>

                <p className="text-sm text-text-secondary mt-4">
                  Invite code required
                </p>
              </div>
            </Card>
          </div>

          {/* Boutique Side */}
          <div 
            onMouseEnter={() => setHoveredSide('boutique')}
            onMouseLeave={() => setHoveredSide(null)}
            className="relative"
          >
            <Card 
              className={`h-full transition-all duration-300 cursor-pointer border-2 ${
                hoveredSide === 'boutique' 
                  ? 'border-rose-gold shadow-2xl transform scale-105' 
                  : 'border-transparent hover:border-gray-200'
              }`}
              onClick={() => navigate('/shop')}
            >
              <div className="p-8 lg:p-12 text-center">
                <div className={`mb-6 transition-colors duration-300 ${
                  hoveredSide === 'boutique' ? 'text-rose-gold' : 'text-deep-charcoal'
                }`}>
                  <BoutiqueIcon />
                </div>
                
                <h2 className="text-3xl font-light text-deep-charcoal mb-4">
                  Shop Boutique
                </h2>
                
                <p className="text-text-secondary mb-8">
                  Discover curated K-beauty products for your personal skincare journey
                </p>

                <div className="space-y-3 mb-8 text-left">
                  {boutiqueBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-rose-gold mt-0.5 flex-shrink-0">
                        <CheckIcon />
                      </span>
                      <span className="text-text-secondary">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="secondary"
                  className={`w-full transition-all duration-300 ${
                    hoveredSide === 'boutique' 
                      ? 'bg-rose-gold text-white hover:bg-rose-gold-dark border-rose-gold' 
                      : ''
                  }`}
                >
                  Shop Now
                </Button>

                <p className="text-sm text-text-secondary mt-4">
                  No account needed
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-text-secondary">
            Not sure which to choose?{' '}
            <Link to="/faq" className="text-rose-gold hover:underline">
              Learn more about our services
            </Link>
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link to="/about" className="text-text-secondary hover:text-rose-gold transition-colors">
              About Us
            </Link>
            <span className="text-border-gray">•</span>
            <Link to="/contact" className="text-text-secondary hover:text-rose-gold transition-colors">
              Contact
            </Link>
            <span className="text-border-gray">•</span>
            <Link to="/brands" className="text-text-secondary hover:text-rose-gold transition-colors">
              Our Brands
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}