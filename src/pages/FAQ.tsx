import React, { useState } from 'react'
import { Layout } from '../components/layout'
import { Section, Container } from '../components/layout'
import { Card, CardContent } from '../components/ui'

interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'ordering' | 'shipping' | 'products' | 'account'
}

const faqs: FAQItem[] = [
  // General
  {
    question: 'What is Loving Your Skin?',
    answer: 'Loving Your Skin is an exclusive B2B wholesale marketplace connecting verified Korean beauty brands with established international retailers. We simplify the process of sourcing authentic K-beauty products for your retail business.',
    category: 'general'
  },
  {
    question: 'How is LYS different from other wholesale platforms?',
    answer: 'We offer a curated selection of verified K-beauty brands, all products come with proper certifications (CPNP, etc.), transparent wholesale pricing, dedicated support, and an invite-only system that ensures quality partnerships. Our 10+ years of experience in skincare retail means we understand your needs.',
    category: 'general'
  },
  
  // Account
  {
    question: 'How do I become a verified retailer?',
    answer: 'LYS operates on an invite-only basis. You\'ll need an invitation code from one of our sales representatives. Once you have a code, you can register and we\'ll verify your business details. This process ensures we maintain high-quality partnerships.',
    category: 'account'
  },
  {
    question: 'Can I have multiple users for my company account?',
    answer: 'Yes, you can add multiple users under your company account. Each user can have different permissions based on their role in your organization. Contact your account manager to set up additional users.',
    category: 'account'
  },
  
  // Ordering
  {
    question: 'What are minimum order quantities (MOQs)?',
    answer: 'MOQs vary by brand and product. Each brand sets their own minimums, typically ranging from 50-100 units per brand. You can see the specific MOQ for each product on its product page. Orders must meet the MOQ for each brand separately.',
    category: 'ordering'
  },
  {
    question: 'Can I mix different products to meet MOQs?',
    answer: 'Yes! You can mix different products from the same brand to meet their minimum order requirement. However, you cannot combine products from different brands to meet a single MOQ.',
    category: 'ordering'
  },
  {
    question: 'Can I cancel or modify an order?',
    answer: 'Yes, until shipment - as we\'re working closely with our brands, we offer more flexibility. Contact us as soon as possible if you need to modify your order.',
    category: 'ordering'
  },
  
  // Shipping
  {
    question: 'How long does shipping take?',
    answer: 'Typical delivery times are 7-14 business days for EU destinations and 10-21 business days for other international destinations. These times may vary based on customs clearance and your specific location.',
    category: 'shipping'
  },
  {
    question: 'Do you ship worldwide?',
    answer: 'We ship to most countries where K-beauty products are legally allowed. Some restrictions may apply based on local regulations. Contact us to confirm shipping to your specific location.',
    category: 'shipping'
  },
  {
    question: 'Who handles customs and import duties?',
    answer: 'As the importer of record, you are responsible for all customs duties, taxes, and import fees. We provide all necessary documentation including commercial invoices and certificates. We recommend working with a customs broker familiar with cosmetics imports.',
    category: 'shipping'
  },
  
  // Products
  {
    question: 'What certifications do products have?',
    answer: 'All products come with necessary certifications for sale in your market. This typically includes CPNP (EU), CPNP-UK, and other regional requirements. Specific certifications are listed on each product page.',
    category: 'products'
  },
  {
    question: 'Are all products authentic?',
    answer: 'Absolutely. We work directly with brands or their authorized distributors. Every product is 100% authentic and comes with full traceability. We have strict verification processes for all our brand partners.',
    category: 'products'
  },
  {
    question: 'Do you offer product samples?',
    answer: 'Some brands offer sample sets or travel sizes that can be purchased at lower MOQs. These are great for testing products before committing to larger orders. Check individual brand pages for sample availability.',
    category: 'products'
  },
  {
    question: 'Can I request products not currently listed?',
    answer: 'Yes, at LYS we also track the brands we don\'t have in our portfolio for you. If you\'re interested in having a particular brand on your shelves and need a provider, contact us.',
    category: 'products'
  },
  {
    question: 'What about product expiry dates?',
    answer: 'All products are shipped with at least 18 months remaining shelf life (unless otherwise stated). Manufacturing dates and expiry dates are clearly marked on products. We never ship short-dated stock without explicit agreement.',
    category: 'products'
  }
]

const categories = [
  { id: 'all', label: 'All Questions' },
  { id: 'general', label: 'General' },
  { id: 'account', label: 'Account & Registration' },
  { id: 'ordering', label: 'Ordering' },
  { id: 'shipping', label: 'Shipping & Delivery' },
  { id: 'products', label: 'Products & Certifications' }
]

export const FAQ: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory)

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <Layout>
      <Section className="bg-gradient-to-br from-soft-pink to-white py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal tracking-wide mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-text-secondary">
              Everything you need to know about sourcing K-beauty through Loving Your Skin
            </p>
          </div>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-rose-gold text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <Card key={index} variant="default" className="overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-medium text-deep-charcoal pr-4">
                        {faq.question}
                      </h3>
                      <svg
                        className={`w-5 h-5 text-rose-gold flex-shrink-0 transition-transform ${
                          expandedItems.has(index) ? 'rotate-180' : ''
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {expandedItems.has(index) && (
                      <div className="px-6 pb-4">
                        <p className="text-text-secondary leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Still have questions? */}
            <div className="mt-16 text-center">
              <Card variant="default" className="bg-gradient-to-br from-rose-gold/10 to-transparent">
                <CardContent className="py-8">
                  <h2 className="text-2xl font-medium text-deep-charcoal mb-4">
                    Still have questions?
                  </h2>
                  <p className="text-text-secondary mb-6">
                    Our team is here to help you succeed with K-beauty wholesale
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center text-rose-gold font-medium hover:underline"
                  >
                    Contact our support team
                    <svg className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
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