import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Section, Grid } from '../components/layout'
import { Button, Input, Textarea, Card, CardContent } from '../components/ui'
import { Layout } from '../components/layout'
import { TestimonialCard, PartnerCard } from '../components/features'

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
    title: 'Proven Market Expertise',
    description: 'Years of experience in the K-beauty industry, connecting the right brands with the right retailers'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    title: 'Curated Selection',
    description: 'Hand-selected brands certified for your market, ensuring quality and compliance every time'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    title: 'Seamless Experience',
    description: 'A smooth, frictionless process from discovery to delivery - we make international trade simple'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
    title: 'Better Margins',
    description: 'Direct partnerships and transparent pricing structure designed to maximize your profitability'
  }
]

const testimonials = [
  {
    id: '1',
    company: 'Beauté Privée',
    logo: 'https://media.licdn.com/dms/image/v2/C4E0BAQG82zVO9g8uyw/company-logo_200_200/company-logo_200_200/0/1672739255113/beauteprivee_logo?e=2147483647&v=beta&t=5cBvLIlKpRh4E8Uyrwp0nz3V9cmNn8Gv6kz0hnsB6L4',
    quote: 'Very clear and complete communication with excellent responsiveness. They fully met our specific needs for products, lead times, and exclusivities with no difficulties throughout our collaboration.',
    author: 'Camille',
    companyDetails: '5 million members across France, Belgium, Luxembourg',
    rating: 5
  }
]

