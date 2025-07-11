import React from 'react'
import { Layout } from '../components/layout'
import { Section, Container } from '../components/layout'

export const Terms: React.FC = () => {
  return (
    <Layout>
      <Section className="bg-gradient-to-br from-soft-pink to-white py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal tracking-wide mb-6">
              Terms of Service
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
                  These Terms of Service ("Terms") govern your use of the Loving Your Skin B2B wholesale marketplace 
                  platform ("Platform") operated by Loving Your Skin Ltd ("LYS", "we", "us", or "our"), a company 
                  registered in England and Wales.
                </p>
                <p>
                  By accessing or using our Platform, you agree to be bound by these Terms. If you disagree with any 
                  part of these Terms, you may not access the Platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">2. Eligibility and Registration</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">2.1 Business Accounts Only</h3>
                <p>
                  The Platform is exclusively for business-to-business transactions. By registering, you represent that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You are registering on behalf of a legitimate business entity</li>
                  <li>You have the authority to bind that entity to these Terms</li>
                  <li>You are not a consumer purchasing for personal use</li>
                  <li>Your business holds all necessary licenses to sell cosmetic products in your jurisdiction</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">2.2 Invite-Only System</h3>
                <p>
                  Registration requires a valid invitation code from an authorized LYS representative. We reserve the 
                  right to verify all business information and may refuse registration at our discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">3. Wholesale Terms</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">3.1 Minimum Order Quantities (MOQs)</h3>
                <p>
                  All orders are subject to minimum order quantities set by individual brands. MOQs must be met 
                  on a per-brand basis and cannot be combined across different brands.
                </p>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">3.2 Pricing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All prices displayed are wholesale prices exclusive of VAT/taxes</li>
                  <li>Prices are subject to change with 30 days' notice</li>
                  <li>Currency options include USD, EUR, and GBP depending on the brand</li>
                  <li>Volume discounts may apply based on order size</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">3.3 Payment Terms</h3>
                <p>
                  Payment terms vary based on account status:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>New accounts: Prepayment required</li>
                  <li>Established accounts: NET 30 or NET 60 terms available</li>
                  <li>Accepted methods: Bank transfer (SWIFT/SEPA)</li>
                  <li>Late payments subject to 1.5% monthly interest</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">4. Orders and Delivery</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">4.1 Order Acceptance</h3>
                <p>
                  All orders are subject to acceptance by LYS and the relevant brand. An order confirmation does not 
                  constitute acceptance. Orders are only accepted upon dispatch of goods.
                </p>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">4.2 Delivery and Risk</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Delivery terms: EXW (Ex Works) unless otherwise agreed</li>
                  <li>Risk passes to buyer upon collection by carrier</li>
                  <li>Delivery times are estimates only and not guaranteed</li>
                  <li>Buyer responsible for all customs duties and import taxes</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">4.3 Inspection and Acceptance</h3>
                <p>
                  Buyers must inspect goods within 14 days of delivery and notify us of any discrepancies. 
                  Goods are deemed accepted after this period.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">5. Product Authenticity and Compliance</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">5.1 Authenticity Guarantee</h3>
                <p>
                  All products supplied through the Platform are genuine and sourced directly from brands or 
                  authorized distributors. We guarantee product authenticity.
                </p>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">5.2 Regulatory Compliance</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Products come with necessary certifications (CPNP, etc.)</li>
                  <li>Buyer responsible for compliance with local regulations</li>
                  <li>We provide documentation but do not guarantee suitability for all markets</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">6. Intellectual Property</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">6.1 Trademark Usage</h3>
                <p>
                  Purchase of products grants limited right to use brand trademarks solely for the resale of 
                  authentic products. Any other use requires written permission from the brand owner.
                </p>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">6.2 Territory Restrictions</h3>
                <p>
                  Some products may have territorial restrictions. Buyers must comply with any territorial 
                  limitations specified by brands.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">7. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Our liability is limited to the value of the relevant order</li>
                  <li>We exclude liability for indirect, consequential, or economic losses</li>
                  <li>We do not guarantee continuous Platform availability</li>
                  <li>We are not liable for buyer's compliance with local laws</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">8. Data Protection</h2>
                <p>
                  Use of the Platform is subject to our Privacy Policy. We process data in accordance with 
                  UK GDPR and applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">9. Termination</h2>
                <p>
                  We may suspend or terminate accounts for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Breach of these Terms</li>
                  <li>Non-payment or repeated late payments</li>
                  <li>Fraudulent or suspicious activity</li>
                  <li>Failure to meet minimum activity requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">10. Dispute Resolution</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">10.1 Governing Law</h3>
                <p>
                  These Terms are governed by the laws of England and Wales.
                </p>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">10.2 Dispute Process</h3>
                <p>
                  Parties agree to attempt good faith negotiation before legal proceedings. If unsuccessful, 
                  disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">11. Amendments</h2>
                <p>
                  We may update these Terms at any time with 30 days' notice. Continued use of the Platform 
                  after changes constitutes acceptance of updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">12. Contact Information</h2>
                <p>
                  For questions about these Terms, please contact:
                </p>
                <div className="mt-4">
                  <p>Loving Your Skin Ltd</p>
                  <p>Legal Department</p>
                  <p>Email: legal@lovingyourskin.com</p>
                  <p>Address: London, United Kingdom</p>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}