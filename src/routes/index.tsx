import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

// Pages
import { Landing } from '../pages/Landing'
import { ComponentDemo } from '../pages/ComponentDemo'
import { Login, Register } from '../pages/auth'
import { Brands } from '../pages/Brands'
import { BrandDetail } from '../pages/BrandDetail'
import { ProductDetail } from '../pages/ProductDetail'
import { Test } from '../pages/Test'
import { TestAuth } from '../pages/TestAuth'
import { Cart } from '../pages/Cart'
import { Checkout } from '../pages/Checkout'
import { Orders } from '../pages/Orders'
import { OrderDetail } from '../pages/OrderDetail'
import { Dashboard } from '../pages/Dashboard'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { HowItWorks } from '../pages/HowItWorks'
import { ForBrands } from '../pages/ForBrands'
import { ForRetailers } from '../pages/ForRetailers'
import { Messages } from '../pages/Messages'
import { Profile } from '../pages/Profile'
import { About } from '../pages/About'
import { FAQ } from '../pages/FAQ'
import { Terms } from '../pages/Terms'
import { Privacy } from '../pages/Privacy'
import { RefundPolicy } from '../pages/RefundPolicy'
import { Contact } from '../pages/Contact'
import { Careers } from '../pages/Careers'
import { CookiePolicy } from '../pages/CookiePolicy'
import AdminSetup from '../pages/admin/AdminSetup'
import AdminLogin from '../pages/admin/AdminLogin'
import { Preorder } from '../pages/Preorder'
import { PreorderDetail } from '../pages/PreorderDetail'
import UserManagement from '../pages/admin/UserManagement'
import { TestAuthFlow } from '../pages/TestAuthFlow'
import { AdminMessages } from '../pages/admin/AdminMessages'
import { AdminAffiliates } from '../pages/admin/AdminAffiliates'
import { TestInviteCode } from '../pages/TestInviteCode'
import ProductManagement from '../pages/admin/ProductManagement'
import DebugAuth from '../pages/DebugAuth'

// Consumer Pages
import { Shop } from '../pages/Shop'
import { ConsumerShop } from '../pages/ConsumerShop'
import { ConsumerCart } from '../pages/ConsumerCart'
import { ConsumerLogin } from '../pages/ConsumerLogin'
import { ConsumerProductDetail } from '../pages/ConsumerProductDetail'
import { ConsumerBrands } from '../pages/ConsumerBrands'
import { ConsumerPreorders } from '../pages/ConsumerPreorders'
import { ConsumerBrandDetail } from '../pages/ConsumerBrandDetail'

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'admin' | 'retailer' | 'brand' | 'consumer'>
  requireAuth?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  requireAuth = true 
}) => {
  const { user } = useAuthStore()
  const isAuthenticated = !!user
  
  console.log('[ProtectedRoute] Checking access:', {
    isAuthenticated,
    user: user?.email,
    userRole: user?.role,
    allowedRoles,
    requireAuth
  })

  if (requireAuth && !isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('[ProtectedRoute] User role not allowed, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  console.log('[ProtectedRoute] Access granted')
  return <>{children}</>
}

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[AdminRoute] Checking admin access')
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  )
}

// Retailer Route Component
const RetailerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[RetailerRoute] Checking retailer access')
  return (
    <ProtectedRoute allowedRoles={['retailer', 'admin']}>
      {children}
    </ProtectedRoute>
  )
}

// Consumer Route Component
const ConsumerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[ConsumerRoute] Checking consumer access')
  return (
    <ProtectedRoute allowedRoles={['consumer']}>
      {children}
    </ProtectedRoute>
  )
}

