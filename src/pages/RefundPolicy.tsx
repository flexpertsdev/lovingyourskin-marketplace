import React from 'react'
import { Layout } from '../components/layout'
import { Section, Container } from '../components/layout'

export const RefundPolicy: React.FC = () => {
  return (
    <Layout>
      <Section className="bg-gradient-to-br from-soft-pink to-white py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal tracking-wide mb-6">
              Refund Policy
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
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Overview</h2>
                <p>
                  This refund policy applies to all B2B wholesale transactions on the Loving Your Skin platform. 
                  As a wholesale marketplace dealing with cosmetic products, our policy reflects industry standards 
                  while ensuring fairness for both retailers and brands.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Inspection Period</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="font-medium mb-2">14-Day Inspection Window</p>
                  <p>
                    You have 14 days from delivery to inspect your order and report any issues. After this period, 
                    goods are considered accepted and no claims will be entertained except for hidden defects.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Eligible for Refund/Return</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">Defective Products</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manufacturing defects not caused by shipping</li>
                  <li>Products that arrive damaged - must be reported within 48 hours</li>
                  <li>Products with compromised packaging affecting product integrity</li>
                  <li>Expired products - less than 18 months shelf life remaining</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">Incorrect Orders</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Wrong products shipped</li>
                  <li>Incorrect quantities - overages or shortages</li>
                  <li>Products not matching the specifications on the order</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">Documentation Issues</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Missing required certifications - CPNP, etc.</li>
                  <li>Products without proper labeling for your market</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Not Eligible for Refund</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Change of mind or buyer's remorse</li>
                  <li>Slow-moving inventory or poor sales performance</li>
                  <li>Products ordered in error - wrong selection by buyer</li>
                  <li>Minor cosmetic damage to outer packaging not affecting product</li>
                  <li>Products that have been opened, used, or tampered with</li>
                  <li>Custom or specially ordered products</li>
                  <li>Seasonal or limited edition items</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Return Process</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">Step 1: Report the Issue</h3>
                <p>
                  Contact our support team within the inspection period with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Order number and invoice details</li>
                  <li>Clear photos/videos of the issue</li>
                  <li>Detailed description of the problem</li>
                  <li>Quantity of affected products</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">Step 2: Return Authorization</h3>
                <p>
                  If approved, we'll issue a Return Merchandise Authorization (RMA) number. No returns accepted 
                  without an RMA. The RMA includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Return shipping instructions</li>
                  <li>Required documentation</li>
                  <li>Timeline for return</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">Step 3: Ship the Products</h3>
                <p>
                  Return products in original packaging with all components. Include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Copy of RMA</li>
                  <li>Original invoice</li>
                  <li>Completed return form</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Refund Timeline</h2>
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <p className="font-medium">Inspection: 5-7 business days</p>
                    <p className="text-sm">After we receive returned products</p>
                  </div>
                  <div>
                    <p className="font-medium">Processing: 3-5 business days</p>
                    <p className="text-sm">After inspection approval</p>
                  </div>
                  <div>
                    <p className="font-medium">Bank Transfer: 5-10 business days</p>
                    <p className="text-sm">Depending on your bank</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Shipping Costs</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">Our Responsibility</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Defective or damaged products</li>
                  <li>Incorrect items shipped</li>
                  <li>Missing documentation</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">Your Responsibility</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ordering errors on your part</li>
                  <li>Returns not covered under this policy</li>
                  <li>Failure to accept delivery</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Partial Refunds</h2>
                <p>
                  In some cases, we may offer partial refunds for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Minor packaging damage not affecting product quality</li>
                  <li>Products nearing but not past best-before dates</li>
                  <li>Agreed-upon discounts for keeping imperfect inventory</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Cancellations</h2>
                <p>
                  Orders may be cancelled within 24 hours of placement without penalty. After 24 hours:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Orders in processing: 15% restocking fee</li>
                  <li>Orders shipped: Not cancellable, follow return process</li>
                  <li>Custom orders: Non-cancellable once confirmed</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Disputes</h2>
                <p>
                  If you disagree with our refund decision:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Request escalation to management</li>
                  <li>Provide additional documentation</li>
                  <li>If unresolved, follow dispute resolution in Terms of Service</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Special Circumstances</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">Recalled Products</h3>
                <p>
                  Full refund provided immediately for any officially recalled products, regardless of time since purchase.
                </p>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">Force Majeure</h3>
                <p>
                  Delays or issues due to circumstances beyond our control - natural disasters, pandemics, etc. - 
                  are handled on a case-by-case basis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Contact for Refunds</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p><strong>Email:</strong> julie@lovingyourskin.net</p>
                  <p><strong>Phone:</strong> +39 377 025 1222</p>
                  <p><strong>Response Time:</strong> Within 24 business hours</p>
                  <p className="mt-4">
                    Please include your order number in all correspondence.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">Policy Updates</h2>
                <p>
                  This policy may be updated periodically. Significant changes will be communicated to all 
                  registered retailers. The policy in effect at the time of your order applies to that transaction.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}