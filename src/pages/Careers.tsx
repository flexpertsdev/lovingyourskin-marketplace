import React from 'react'
import { Layout } from '../components/layout'
import { Section, Container } from '../components/layout'
import { Card, CardContent } from '../components/ui'
import { Button } from '../components/ui'

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract'
  description: string
  requirements: string[]
}

const jobOpenings: JobOpening[] = []

const benefits = [
  {
    icon: '🌍',
    title: 'Global Impact',
    description: 'Work with brands and retailers across continents'
  },
  {
    icon: '💼',
    title: 'Flexible Working',
    description: 'Hybrid and remote options available'
  },
  {
    icon: '📈',
    title: 'Growth Opportunities',
    description: 'Fast-growing company with career advancement'
  },
  {
    icon: '✨',
    title: 'Product Perks',
    description: 'Exclusive access to K-beauty products'
  }
]

export const Careers: React.FC = () => {
  return (
    <Layout>
      <Section className="bg-gradient-to-br from-soft-pink to-white py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal tracking-wide mb-6">
              Join Our Team
            </h1>
            <p className="text-lg text-text-secondary">
              Help us revolutionize how the world discovers Korean beauty
            </p>
          </div>
        </Container>
      </Section>

      {/* Company Culture */}
      <Section background="white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-deep-charcoal mb-6">
                Why Loving Your Skin?
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                We're building the bridge between innovative Korean beauty brands and retailers worldwide. 
                Our mission is to make authentic K-beauty accessible to everyone, and we need passionate 
                people to help us achieve this vision.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <Card variant="default">
                <CardContent className="text-center">
                  <div className="text-3xl mb-4">🌏</div>
                  <h3 className="font-medium text-deep-charcoal mb-2">Global Reach</h3>
                  <p className="text-sm text-text-secondary">
                    Work with partners across 30+ countries and growing
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="text-center">
                  <div className="text-3xl mb-4">💡</div>
                  <h3 className="font-medium text-deep-charcoal mb-2">Innovation First</h3>
                  <p className="text-sm text-text-secondary">
                    Shape the future of beauty wholesale and distribution
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="text-center">
                  <div className="text-3xl mb-4">🤝</div>
                  <h3 className="font-medium text-deep-charcoal mb-2">Impact-Driven</h3>
                  <p className="text-sm text-text-secondary">
                    Help small retailers compete with major chains
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Our Values */}
            <div className="bg-gray-50 rounded-xl p-8 mb-16">
              <h3 className="text-2xl font-medium text-deep-charcoal mb-6 text-center">Our Values</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-deep-charcoal mb-2">Authenticity</h4>
                  <p className="text-text-secondary text-sm">
                    We believe in genuine products, honest relationships, and transparent business practices.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-deep-charcoal mb-2">Excellence</h4>
                  <p className="text-text-secondary text-sm">
                    We strive for the highest standards in everything we do, from product curation to customer service.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-deep-charcoal mb-2">Innovation</h4>
                  <p className="text-text-secondary text-sm">
                    We continuously evolve our platform and processes to better serve our partners.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-deep-charcoal mb-2">Partnership</h4>
                  <p className="text-text-secondary text-sm">
                    We succeed when our brands and retailers succeed. Their growth is our growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Benefits */}
      <Section className="bg-gradient-to-b from-white to-soft-pink/20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-light text-deep-charcoal mb-12 text-center">
              Benefits & Perks
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="font-medium text-deep-charcoal mb-2">{benefit.title}</h3>
                  <p className="text-sm text-text-secondary">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Open Positions */}
      <Section background="white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-light text-deep-charcoal mb-12 text-center">
              Open Positions
            </h2>
            
            {jobOpenings.length > 0 ? (
              <div className="space-y-6">
                {jobOpenings.map((job) => (
                  <Card key={job.id} variant="default" className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-deep-charcoal mb-2">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-4">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location}
                            </span>
                            <span className="bg-rose-gold/10 text-rose-gold px-3 py-1 rounded-full text-xs">
                              {job.type}
                            </span>
                          </div>
                          <p className="text-text-secondary mb-4">
                            {job.description}
                          </p>
                          <div>
                            <h4 className="font-medium text-deep-charcoal mb-2">Key Requirements:</h4>
                            <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                              {job.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button variant="primary" size="medium">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card variant="default">
                <CardContent className="text-center py-12">
                  <h3 className="text-xl font-medium text-deep-charcoal mb-4">
                    No open positions... but stay tuned!
                  </h3>
                  <p className="text-text-secondary mb-6">
                    We're always looking for talented individuals. Check back soon or send us your CV.
                  </p>
                  <Button variant="secondary" size="medium">
                    Send General Application
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </Section>

      {/* Join Us CTA */}
      <Section className="bg-gradient-to-br from-rose-gold/10 to-transparent py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-light text-deep-charcoal mb-6">
              Don't See the Right Role?
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              We're always interested in meeting talented people who share our passion for beauty and innovation. 
              Send us your CV and tell us how you can contribute to our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="large">
                Send General Application
              </Button>
              <Button variant="secondary" size="large">
                Join Talent Network
              </Button>
            </div>
            <p className="text-sm text-text-secondary mt-6">
              Email us at: <a href="mailto:careers@lovingyourskin.com" className="text-rose-gold hover:underline">
                careers@lovingyourskin.com
              </a>
            </p>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}