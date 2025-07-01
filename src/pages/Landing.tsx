import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Section, Grid } from '../components/layout'
import { Button, Input, Textarea, Card, CardContent } from '../components/ui'
import { Layout } from '../components/layout'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Proven Market Demand',
    description: 'Access a growing K-beauty segment with established retailers and proven customer demand'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    title: 'Verified Partners',
    description: 'All brands CPNP certified, all retailers verified businesses - trade with complete confidence'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    title: 'End-to-End Solution',
    description: 'We handle customs, logistics, translations, and payments - you focus on growing your business'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
    title: 'Higher Profit Margins',
    description: 'Direct B2B pricing with transparent costs means better margins for your business'
  }
]

const benefits = {
  retailers: [
    {
      title: 'Fast Delivery',
      description: '7-15 days delivery vs months with traditional importers'
    },
    {
      title: 'No Language Barriers',
      description: 'Everything handled in your preferred language'
    },
    {
      title: 'Flexible MOQs',
      description: 'Reasonable minimum orders suitable for all business sizes'
    },
    {
      title: 'Dedicated Support',
      description: 'Personal sales rep guides you through every order'
    }
  ],
  brands: [
    {
      title: 'Global Reach',
      description: 'Access verified retailers across UK, EU, and Switzerland'
    },
    {
      title: 'Zero Export Risk',
      description: 'We handle all international logistics and compliance'
    },
    {
      title: 'Guaranteed Payments',
      description: 'Secure transactions with verified business partners'
    },
    {
      title: 'Growth Support',
      description: 'Marketing tools to promote your brand internationally'
    }
  ]
}

export const Landing: React.FC = () => {
  const [userType, setUserType] = useState<'retailer' | 'brand' | 'other'>('retailer')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle form submission
    console.log('Form submitted:', { userType, ...formData })
  }
  
  return (
    <Layout>
      {/* Hero Section */}
      <Section className="text-center bg-gradient-to-br from-soft-pink to-white py-20">
        <Container>
          <h1 className="text-5xl md:text-6xl font-light text-deep-charcoal tracking-wide mb-6">
            The Trusted B2B K-Beauty Marketplace
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-3xl mx-auto">
            Loving Your Skin connects verified Korean beauty brands with established international retailers. 
            Built on years of retail experience and proven market demand.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/for-retailers">
              <Button size="large">For Retailers</Button>
            </Link>
            <Link to="/for-brands">
              <Button size="large" variant="secondary">For Brands</Button>
            </Link>
          </div>
        </Container>
      </Section>
      
      {/* Value Proposition */}
      <Section background="white">
        <Container>
          <h2 className="text-3xl md:text-4xl font-light text-center text-deep-charcoal mb-16">
            Why Choose Loving Your Skin
          </h2>
          <Grid cols={4} gap="lg">
            {features.map((feature, index) => (
              <Card key={index} variant="default" className="text-center">
                <CardContent className="py-8">
                  <div className="text-rose-gold mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-medium text-deep-charcoal mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Benefits by User Type */}
      <Section background="gray">
        <Container>
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Retailers */}
            <div>
              <h3 className="text-2xl font-medium text-deep-charcoal mb-6">For Retailers</h3>
              <p className="text-text-secondary mb-8">
                Join a growing network of successful retailers already sourcing authentic K-beauty products. 
                Our established relationships and proven processes eliminate the traditional barriers to importing.
              </p>
              <div className="space-y-4">
                {benefits.retailers.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <svg className="w-6 h-6 text-rose-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <div>
                      <h4 className="font-medium text-deep-charcoal">{benefit.title}</h4>
                      <p className="text-sm text-text-secondary">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/for-retailers" className="inline-block mt-6">
                <Button variant="secondary">Learn More</Button>
              </Link>
            </div>

            {/* For Brands */}
            <div>
              <h3 className="text-2xl font-medium text-deep-charcoal mb-6">For Brands</h3>
              <p className="text-text-secondary mb-8">
                Expand internationally without the complexity. We've already built the retailer network and 
                infrastructure - you just need to supply the products.
              </p>
              <div className="space-y-4">
                {benefits.brands.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <svg className="w-6 h-6 text-rose-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <div>
                      <h4 className="font-medium text-deep-charcoal">{benefit.title}</h4>
                      <p className="text-sm text-text-secondary">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/for-brands" className="inline-block mt-6">
                <Button variant="secondary">Learn More</Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Success Metrics */}
      <Section background="white" className="text-center">
        <Container>
          <h2 className="text-3xl md:text-4xl font-light text-deep-charcoal mb-16">
            Proven Success in K-Beauty Distribution
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-light text-rose-gold mb-2">300%</div>
              <p className="text-text-secondary">Average brand growth in 6 months</p>
            </div>
            <div>
              <div className="text-4xl font-light text-rose-gold mb-2">7-15</div>
              <p className="text-text-secondary">Days delivery time</p>
            </div>
            <div>
              <div className="text-4xl font-light text-rose-gold mb-2">85%</div>
              <p className="text-text-secondary">Retailer reorder rate</p>
            </div>
            <div>
              <div className="text-4xl font-light text-rose-gold mb-2">12+</div>
              <p className="text-text-secondary">Countries served</p>
            </div>
          </div>
        </Container>
      </Section>
      
      {/* Contact Section */}
      <div id="contact">
        <Section background="gray">
          <Container size="sm">
            <h2 className="text-3xl md:text-4xl font-light text-center text-deep-charcoal mb-10">
              Join the LYS Network
            </h2>
            <p className="text-center text-text-secondary mb-10">
              Ready to grow your K-beauty business? Get in touch to learn more about our invite-only platform.
            </p>
            
            <Card>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Type */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">
                      I am a...
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {(['retailer', 'brand', 'other'] as const).map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="userType"
                            value={type}
                            checked={userType === type}
                            onChange={(e) => setUserType(e.target.value as typeof userType)}
                            className="w-4 h-4 text-rose-gold focus:ring-rose-gold"
                          />
                          <span className="text-text-primary capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Name */}
                  <Input
                    label="Name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  
                  {/* Email */}
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  
                  {/* Message */}
                  <Textarea
                    label="Message"
                    placeholder="Tell us about your business..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                  
                  {/* Submit Button */}
                  <Button type="submit" size="large" fullWidth>
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Container>
        </Section>
      </div>
    </Layout>
  )
}