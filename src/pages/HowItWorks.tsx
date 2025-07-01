import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Button } from '../components/ui'

const processSteps = [
  {
    number: '1',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    ),
    title: 'Receive Invitation',
    description: 'Get invited by your dedicated LYS sales representative who understands your business needs.'
  },
  {
    number: '2',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    title: 'Verify & Join',
    description: 'Complete quick verification and set up your account with your company details.'
  },
  {
    number: '3',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
      </svg>
    ),
    title: 'Shop & Order',
    description: 'Browse verified brands, check certifications, and place orders with transparent pricing.'
  }
]

const timelineSteps = [
  {
    day: 'Day 1',
    title: 'Place Your Order',
    description: 'Select products, meet minimum order quantities, and submit your order through our platform.'
  },
  {
    day: 'Day 1-2',
    title: 'Order Confirmation',
    description: 'We verify your order with the brand and confirm availability. You\'ll receive updates via in-app messaging.'
  },
  {
    day: 'Day 3',
    title: 'Documentation & Invoice',
    description: 'Receive your final invoice including all costs. We handle all customs documentation for you.'
  },
  {
    day: 'Day 4-5',
    title: 'Payment & Processing',
    description: 'Complete payment through secure channels. Your order is prepared for shipment.'
  },
  {
    day: 'Day 6-15',
    title: 'Shipping & Delivery',
    description: 'Track your shipment in real-time. Receive your products with all necessary documentation.'
  }
]

export const HowItWorks: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-soft-pink py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-deep-charcoal">
            How LYS Works
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            A seamless B2B marketplace connecting verified Korean beauty brands with 
            international retailers through a simple, transparent process.
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-16 text-deep-charcoal">
            Simple Steps to Start Selling K-Beauty
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-rose-gold text-white rounded-full flex items-center justify-center text-2xl font-light absolute -top-2 -right-2">
                    {step.number}
                  </div>
                  <div className="w-24 h-24 bg-soft-pink rounded-full flex items-center justify-center text-rose-gold">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6 bg-background-gray">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-16 text-deep-charcoal">
            Your Order Journey
          </h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border-gray hidden md:block" />
            
            {/* Timeline items */}
            <div className="space-y-8">
              {timelineSteps.map((step, index) => (
                <div key={index} className="relative flex gap-6">
                  {/* Dot */}
                  <div className="absolute left-6 top-2 w-4 h-4 bg-rose-gold rounded-full hidden md:block" />
                  
                  {/* Content */}
                  <div className="flex-1 bg-white p-6 rounded-lg shadow-sm md:ml-12">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                      <span className="text-sm text-rose-gold font-medium">{step.day}</span>
                      <h4 className="text-lg font-medium text-deep-charcoal">{step.title}</h4>
                    </div>
                    <p className="text-text-secondary">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-6 text-deep-charcoal">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Join hundreds of retailers already sourcing authentic K-beauty products through LYS.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/for-retailers">
              <Button size="large">Learn More for Retailers</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="large">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}