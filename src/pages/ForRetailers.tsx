import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Button } from '../components/ui'

const benefits = [
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
      </svg>
    ),
    title: 'Efficient Delivery',
    description: 'Quick turnaround times with our streamlined fulfillment process designed for your success.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
      </svg>
    ),
    title: 'Clear Pricing',
    description: 'Straightforward pricing structure with no hidden costs - know exactly what you\'re paying for.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
      </svg>
    ),
    title: 'Quality Assured',
    description: 'Carefully selected brands that meet the highest standards for your market requirements.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    title: 'Frictionless Process',
    description: 'Smooth operations from order to delivery - we eliminate the complexities of international trade.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 14v-2.47l6.88-6.88c.2-.2.51-.2.71 0l1.77 1.77c.2.2.2.51 0 .71L8.47 14H6zm12 0h-7.5l2-2H18v2z"/>
      </svg>
    ),
    title: 'Direct Communication',
    description: 'Stay connected with brands and our team through our integrated messaging platform.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ),
    title: 'Expert Support',
    description: 'Dedicated specialists who understand your business and guide you to success.'
  }
]

const features = [
  {
    title: 'Smart Inventory Management',
    description: 'Keep track of your stock levels, reorder points, and best sellers all in one place.',
    features: ['Real-time stock tracking', 'Low stock alerts', 'Sales analytics dashboard'],
    icon: (
      <svg className="w-24 h-24 text-rose-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3h18v18H3V3z" />
        <path d="M3 9h18M9 21V9" />
        <path d="M15 13v4m0 0l-2-2m2 2l2-2" />
        <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.2" />
      </svg>
    )
  },
  {
    title: 'Flexible Payment Terms',
    description: 'Work with payment terms that suit your business cash flow needs.',
    features: ['30-day payment terms available', 'Multiple currency support', 'Secure payment processing'],
    icon: (
      <svg className="w-24 h-24 text-rose-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
        <circle cx="17" cy="15" r="1.5" fill="currentColor" />
        <path d="M12 3v3M12 18v3" strokeWidth="2" />
      </svg>
    )
  }
]

const testimonials = [
  {
    quote: "Very clear and complete communication with excellent responsiveness. They fully met our specific needs for products, lead times, and exclusivities with no difficulties throughout our collaboration.",
    author: 'Camille',
    company: 'Beauté Privée',
    companyDetails: '5 million members across France, Belgium, Luxembourg',
    rating: 5,
    logo: 'https://media.licdn.com/dms/image/v2/C4E0BAQG82zVO9g8uyw/company-logo_200_200/company-logo_200_200/0/1672739255113/beauteprivee_logo?e=2147483647&v=beta&t=5cBvLIlKpRh4E8Uyrwp0nz3V9cmNn8Gv6kz0hnsB6L4'
  }
]

export const ForRetailers: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-soft-pink to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-deep-charcoal">
            Built for Beauty Retailers
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Access authentic Korean beauty products with confidence. No language barriers, 
            no customs headaches, just pure K-beauty.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-16 text-deep-charcoal">
            Why Retailers Choose LYS
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-background-gray p-8 rounded-lg">
                <div className="text-rose-gold mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-medium mb-3">{benefit.title}</h3>
                <p className="text-text-secondary">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFF5F7' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-16 text-deep-charcoal">
            Everything You Need to Succeed
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 bg-white border border-rose-gold/20 rounded-full flex items-center justify-center shadow-inner">
                    {feature.icon}
                  </div>
                </div>
                
                {/* Content Card */}
                <div className="bg-white border border-rose-gold/20 rounded-lg p-6 shadow-inner">
                  {/* Title */}
                  <h3 className="text-2xl font-medium mb-4 text-deep-charcoal">{feature.title}</h3>
                  
                  {/* Description */}
                  <p className="text-text-secondary mb-6 max-w-sm mx-auto">{feature.description}</p>
                  
                  {/* Features List */}
                  <ul className="space-y-3 max-w-sm mx-auto text-left">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-rose-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span className="text-text-primary">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-4 text-deep-charcoal">
            Trusted by Leading European Retailers
          </h2>
          <p className="text-center text-text-secondary mb-16 max-w-3xl mx-auto">
            Join successful retailers who are already transforming their business with authentic K-beauty
          </p>
          
          <div className="max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-soft-pink to-white p-10 rounded-xl shadow-lg">
                {/* Header with logo and rating */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {testimonial.logo && (
                      <img 
                        src={testimonial.logo} 
                        alt={testimonial.company}
                        className="h-16 w-auto object-contain"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-deep-charcoal text-lg">{testimonial.company}</h3>
                      {testimonial.companyDetails && (
                        <p className="text-sm text-text-secondary">{testimonial.companyDetails}</p>
                      )}
                    </div>
                  </div>
                  {testimonial.rating && (
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Testimonial */}
                <div className="relative mb-6">
                  <span className="text-6xl text-rose-gold/20 absolute -top-4 -left-2">"</span>
                  <p className="text-lg italic text-deep-charcoal relative z-10 pl-8">
                    {testimonial.quote}
                  </p>
                </div>
                
                {/* Author */}
                <div className="text-right">
                  <p className="font-medium text-deep-charcoal">{testimonial.author}</p>
                  <p className="text-sm text-text-secondary">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-rose-gold text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-6">
            Ready to Transform Your K-Beauty Business?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join the exclusive network of retailers accessing authentic Korean beauty products.
          </p>
          <Link to="/contact">
            <Button size="large" variant="secondary" className="bg-white text-rose-gold hover:bg-soft-pink">
              Request Your Invitation
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}