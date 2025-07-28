import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Section, Container, Grid } from '../components/layout'
import { Button, Card, CardContent } from '../components/ui'

const stats = [
  {
    value: '10+',
    label: 'Years of Experience',
    description: 'In skincare retail & distribution'
  },
  {
    value: (
      <img 
        src="/assets/kotra-logo.png"
        alt="KOTRA Logo"
        className="h-16 w-auto object-contain"
      />
    ),
    label: 'Official KOTRA Partner',
    description: 'Certified K-beauty network'
  },
  {
    value: '5',
    label: 'New Brands Yearly',
    description: 'Exclusive partnerships'
  },
  {
    value: '24/7',
    label: 'Support',
    description: 'Dedicated team assistance'
  }
]

const values = [
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Authenticity',
    description: 'Every brand and product is verified, ensuring you receive only genuine K-beauty products with full certifications.'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'Global Reach',
    description: 'Connecting Korean beauty brands with retailers worldwide, breaking down traditional import barriers.'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: 'Fair Trade',
    description: 'Transparent pricing and fair terms for both brands and retailers, fostering long-term partnerships.'
  }
]

export const About: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-soft-pink to-white py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-light text-deep-charcoal tracking-wide mb-6">
              Bringing the Best of Korean Beauty to Global Retailers
            </h1>
            <p className="text-xl text-text-secondary mb-10">
              We help retailers discover and stock the most innovative K-beauty brands, 
              making authentic Korean skincare accessible to customers worldwide.
            </p>
          </div>
        </Container>
      </Section>

      {/* Mission Section */}
      <Section background="white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-center text-deep-charcoal mb-12">
              Our Mission
            </h2>
            <div className="bg-gradient-to-r from-rose-gold/10 to-transparent border-l-4 border-rose-gold p-8 mb-12">
              <p className="text-lg text-text-secondary leading-relaxed">
                At Loving Your Skin, we believe every retailer should have access to the transformative 
                power of Korean beauty. We've spent over a decade building relationships, understanding 
                market needs, and perfecting the wholesale process. Today, we're the trusted bridge between 
                innovative K-beauty brands and ambitious retailers looking to offer their customers 
                the very best in skincare.
              </p>
            </div>
          </div>
          
          {/* VSL Video Placeholder */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-rose-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-text-secondary">Video coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section background="gray" className="py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="h-20 flex justify-center items-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  {typeof stat.value === 'string' ? (
                    <span className="text-5xl md:text-6xl font-light text-rose-gold">{stat.value}</span>
                  ) : (
                    <div className="relative">
                      {stat.value}
                      {/* Add subtle animation for KOTRA logo */}
                      {index === 1 && (
                        <div className="absolute inset-0 bg-rose-gold/10 rounded-full blur-2xl animate-pulse" />
                      )}
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-deep-charcoal mb-1 uppercase tracking-wider">
                  {stat.label}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-[150px] mx-auto">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Values Section */}
      <Section background="white">
        <Container>
          <h2 className="text-3xl md:text-4xl font-light text-center text-deep-charcoal mb-12">
            What Sets Us Apart
          </h2>
          <Grid cols={3} gap="lg">
            {values.map((value, index) => (
              <Card key={index} variant="default" className="text-center h-full">
                <CardContent className="py-8">
                  <div className="text-rose-gold mb-4 flex justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-medium text-deep-charcoal mb-3">
                    {value.title}
                  </h3>
                  <p className="text-text-secondary">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>



      {/* Our Story Section */}
      <Section background="white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-center text-deep-charcoal mb-12">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none text-text-secondary">
              <p className="mb-6">
                Loving Your Skin was born from a simple observation: while Korean beauty was taking 
                the world by storm, many retailers struggled to access authentic products and navigate 
                the complexities of international wholesale.
              </p>
              <p className="mb-6">
                With over 10 years of experience in skincare reselling, we've witnessed firsthand the 
                challenges retailers face - from verifying product authenticity to meeting minimum order 
                quantities, handling certifications, and building trust with overseas suppliers.
              </p>
              <p className="mb-6">
                We created Loving Your Skin to solve these challenges. Our platform isn't just a 
                marketplace - it's a curated ecosystem where every brand is verified, every product 
                is certified, and every transaction is supported by our experienced team.
              </p>
              <p>
                Today, we're proud to be the trusted partner for retailers across Europe and beyond, 
                helping them bring the innovation and quality of K-beauty to their customers.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-deep-charcoal text-white py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Ready to Transform Your Beauty Business?
            </h2>
            <p className="text-xl mb-10 text-gray-300">
              Join the growing network of successful retailers sourcing authentic K-beauty through Loving Your Skin.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/for-retailers">
                <Button size="large" variant="primary">
                  Start as a Retailer
                </Button>
              </Link>
              <Link to="/for-brands">
                <Button size="large" variant="secondary">
                  Join as a Brand
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}