const benefits = {
  retailers: [
    {
      title: 'Efficient Sourcing',
      description: 'Streamlined process that saves you time and resources'
    },
    {
      title: 'No Barriers',
      description: 'Hassle-free international trade with full support at every step'
    },
    {
      title: 'Flexible Terms',
      description: 'Order quantities designed to work for businesses of all sizes'
    },
    {
      title: 'Expert Guidance',
      description: 'Dedicated support from K-beauty specialists who understand your needs'
    }
  ],
  brands: [
    {
      title: 'Market Access',
      description: 'Connect with established retailers across premium European markets'
    },
    {
      title: 'Simplified Process',
      description: 'We make international expansion smooth and manageable'
    },
    {
      title: 'Secure Partnerships',
      description: 'Work with trusted retailers through our vetted network'
    },
    {
      title: 'Growth Support',
      description: 'Strategic guidance to help your brand succeed internationally'
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
          <div className="mb-8">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/lovingyourskinshop.firebasestorage.app/o/WhatsApp_Image_2025-06-22_at_11.43.11-removebg-preview.png?alt=media&token=237442fd-02cb-48ee-9628-1c68fd45add5" 
              alt="Loving Your Skin Logo" 
              className="h-24 md:h-32 mx-auto object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-deep-charcoal tracking-wide mb-6">
            Your Curated K-Beauty B2B Wholesale Marketplace
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
            Enter Europe's Explosive K-Beauty Growth
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-light text-rose-gold mb-3">$32.5B</div>
              <h3 className="text-lg font-medium text-deep-charcoal mb-2">Massive Market Opportunity</h3>
              <p className="text-text-secondary">Europe K-beauty market projected by 2030</p>
              <p className="text-sm text-rose-gold mt-2 font-medium">Proven Demand</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-light text-rose-gold mb-3">80%</div>
              <h3 className="text-lg font-medium text-deep-charcoal mb-2">Exceptional Profitability</h3>
              <p className="text-text-secondary">Gross profit margins for premium K-beauty products</p>
              <p className="text-sm text-rose-gold mt-2 font-medium">Profitable Product</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-light text-rose-gold mb-3">9.61%</div>
              <h3 className="text-lg font-medium text-deep-charcoal mb-2">Rapid Market Growth</h3>
              <p className="text-text-secondary">Europe K-beauty market CAGR (2024-2032)</p>
              <p className="text-sm text-rose-gold mt-2 font-medium">Growing Market Segment</p>
            </div>
          </div>
          <p className="text-lg text-text-secondary mt-12 max-w-3xl mx-auto">
            The European K-beauty market is experiencing unprecedented growth. Partner with Loving Your Skin to capitalize on this 
            high-margin opportunity before your competitors do.
          </p>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section background="gray">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-deep-charcoal mb-6">
              Trusted by Leading European Retailers
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Don't just take our word for it. See what our partners have to say about working with Loving Your Skin.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                company={testimonial.company}
                logo={testimonial.logo}
                quote={testimonial.quote}
                author={testimonial.author}
                companyDetails={testimonial.companyDetails}
                rating={testimonial.rating}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* Exclusive Partners Section */}
      <Section background="white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-deep-charcoal mb-6">
              Our Exclusive Partners
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              The brands we sell are the products we use. We love them, our customers love them, 
              and most of all we trust them and their products.
            </p>
          </div>
          
          <div className="space-y-12 max-w-6xl mx-auto">
            {/* Lalucell */}
            <PartnerCard 
              brand={{
                name: 'LALUCELL',
                logo: 'https://contents.sixshop.com/uploadedFiles/240215/default/image_1682403801204.png',
                heroImage: 'https://contents.sixshop.com/thumbnails/uploadedFiles/240215/default/image_1682583004318_2500.png',
                description: 'The trusted choice of Korean mothers. Safe, natural skincare with patented technology and zero irritation - perfect for pregnancy and sensitive skin.',
                highlights: [
                  'Patented natural ingredient technology',
                  'Zero irritation formula safe for pregnancy',
                  'Trusted by thousands of Korean mothers',
                  'Clinically tested for sensitive skin'
                ]
              }}
              variant="side-by-side"
            />

            {/* Sunnicorn */}
            <PartnerCard 
              brand={{
                name: 'SUNNICORN',
                logo: 'https://en.sunnicorn.com/web/upload/images/logo-color.png',
                heroImage: 'https://en.sunnicorn.com/web/upload/images/press_img_02.jpg',
                description: 'Sustainable K-beauty through upcycled "ugly food" ingredients. 100% vegan formulations that respect your skin and our planet.',
                highlights: [
                  'Upcycled food waste ingredients',
                  '100% vegan certified formulations',
                  'Carbon-neutral production process',
                  'Award-winning sustainable beauty'
                ]
              }}
              variant="side-by-side"
            />

            {/* BAO H. LAB */}
            <PartnerCard 
              brand={{
                name: 'BAO H. LAB',
                logo: 'https://baohlab.com/clothic_studio/image/baohlab_logo.png',
                heroImage: 'https://ecimg.cafe24img.com/pg1166b57472775036/baogen07/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/aca91dd8cca6ec2264880e26abe3f316.jpg',
                description: 'Pioneering hair loss solutions through Biorenovation Technology. We combine eco-friendly microorganism technology with patented formulations to deliver effective hair growth and scalp care solutions.',
                highlights: [
                  'Patented Biorenovation Technology',
                  'Clinical proven hair growth results',
                  'Eco-friendly microorganism formulas',
                  '5-star customer satisfaction rating'
                ]
              }}
              variant="side-by-side"
            />

            {/* V'anhalla */}
            <PartnerCard 
              brand={{
                name: "V'anhalla",
                logo: 'https://cdn.imweb.me/thumbnail/20250116/9e0c6043131f4.png',
                heroImage: 'https://cdn.imweb.me/thumbnail/20250320/801f7de8bd96a.jpg',
                description: 'Simple & Easy vegan skincare with V\'anhalla. We boldly reduce complex routines and enhance essential ingredients for each skin concern, bringing true rest and vitality to your daily life.',
                highlights: [
                  'Vegan Society certified formulas',
                  'Simplified 2-in-1 skincare solutions',
                  'Essential ingredients for targeted care',
                  'Ceramide & Cica calm technology'
                ]
              }}
              variant="side-by-side"
            />

            {/* THE CELL LAB */}
            <PartnerCard 
              brand={{
                name: 'THE CELL LAB',
                logo: 'https://ecimg.cafe24img.com/pg1333b54691769079/thecelllab/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/bae4b4cdb9c0307a6fd07f6fbfa5ad99.png',
                heroImage: 'https://ecimg.cafe24img.com/pg1333b54691769079/thecelllab/web/product/big/20250627/8131a5ff4ef88c104d26a2725c5e257d.jpg',
                description: 'Pioneering skincare innovation with BETA-SITOSTEROL #pine CICA and patented CELLTONE technology. The best combination surpassing proven science for fundamental skin concerns.',
                highlights: [
                  'New generation Pine CICA technology',
                  'Patented CELLTONE complex',
                  'Clinically proven -7°C cooling effect',
                  'Advanced PDRN skin regeneration'
                ]
              }}
              variant="side-by-side"
            />
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