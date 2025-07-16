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
    icon: (
      <svg className="w-24 h-24 text-rose-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6M9 12h6M9 15h4" />
        <circle cx="18" cy="6" r="3" fill="currentColor" opacity="0.3" />
        <text x="18" y="7" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">!</text>
        <path d="M14 20v2m-4-2v2" strokeWidth="2" />
      </svg>
    )
  },
  {
    title: 'Promote Your Brand',
    description: 'Share your brand story, product launches, and promotions directly with interested retailers.',
    features: ['Brand showcase page', 'New product announcements', 'Promotional campaigns'],
    icon: (
      <svg className="w-24 h-24 text-rose-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" opacity="0.2" />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    )
  }
]

const successStories = [
  {
    quote: "I'm really satisfied with LYS representing my brand in EU countries. LYS is my number one priority VIP partner. Every time I contact you, I always learn something new including sales skills, wisdom, and how to approach end customers, especially for BP projects.",
    author: 'Minsu Park',
    company: 'WISMIN',
    logo: 'https://cafe24.poxo.com/ec01/newglab01/EjglQcnyYl9oLKpqUS6wZj7l3BQ8UVIze0OCEPC9yP8yvptJW9uyGG+88Z9/l/V/z2Hpl9MvqmKtsVq7YHSMaw==/_/web/upload/wismin/logo_top.png',
    metric: 'Introduced to French market in 60 days',
    metricIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    rating: 5,
    nps: 10,
    satisfaction: '100%',
    additionalQuotes: [
      "LYS is doing great. I like it.",
      "LYS is doing perfect work. I believe we learned each other for sharing progress and idea."
    ]
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
                  <div className="bg-soft-pink h-64 rounded-lg flex items-center justify-center">
                    {feature.icon}
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
          <h2 className="text-3xl font-light text-center mb-4 text-deep-charcoal">
            Brand Success Stories
          </h2>
          <p className="text-center text-text-secondary mb-16 max-w-3xl mx-auto">
            See how we've helped K-beauty brands expand into European markets with proven results
          </p>
          
          <div className="max-w-4xl mx-auto">
            {successStories.map((story, index) => (
              <div key={index} className="bg-gradient-to-br from-soft-pink to-white p-10 rounded-xl shadow-lg">
                {/* Header with logo and metrics */}
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  {/* Brand info with logo */}
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 bg-white rounded-lg shadow-sm flex items-center justify-center p-4">
                      <img 
                        src={story.logo} 
                        alt={story.company}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-medium text-deep-charcoal">{story.company}</h3>
                      <p className="text-text-secondary mt-1">{story.author}</p>
                      <div className="flex gap-1 mt-3">
                        {[...Array(story.rating)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  <div className="flex-1 flex items-center justify-end gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-light text-rose-gold">{story.nps}/10</p>
                      <p className="text-sm text-text-secondary">NPS Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-light text-success-green">{story.satisfaction}</p>
                      <p className="text-sm text-text-secondary">Satisfaction</p>
                    </div>
                  </div>
                </div>
                
                {/* Main testimonial */}
                <div className="relative mb-8">
                  <span className="text-6xl text-rose-gold/20 absolute -top-4 -left-2">"</span>
                  <p className="text-lg italic text-deep-charcoal relative z-10 pl-8">
                    {story.quote}
                  </p>
                </div>
                
                {/* Key achievement */}
                <div className="bg-rose-gold text-white py-4 px-6 rounded-lg mb-6 flex items-center justify-center gap-3">
                  <span className="text-white">{story.metricIcon}</span>
                  <span className="font-medium text-lg">{story.metric}</span>
                </div>
                
                {/* Additional feedback */}
                {story.additionalQuotes && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-deep-charcoal">Additional Feedback:</p>
                    {story.additionalQuotes.map((quote, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-rose-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-text-secondary italic">"{quote}"</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Survey insights */}
                <div className="mt-6 pt-6 border-t border-border-gray">
                  <p className="text-sm font-medium text-deep-charcoal mb-3">Partnership Highlights:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-lg font-medium text-rose-gold">France</p>
                      <p className="text-xs text-text-secondary">Market Entry</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-rose-gold">Very Clear</p>
                      <p className="text-xs text-text-secondary">Communication</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-rose-gold">No Issues</p>
                      <p className="text-xs text-text-secondary">Process</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-rose-gold">Yes</p>
                      <p className="text-xs text-text-secondary">Expand Further</p>
                    </div>
                  </div>
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