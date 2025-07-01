import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import { useCartStore } from '../../stores/cart.store'
import { Button } from '../ui'
import { cn } from '../../lib/utils/cn'

interface NavItem {
  label: string
  href: string
  requiresAuth?: boolean
  roles?: string[]
}

const publicNavItems: NavItem[] = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'For Brands', href: '/for-brands' },
  { label: 'For Retailers', href: '/for-retailers' },
]

const authNavItems: NavItem[] = [
  { label: 'Brands', href: '/brands', requiresAuth: true },
  { label: 'Cart', href: '/cart', requiresAuth: true },
  { label: 'Dashboard', href: '/dashboard', requiresAuth: true },
  { label: 'Orders', href: '/orders', requiresAuth: true },
  { label: 'Messages', href: '/messages', requiresAuth: true },
]

export const Header: React.FC = () => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const [language, setLanguage] = useState('EN')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const isAuthenticated = !!user
  const isActive = (href: string) => location.pathname === href
  
  const allNavItems = isAuthenticated 
    ? authNavItems 
    : publicNavItems
    
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border-gray">
      <nav className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-2xl font-light tracking-widest text-deep-charcoal hover:text-rose-gold transition-colors"
        >
          LOVING YOUR SKIN
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {/* Nav Items */}
          <div className="flex items-center gap-2">
            {allNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'px-4 py-2 text-sm rounded-full transition-all duration-200 relative',
                  isActive(item.href)
                    ? 'bg-soft-pink-hover text-deep-charcoal'
                    : 'text-text-primary hover:bg-soft-pink-hover hover:text-deep-charcoal'
                )}
              >
                {item.label}
                {item.href === '/cart' && getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            ))}
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 text-xs border border-border-gray rounded-full bg-white cursor-pointer hover:border-rose-gold transition-colors"
            >
              <option value="EN">EN</option>
              <option value="KO">한국어</option>
              <option value="ZH">中文</option>
            </select>
            
            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <Button variant="ghost" size="small">
                    {user?.email}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="secondary" size="small">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="small">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-gray">
              <Link 
                to="/" 
                className="text-xl font-light tracking-widest text-deep-charcoal"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                LOVING YOUR SKIN
              </Link>
              <button 
                className="p-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-8">
                {/* User Info */}
                {isAuthenticated && (
                  <div className="mb-8 pb-8 border-b border-border-gray">
                    <div className="text-sm text-text-secondary mb-2">Logged in as</div>
                    <div className="font-medium">{user?.email}</div>
                  </div>
                )}
                
                {/* Navigation Links */}
                <div className="space-y-4">
                  {allNavItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'block px-4 py-3 rounded-lg text-lg transition-colors',
                        isActive(item.href)
                          ? 'bg-soft-pink text-deep-charcoal'
                          : 'text-text-primary hover:bg-soft-pink-hover'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                      {item.href === '/cart' && getTotalItems() > 0 && (
                        <span className="ml-2 text-rose-gold">({getTotalItems()})</span>
                      )}
                    </Link>
                  ))}
                </div>
                
                {/* Language Selector */}
                <div className="mt-8 pt-8 border-t border-border-gray">
                  <label className="block text-sm text-text-secondary mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-border-gray rounded-lg bg-white"
                  >
                    <option value="EN">English</option>
                    <option value="KO">한국어</option>
                    <option value="ZH">中文</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Mobile Footer Actions */}
            <div className="px-6 py-6 border-t border-border-gray">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="secondary" size="medium" className="w-full">
                      My Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="medium" 
                    className="w-full"
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="secondary" size="medium" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" size="medium" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}