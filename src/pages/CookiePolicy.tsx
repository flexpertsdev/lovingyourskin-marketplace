import React from 'react'
import { Layout } from '../components/layout'
import { Section, Container } from '../components/layout'
import { Card, CardContent } from '../components/ui'

export const CookiePolicy: React.FC = () => {
  return (
    <Layout>
      <Section className="bg-gradient-to-br from-soft-pink to-white py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal tracking-wide mb-6">
              Cookie Policy
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
                  This Cookie Policy explains how Loving Your Skin Ltd ("we", "us", "our") uses cookies and similar 
                  technologies on our B2B wholesale marketplace platform. This policy should be read alongside our 
                  Privacy Policy.
                </p>
                <p>
                  By using our platform, you consent to our use of cookies in accordance with this policy. If you do 
                  not agree to our use of cookies, you should adjust your browser settings or refrain from using our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">2. What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are placed on your device when you visit a website. They help the 
                  website remember information about your visit, such as your preferred language and other settings, 
                  making your next visit easier and more productive.
                </p>
                <p>
                  We use both session cookies (which expire when you close your browser) and persistent cookies 
                  (which remain on your device until deleted or they expire).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">3. Why We Use Cookies</h2>
                <p>We use cookies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your login details and authentication status</li>
                  <li>Keep your shopping cart contents between sessions</li>
                  <li>Remember your language and currency preferences</li>
                  <li>Analyse how you use our platform to improve user experience</li>
                  <li>Prevent fraud and enhance security</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">4. Types of Cookies We Use</h2>
                
                <div className="space-y-6">
                  <Card variant="default">
                    <CardContent>
                      <h3 className="text-xl font-medium text-deep-charcoal mb-2">Essential Cookies</h3>
                      <p className="mb-4">
                        These cookies are necessary for the platform to function properly. They cannot be disabled.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        <p><strong>Examples:</strong></p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Session ID cookies for login authentication</li>
                          <li>Shopping cart cookies to remember selected products</li>
                          <li>Security cookies to prevent fraudulent activity</li>
                          <li>Load balancing cookies for platform stability</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="default">
                    <CardContent>
                      <h3 className="text-xl font-medium text-deep-charcoal mb-2">Analytics Cookies</h3>
                      <p className="mb-4">
                        These help us understand how visitors interact with our platform, allowing us to improve functionality.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        <p><strong>Examples:</strong></p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Google Analytics (_ga, _gid) - Usage statistics</li>
                          <li>Hotjar - User behavior analysis</li>
                          <li>Platform performance monitoring</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="default">
                    <CardContent>
                      <h3 className="text-xl font-medium text-deep-charcoal mb-2">Functional Cookies</h3>
                      <p className="mb-4">
                        These cookies remember your preferences and enable enhanced functionality.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        <p><strong>Examples:</strong></p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Language preference cookies</li>
                          <li>Currency selection cookies</li>
                          <li>Recently viewed products</li>
                          <li>User interface preferences</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="default">
                    <CardContent>
                      <h3 className="text-xl font-medium text-deep-charcoal mb-2">Marketing Cookies</h3>
                      <p className="mb-4">
                        We may use these to show relevant content and measure marketing campaign effectiveness.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        <p><strong>Examples:</strong></p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>LinkedIn Insight Tag - B2B advertising</li>
                          <li>Facebook Pixel - Social media marketing</li>
                          <li>Google Ads - Search advertising</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">5. Third-Party Cookies</h2>
                <p>
                  Some cookies are placed by third-party services that appear on our platform. We do not control 
                  these cookies and recommend reviewing the relevant third-party privacy policies.
                </p>
                <p className="mt-4">Third parties that may set cookies include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Analytics:</strong> Website analytics and performance</li>
                  <li><strong>Stripe:</strong> Payment processing (essential for transactions)</li>
                  <li><strong>Zendesk:</strong> Customer support functionality</li>
                  <li><strong>CloudFlare:</strong> Security and performance optimization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">6. Cookie Duration</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie Type</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Session cookies</td>
                      <td className="py-2">Until browser is closed</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Authentication cookies</td>
                      <td className="py-2">30 days (with "Remember me")</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Analytics cookies</td>
                      <td className="py-2">Up to 2 years</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Preference cookies</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">7. Managing Cookies</h2>
                <h3 className="text-xl font-medium text-deep-charcoal mb-2">7.1 Cookie Preferences</h3>
                <p>
                  You can manage your cookie preferences at any time by clicking the "Cookie Settings" link in our 
                  footer. Essential cookies cannot be disabled as they are necessary for the platform to function.
                </p>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">7.2 Browser Settings</h3>
                <p>
                  Most browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>View what cookies are stored on your device</li>
                  <li>Delete some or all cookies</li>
                  <li>Block cookies from specific websites or all websites</li>
                  <li>Receive notifications when cookies are being set</li>
                </ul>

                <h3 className="text-xl font-medium text-deep-charcoal mb-2 mt-4">7.3 Useful Links</h3>
                <p>Learn more about managing cookies in your browser:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-rose-gold hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-rose-gold hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-rose-gold hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-rose-gold hover:underline">Microsoft Edge</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">8. Impact of Disabling Cookies</h2>
                <p>
                  Please note that disabling cookies may impact your experience on our platform:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may need to log in every time you visit</li>
                  <li>Shopping cart contents may not be saved between sessions</li>
                  <li>Language and currency preferences won't be remembered</li>
                  <li>Some features may not function properly</li>
                  <li>You may not be able to complete transactions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">9. Do Not Track</h2>
                <p>
                  Some browsers offer a "Do Not Track" (DNT) setting. We currently do not respond to DNT signals 
                  as there is no industry standard for handling them. However, you can manage your cookie preferences 
                  using the methods described above.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">10. Children's Privacy</h2>
                <p>
                  Our platform is designed for B2B use only and is not intended for children under 18. We do not 
                  knowingly collect information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">11. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices or legal 
                  requirements. We will notify you of significant changes by posting a notice on our platform or 
                  sending you an email.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">12. Contact Us</h2>
                <p>
                  If you have questions about our use of cookies or this policy, please contact us:
                </p>
                <div className="mt-4 bg-gray-50 p-6 rounded-lg">
                  <p><strong>Email:</strong> privacy@lovingyourskin.com</p>
                  <p><strong>Data Protection Officer:</strong> dpo@lovingyourskin.com</p>
                  <p><strong>Post:</strong> Cookie Policy Inquiries<br />
                  Loving Your Skin Ltd<br />
                  London, United Kingdom</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-deep-charcoal mb-4">13. More Information</h2>
                <p>
                  For more information about cookies and online privacy:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><a href="https://ico.org.uk/for-the-public/online/cookies/" target="_blank" rel="noopener noreferrer" className="text-rose-gold hover:underline">UK Information Commissioner's Office - Cookies</a></li>
                  <li><a href="https://www.aboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-rose-gold hover:underline">AboutCookies.org</a></li>
                  <li><a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-rose-gold hover:underline">AllAboutCookies.org</a></li>
                </ul>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}