import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import { useCartStore } from '../../stores/cart.store'
import { useConsumerCartStore } from '../../stores/consumer-cart.store'
import { Button } from '../ui'
import { cn } from '../../lib/utils/cn'
// Icon components
const LogOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

interface NavItem {
  label: string
  href: string
  requiresAuth?: boolean
  roles?: Array<'admin' | 'retailer' | 'brand' | 'consumer'>
}

interface HeaderProps {
  mode?: 'b2b' | 'consumer'
}

export const Header: React.FC<HeaderProps> = ({ mode = 'b2b' }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const { getTotalItems: getB2BCartItems } = useCartStore()
  const { getTotalItems: getConsumerCartItems } = useConsumerCartStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Cart icon component
  const CartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )
  
  // Get cart items count
  const cartItemsCount = mode === 'consumer' ? getConsumerCartItems() : getB2BCartItems()
  
  // Simplified navigation logic based on mode
  let navItems: NavItem[] = []
  
  if (mode === 'consumer') {
    // Consumer mode navigation
    navItems = [
      { label: 'Shop', href: '/shop' },
      { label: 'Brands', href: '/shop/brands' },
      { label: 'Pre-orders', href: '/shop/preorders' },
      { label: 'Cart', href: '/shop/cart' }
    ]
    
    // Add My Orders for authenticated users
    if (isAuthenticated) {
      navItems.push({ label: 'My Orders', href: '/shop/orders', requiresAuth: true })
    }
  } else {
    // B2B mode navigation
    if (isAuthenticated) {
      // Role-based B2B navigation
      switch (user?.role) {
        case 'retailer':
          navItems = [
            { label: 'Brands', href: '/brands', requiresAuth: true },
            { label: 'Cart', href: '/cart', requiresAuth: true },
            { label: 'Dashboard', href: '/dashboard', requiresAuth: true },
            { label: 'Orders', href: '/orders', requiresAuth: true },
            { label: 'Messages', href: '/messages', requiresAuth: true }
          ]
          break
        case 'brand':
          navItems = [
            { label: 'Dashboard', href: '/dashboard', requiresAuth: true },
            { label: 'Messages', href: '/messages', requiresAuth: true }
          ]
          break
        case 'admin':
          // Admin gets minimal nav, most navigation in admin panel
          navItems = []
          break
        default:
          // Consumer shouldn't be here due to B2BRoute protection
          navItems = []
      }
    } else {
      // Public B2B navigation
      navItems = [
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'For Brands', href: '/for-brands' },
        { label: 'For Retailers', href: '/for-retailers' }
      ]
    }
  }
  
  // Debug logging
  useEffect(() => {
    console.log('[Header] Auth state:', { isAuthenticated, user: user?.email, role: user?.role })
  }, [isAuthenticated, user])
  
  const isActive = (href: string) => location.pathname === href
  
  const handleLogout = async () => {
    console.log('[Header] Logging out...')
    await logout()
    navigate('/')
    setShowUserMenu(false)
    setIsMobileMenuOpen(false)
  }
    
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border-gray">
      <nav className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link 
          to={mode === 'consumer' ? '/shop' : '/'} 
          className="text-2xl font-light tracking-widest text-deep-charcoal hover:text-rose-gold transition-colors"
        >
          LOVING YOUR SKIN
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {/* Nav Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
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
                <span>{item.label}</span>
                {/* B2B Cart Badge */}
                {item.href === '/cart' && mode === 'b2b' && getB2BCartItems() > 0 && (
                  <>
                    <span className="mx-1">·</span>
                    <span className="text-rose-gold">({getB2BCartItems()})</span>
                  </>
                )}
                {/* B2C Cart Badge */}
                {item.href === '/shop/cart' && mode === 'consumer' && getConsumerCartItems() > 0 && (
                  <>
                    <span className="mx-1">·</span>
                    <span className="text-rose-gold">({getConsumerCartItems()})</span>
                  </>
                )}
              </Link>
            ))}
            
            {/* Admin Link */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={cn(
                  'px-4 py-2 text-sm rounded-full transition-all duration-200 flex items-center gap-2',
                  location.pathname.startsWith('/admin')
                    ? 'bg-rose-gold text-white'
                    : 'text-rose-gold hover:bg-soft-pink-hover'
                )}
              >
                <ShieldIcon />
                Admin
              </Link>
            )}
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Icon for non-logged in consumer users */}
            {!isAuthenticated && mode === 'consumer' && (
              <Link
                to="/shop/cart"
                className="relative p-2"
              >
                <CartIcon />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}
            
            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border-gray rounded-full hover:border-rose-gold transition-colors"
                >
                  <UserIcon />
                  <span className="max-w-[150px] truncate">{user?.email}</span>
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border-gray overflow-hidden">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-soft-pink-hover transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon />
                        My Profile
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-soft-pink-hover transition-colors border-t border-border-gray"
                    >
                      <div className="flex items-center gap-2">
                        <LogOutIcon />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="secondary" size="small">
                    Login
                  </Button>
                </Link>
                <Link to={mode === 'consumer' ? '/shop/register' : '/register'}>
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
                    <div className="text-sm text-rose-gold capitalize">{user?.role}</div>
                  </div>
                )}
                
                {/* Navigation Links */}
                <div className="space-y-4">
                  {/* Cart Link for non-authenticated consumer users */}
                  {!isAuthenticated && mode === 'consumer' && (
                    <Link
                      to="/shop/cart"
                      className="block px-4 py-3 rounded-lg text-lg transition-colors text-text-primary hover:bg-soft-pink-hover"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Cart
                      {cartItemsCount > 0 && (
                        <span className="ml-2 text-rose-gold">({cartItemsCount})</span>
                      )}
                    </Link>
                  )}
                  
                  {navItems.map((item) => (
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
                      {item.href === '/cart' && getB2BCartItems() > 0 && (
                        <span className="ml-2 text-rose-gold">({getB2BCartItems()})</span>
                      )}
                      {item.href === '/shop/cart' && getConsumerCartItems() > 0 && (
                        <span className="ml-2 text-rose-gold">({getConsumerCartItems()})</span>
                      )}
                    </Link>
                  ))}
                  
                  {/* Admin Link - Mobile */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={cn(
                        'block px-4 py-3 rounded-lg text-lg transition-colors flex items-center gap-2',
                        location.pathname.startsWith('/admin')
                          ? 'bg-rose-gold text-white'
                          : 'text-rose-gold hover:bg-soft-pink-hover'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShieldIcon />
                      Admin Panel
                    </Link>
                  )}
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
                    onClick={handleLogout}
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
                  <Link to={mode === 'consumer' ? '/shop/register' : '/register'} onClick={() => setIsMobileMenuOpen(false)}>
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