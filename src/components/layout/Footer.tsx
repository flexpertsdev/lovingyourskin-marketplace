import React from 'react'
import { Link } from 'react-router-dom'

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
  ],
  services: [
    { label: 'For Brands', href: '/for-brands' },
    { label: 'For Retailers', href: '/for-retailers' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Refund Policy', href: '/refunds' },
  ],
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/lys_ltd/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/loving-your-skin/' },
    { label: 'Twitter', href: 'https://twitter.com' },
    { label: 'Facebook', href: 'https://facebook.com' },
  ],
}

export const Footer: React.FC = () => {
  return (
    <footer className="bg-deep-charcoal text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-light tracking-widest mb-4">
              LOVING YOUR SKIN
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              Simplifying Korean beauty wholesale for retailers worldwide. 
              Connect directly with authentic K-beauty brands.
            </p>
            <div className="flex gap-4">
              {footerLinks.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-rose-gold transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          
          {/* Links Columns */}
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-rose-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-rose-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-rose-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Loving Your Skin. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>🇰🇷 Seoul, South Korea</span>
              <span>🇺🇸 New York, USA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}