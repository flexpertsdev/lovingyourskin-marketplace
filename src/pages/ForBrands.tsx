import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Button } from '../components/ui'

const benefits = [
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Market Expansion',
    description: 'Connect with established retailers across premium European markets effortlessly.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    title: 'Trusted Network',
    description: 'Work with verified business partners through our carefully vetted retailer network.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    title: 'Simplified Operations',
    description: 'Focus on your products while we streamline the complexities of international trade.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2C14.75 2 17 6.48 17 12s-2.25 10-5 10-5-4.48-5-10 2.25-10 5-10z"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    title: 'No Communication Barriers',
    description: 'Seamless interaction with international partners - we facilitate smooth communication.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Minimal Administration',
    description: 'Keep your documentation simple - we ensure compliance with market requirements.'
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'Dedicated Partnership',
    description: 'Expert support team committed to your international success.'
  }
]

const features = [
  {
    title: 'Efficient Order Management',
    description: 'Manage all your international orders in one place with real-time updates and automated processes.',
    features: ['Instant order notifications', 'Bulk order processing', 'Automated invoicing'],
    image: 'Order Dashboard'
  },
  {
    title: 'Promote Your Brand',
    description: 'Share your brand story, product launches, and promotions directly with interested retailers.',
    features: ['Brand showcase page', 'New product announcements', 'Promotional campaigns'],
    image: 'Marketing Tools'
  }
]

const successStories = [
  {
    quote: "LYS opened doors we couldn't reach before. We're now in 50+ stores across Europe without any export headaches.",
    author: 'Kim Min-jung',
    company: 'CEO, Beauty of Joseon',
    metric: '300% growth in 6 months',
    metricIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    )
  },
  {
    quote: "The platform handles everything from translation to shipping. We just focus on making great products.",
    author: 'Park Ji-ho',
    company: 'Founder, PURITO',
    metric: 'Now in 12 countries',
    metricIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    )
  },
  {
    quote: "Regular reorders from verified retailers gave us the confidence to expand our production capacity.",
    author: 'Lee Soo-jin',
    company: 'COO, COSRX',
    metric: '85% reorder rate',
    metricIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 12H4M20 12L14 6M20 12L14 18"></path>
      </svg>
    )
  }
]

export const ForBrands: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-soft-pink to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-deep-charcoal">
            Grow Your K-Beauty Brand Globally
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Connect with verified international retailers. We handle the complexity, you focus on growth.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-16 text-deep-charcoal">
            Why Brands Choose LYS
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
            Platform Features
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

      {/* Success Stories Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-16 text-deep-charcoal">
            Success Stories
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-soft-pink p-8 rounded-lg relative">
                <span className="text-6xl text-rose-gold/30 absolute top-4 left-4">"</span>
                <p className="italic mb-6 relative z-10">{story.quote}</p>
                <div className="mb-4">
                  <p className="font-medium text-deep-charcoal">{story.author}</p>
                  <p className="text-sm text-text-secondary">{story.company}</p>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-rose-gold/30">
                  <span className="text-success-green">{story.metricIcon}</span>
                  <span className="font-medium">{story.metric}</span>
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
            Ready to Take Your Brand Global?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join leading K-beauty brands already expanding internationally with LYS.
          </p>
          <Link to="/contact">
            <Button size="large" variant="secondary" className="bg-white text-rose-gold hover:bg-soft-pink">
              Start Your Application
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}