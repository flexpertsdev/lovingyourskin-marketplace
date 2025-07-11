import React from 'react'
import { Layout } from '../components/layout'
import { Section, Container } from '../components/layout'

export const Privacy: React.FC = () => {
  return (
    <Layout>
      <Section className="bg-gradient-to-br from-soft-pink to-white py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal tracking-wide mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-text-secondary">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="space-y-8 text-text-secondary">
              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">1. Introduction</h2>
                <p>
                  Loving Your Skin Ltd ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you use our B2B wholesale 
                  marketplace platform.
                </p>
                <p>
                  We comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">2. Data Controller Information</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p><strong>Company:</strong> Loving Your Skin Ltd</p>
                  <p><strong>Registered Address:</strong> London, United Kingdom</p>
                  <p><strong>Contact Email:</strong> privacy@lovingyourskin.com</p>
                  <p><strong>Data Protection Officer:</strong> dpo@lovingyourskin.com</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">3. Information We Collect</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">3.1 Business Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Company name and registration details</li>
                  <li>Business address and contact information</li>
                  <li>VAT/Tax identification numbers</li>
                  <li>Banking and payment information</li>
                  <li>Trade references</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">3.2 Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and job title</li>
                  <li>Email address and phone number</li>
                  <li>Account credentials</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">3.3 Transaction Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Order history and details</li>
                  <li>Payment records</li>
                  <li>Shipping information</li>
                  <li>Customer service interactions</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">3.4 Technical Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP address and browser information</li>
                  <li>Login data and access times</li>
                  <li>Platform usage analytics</li>
                  <li>Cookie data (see Cookie Policy)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">4. Legal Basis for Processing</h2>
                <p>We process your data based on:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contract:</strong> To fulfill our wholesale agreements and process orders</li>
                  <li><strong>Legal Obligation:</strong> To comply with tax, customs, and regulatory requirements</li>
                  <li><strong>Legitimate Interests:</strong> To operate our business, prevent fraud, and improve services</li>
                  <li><strong>Consent:</strong> For marketing communications (where applicable)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">5. How We Use Your Information</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">5.1 Order Processing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Verify business credentials and creditworthiness</li>
                  <li>Process and fulfill wholesale orders</li>
                  <li>Communicate order status and shipping updates</li>
                  <li>Handle payment processing and invoicing</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">5.2 Business Operations</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain accurate business records</li>
                  <li>Provide customer support</li>
                  <li>Manage credit terms and collections</li>
                  <li>Comply with legal and tax obligations</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">5.3 Platform Improvement</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Analyze usage patterns to improve services</li>
                  <li>Develop new features and functionality</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">6. Data Sharing and Disclosure</h2>
                <p>We may share your information with:</p>
                
                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">6.1 Business Partners</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>K-beauty brands for order fulfillment</li>
                  <li>Logistics providers for shipping</li>
                  <li>Payment processors for transactions</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">6.2 Service Providers</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cloud hosting services</li>
                  <li>Analytics providers</li>
                  <li>Customer support tools</li>
                  <li>Professional advisors (lawyers, accountants)</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">6.3 Legal Requirements</h3>
                <p>
                  We may disclose information when required by law, court order, or to protect our legal rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">7. International Data Transfers</h2>
                <p>
                  Your data may be transferred outside the UK/EEA for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Order fulfillment with Korean beauty brands</li>
                  <li>Use of cloud services based in other countries</li>
                </ul>
                <p className="mt-4">
                  We ensure appropriate safeguards through:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Standard Contractual Clauses</li>
                  <li>Adequacy decisions where applicable</li>
                  <li>Additional security measures</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">8. Data Retention</h2>
                <p>We retain your data for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Business records:</strong> 7 years for tax/legal compliance</li>
                  <li><strong>Transaction data:</strong> 6 years after last transaction</li>
                  <li><strong>Marketing data:</strong> Until consent withdrawn</li>
                  <li><strong>Technical logs:</strong> 12 months</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">9. Your Rights</h2>
                <p>Under UK GDPR, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate data</li>
                  <li><strong>Erasure:</strong> Request deletion (subject to legal obligations)</li>
                  <li><strong>Restriction:</strong> Limit processing of your data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Object:</strong> Object to certain processing activities</li>
                  <li><strong>Withdraw consent:</strong> For consent-based processing</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact: privacy@lovingyourskin.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">10. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">11. Cookies</h2>
                <p>
                  We use cookies to improve your experience. Types include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential:</strong> Required for platform functionality</li>
                  <li><strong>Analytics:</strong> To understand usage patterns</li>
                  <li><strong>Preferences:</strong> To remember your settings</li>
                </ul>
                <p className="mt-4">
                  For more information, see our Cookie Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">12. Marketing Communications</h2>
                <p>
                  With your consent, we may send:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>New product announcements</li>
                  <li>Industry news and trends</li>
                  <li>Promotional offers</li>
                </ul>
                <p className="mt-4">
                  You can unsubscribe at any time via the link in emails or by contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">13. Changes to This Policy</h2>
                <p>
                  We may update this policy periodically. We will notify you of significant changes via email 
                  or platform notification.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">14. Complaints</h2>
                <p>
                  If you have concerns about our data practices, please contact us first. You also have the right 
                  to lodge a complaint with the Information Commissioner's Office (ICO):
                </p>
                <div className="mt-4">
                  <p>Website: ico.org.uk</p>
                  <p>Phone: 0303 123 1113</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">15. Contact Us</h2>
                <p>
                  For privacy-related questions or to exercise your rights:
                </p>
                <div className="mt-4 bg-gray-50 p-6 rounded-lg">
                  <p><strong>Email:</strong> privacy@lovingyourskin.com</p>
                  <p><strong>DPO:</strong> dpo@lovingyourskin.com</p>
                  <p><strong>Post:</strong> Data Protection Officer<br />
                  Loving Your Skin Ltd<br />
                  London, United Kingdom</p>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}