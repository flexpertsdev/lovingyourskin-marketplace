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
    title: 'Fast Delivery',
    description: 'Get your orders in 7-15 days, not months. We handle all logistics and customs clearance for you.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
      </svg>
    ),
    title: 'Transparent Pricing',
    description: 'See all costs upfront - product prices, shipping, and any fees. No hidden surprises.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
      </svg>
    ),
    title: 'Verified Brands',
    description: 'All brands are CPNP certified for UK/EU/CH markets. Shop with complete confidence.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    title: 'Simple Process',
    description: 'No complex forms, no language barriers. Everything handled in your preferred language.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 14v-2.47l6.88-6.88c.2-.2.51-.2.71 0l1.77 1.77c.2.2.2.51 0 .71L8.47 14H6zm12 0h-7.5l2-2H18v2z"/>
      </svg>
    ),
    title: 'In-App Messaging',
    description: 'Communicate directly with brands and our team. No more lost emails or language confusion.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ),
    title: 'Dedicated Support',
    description: 'Your personal sales rep guides you through every order, ensuring smooth transactions.'
  }
]

const features = [
  {
    title: 'Smart Inventory Management',
    description: 'Keep track of your stock levels, reorder points, and best sellers all in one place.',
    features: ['Real-time stock tracking', 'Low stock alerts', 'Sales analytics dashboard'],
    image: 'Smart Inventory Management'
  },
  {
    title: 'Flexible Payment Terms',
    description: 'Work with payment terms that suit your business cash flow needs.',
    features: ['30-day payment terms available', 'Multiple currency support', 'Secure payment processing'],
    image: 'Flexible Payment Options'
  }
]

const testimonials = [
  {
    quote: "LYS has transformed how we source K-beauty products. The process is so simple, and we've never had issues with customs or documentation.",
    author: 'Sarah Mitchell',
    company: 'Beauty Boutique London'
  },
  {
    quote: "Finally, a platform that understands retailers' needs. The minimum order quantities are reasonable, and the support team is always helpful.",
    author: 'Marco Rossi',
    company: 'Milano Beauty Store'
  },
  {
    quote: "The in-app messaging system is brilliant. We can track everything in one place and never miss important updates about our orders.",
    author: 'Emma Schmidt',
    company: 'Berlin Cosmetics'
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
      <section className="py-20 px-6 bg-background-gray">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-16 text-deep-charcoal">
            Everything You Need to Succeed
          </h2>
          
          <div className="space-y-20">
            {features.map((feature, index) => (
              <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="bg-soft-pink h-64 rounded-lg flex items-center justify-center text-text-secondary">
                    {feature.image}
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                  <h3 className="text-2xl font-medium mb-4">{feature.title}</h3>
                  <p className="text-text-secondary mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-rose-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{item}</span>
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
          <h2 className="text-3xl font-light text-center mb-16 text-deep-charcoal">
            What Retailers Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-soft-pink p-8 rounded-lg relative">
                <span className="text-6xl text-rose-gold/30 absolute top-4 left-4">"</span>
                <p className="italic mb-6 relative z-10">{testimonial.quote}</p>
                <div>
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