export const AppRoutes: React.FC = () => {
  const { user } = useAuthStore()
  console.log('AppRoutes rendering with user:', user?.email, 'role:', user?.role)
  
  return (
    <Routes>
      {/* Debug Route */}
      <Route path="/debug" element={<DebugAuth />} />
      <Route path="/test-auth-flow" element={<TestAuthFlow />} />
      <Route path="/test-invite-code" element={<TestInviteCode />} />
      <Route path="/test-firebase" element={
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
          <p>Check console for Firebase data loading...</p>
        </div>
      } />
      
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/test" element={<Test />} />
      <Route path="/test-auth" element={<TestAuth />} />
      <Route path="/debug-auth" element={<DebugAuth />} />
      <Route path="/components" element={<ComponentDemo />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Marketing Pages - Public */}
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/for-brands" element={<ForBrands />} />
      <Route path="/for-retailers" element={<ForRetailers />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Legal and Info Pages - Public */}
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/refunds" element={<RefundPolicy />} />
      <Route path="/careers" element={<Careers />} />
      
      {/* Protected Routes - Require Authentication */}
      <Route path="/brands" element={
        <ProtectedRoute>
          <Brands />
        </ProtectedRoute>
      } />
      <Route path="/brands/:brandId" element={
        <ProtectedRoute>
          <BrandDetail />
        </ProtectedRoute>
      } />
      <Route path="/products/:productId" element={
        <ProtectedRoute>
          <ProductDetail />
        </ProtectedRoute>
      } />
      
      {/* Dashboard - Available to all authenticated users */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Profile & Messages - Available to all authenticated users */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      
      {/* Retailer-specific Routes */}
      <Route path="/cart" element={
        <RetailerRoute>
          <Cart />
        </RetailerRoute>
      } />
      <Route path="/checkout" element={
        <RetailerRoute>
          <Checkout />
        </RetailerRoute>
      } />
      <Route path="/orders" element={
        <RetailerRoute>
          <Orders />
        </RetailerRoute>
      } />
      <Route path="/orders/:orderId" element={
        <RetailerRoute>
          <OrderDetail />
        </RetailerRoute>
      } />
      <Route path="/preorder" element={
        <RetailerRoute>
          <Preorder />
        </RetailerRoute>
      } />
      <Route path="/preorder/:id" element={
        <RetailerRoute>
          <PreorderDetail />
        </RetailerRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <UserManagement />
        </AdminRoute>
      } />
      <Route path="/admin/messages" element={
        <AdminRoute>
          <AdminMessages />
        </AdminRoute>
      } />
      <Route path="/admin/affiliates" element={
        <AdminRoute>
          <AdminAffiliates />
        </AdminRoute>
      } />
      <Route path="/admin/products" element={
        <AdminRoute>
          <ProductManagement />
        </AdminRoute>
      } />
      
      {/* Admin Auth Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Admin Setup - Special route, should be removed after initial setup */}
      <Route path="/admin/setup" element={<AdminSetup />} />
      
      {/* Consumer/B2C Routes */}
      <Route path="/shop" element={<Shop />} />
      <Route path="/consumer/shop" element={<ConsumerShop />} />
      <Route path="/consumer/brands" element={<ConsumerBrands />} />
      <Route path="/consumer/brands/:brandId" element={<ConsumerBrandDetail />} />
      <Route path="/consumer/preorders" element={<ConsumerPreorders />} />
      <Route path="/consumer/products/:productId" element={<ConsumerProductDetail />} />
      <Route path="/consumer/cart" element={<ConsumerCart />} />
      <Route path="/consumer/login" element={<ConsumerLogin />} />
      <Route path="/consumer/orders" element={
        <ConsumerRoute>
          <Orders />
        </ConsumerRoute>
      } />
      <Route path="/consumer/wishlist" element={
        <ConsumerRoute>
          <div className="min-h-screen flex items-center justify-center">
            <p>Wishlist page coming soon</p>
          </div>
        </ConsumerRoute>
      } />
      <Route path="/shop/login" element={<ConsumerLogin />} />
      <Route path="/shop/cart" element={<ConsumerCart />} />
      <Route path="/shop/products/:productId" element={<ConsumerProductDetail />} />
      
      {/* Consumer Protected Routes */}
      <Route path="/shop/account" element={
        <ConsumerRoute>
          <Profile />
        </ConsumerRoute>
      } />
      <Route path="/shop/orders" element={
        <ConsumerRoute>
          <Orders />
        </ConsumerRoute>
      } />
      <Route path="/shop/wishlist" element={
        <ConsumerRoute>
          <div className="min-h-screen flex items-center justify-center">
            <p>Wishlist page coming soon</p>
          </div>
        </ConsumerRoute>
      } />
      
      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-light mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
            <a href="/" className="text-rose-gold hover:underline">Go to Home</a>
          </div>
        </div>
      } />
    </Routes>
  )
}

/* 
// OLD ROUTES BACKUP - Remove after testing
export const AppRoutesOld: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/test" element={<Test />} />
      <Route path="/test-auth" element={<TestAuth />} />
      <Route path="/debug-auth" element={<DebugAuth />} />
      <Route path="/components" element={<ComponentDemo />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/brands" element={<Brands />} />
      <Route path="/brands/:brandId" element={<BrandDetail />} />
      <Route path="/products/:productId" element={<ProductDetail />} />
      
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/for-brands" element={<ForBrands />} />
      <Route path="/for-retailers" element={<ForRetailers />} />
      <Route path="/about" element={<About />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:orderId" element={<OrderDetail />} />
      <Route path="/messages" element={<Messages />} />
      
      <Route path="/preorder" element={<Preorder />} />
      <Route path="/preorder/:id" element={<PreorderDetail />} />
      
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/setup" element={<AdminSetup />} />
      
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/refunds" element={<RefundPolicy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/careers" element={<Careers />} />
      
      <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
    </Routes>
  )
}
*/