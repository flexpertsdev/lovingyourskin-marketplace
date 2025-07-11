import React, { useState } from 'react'
import { Layout } from '../components/layout'
import { Section, Container } from '../components/layout'
import { Card, CardContent } from '../components/ui'
import { Button } from '../components/ui'
import { Input } from '../components/ui'

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission
    console.log('Contact form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <Layout>
      <Section className="bg-gradient-to-br from-soft-pink to-white py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal tracking-wide mb-6">
              Contact Us
            </h1>
            <p className="text-lg text-text-secondary">
              Ready to bring authentic K-beauty to your shelves? Let's talk.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-8">
                  Get in Touch
                </h2>
                
                <div className="space-y-6">
                  <Card variant="default">
                    <CardContent className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-rose-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-rose-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-deep-charcoal mb-2">Headquarters</h3>
                        <p className="text-text-secondary">
                          London, United Kingdom<br />
                          <span className="text-sm">UK Company Registration: 123456789</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="default">
                    <CardContent className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-rose-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-rose-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-deep-charcoal mb-2">Email</h3>
                        <p className="text-text-secondary">
                          General Inquiries: hello@lovingyourskin.com<br />
                          Sales: sales@lovingyourskin.com<br />
                          Support: support@lovingyourskin.com
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="default">
                    <CardContent className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-rose-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-rose-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-deep-charcoal mb-2">Business Hours</h3>
                        <p className="text-text-secondary">
                          Monday - Friday: 9:00 AM - 6:00 PM GMT<br />
                          Saturday - Sunday: Closed<br />
                          <span className="text-sm">Response within 24 business hours</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="default">
                    <CardContent className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-rose-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-rose-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-deep-charcoal mb-2">Regional Office</h3>
                        <p className="text-text-secondary">
                          Seoul, South Korea<br />
                          Direct access to K-beauty brands<br />
                          <span className="text-sm">Local time: GMT+9</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <h3 className="font-medium text-deep-charcoal mb-4">Connect With Us</h3>
                  <div className="flex gap-4">
                    <a 
                      href="https://www.instagram.com/lys_ltd/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-rose-gold hover:text-deep-charcoal transition-colors"
                    >
                      Instagram
                    </a>
                    <a 
                      href="https://www.linkedin.com/company/loving-your-skin/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-rose-gold hover:text-deep-charcoal transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-8">
                  Send Us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Your Name *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Company Name *
                      </label>
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        placeholder="Beauty Boutique Ltd"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@beautyboutique.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+44 20 1234 5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="partnership">Become a Retailer</option>
                      <option value="brands">Brand Partnership</option>
                      <option value="support">Customer Support</option>
                      <option value="press">Press & Media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold resize-none"
                      placeholder="Tell us about your business and how we can help..."
                      required
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-text-secondary">
                    <p>
                      By submitting this form, you agree to our Privacy Policy and consent to 
                      receive communications from Loving Your Skin about our services.
                    </p>
                  </div>

                  <Button type="submit" variant="primary" size="large" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <Card variant="default">
                <CardContent className="text-center">
                  <h3 className="font-medium text-deep-charcoal mb-2">For Retailers</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Ready to add premium K-beauty to your product range? Our team will guide you through the process.
                  </p>
                  <a href="/for-retailers" className="text-rose-gold hover:underline text-sm">
                    Learn more →
                  </a>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="text-center">
                  <h3 className="font-medium text-deep-charcoal mb-2">For Brands</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Expand your reach to international markets with our established retailer network.
                  </p>
                  <a href="/for-brands" className="text-rose-gold hover:underline text-sm">
                    Partner with us →
                  </a>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="text-center">
                  <h3 className="font-medium text-deep-charcoal mb-2">FAQs</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Find answers to common questions about our platform, ordering, and partnerships.
                  </p>
                  <a href="/faq" className="text-rose-gold hover:underline text-sm">
                    View FAQs →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}