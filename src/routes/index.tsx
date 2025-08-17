import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

// Pages
import { Landing } from '../pages/Landing'
import { Login, Register, ConsumerRegister } from '../pages/auth'
import { Brands } from '../pages/Brands'
import { BrandDetail } from '../pages/BrandDetail'
import { ProductDetail } from '../pages/ProductDetail'
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
import { AdminMessages } from '../pages/admin/AdminMessages'
import AdminAffiliates from '../pages/admin/AdminAffiliates'
import ProductManagement from '../pages/admin/ProductManagement'
import AdminBrands from '../pages/admin/AdminBrands'
import AdminOrders from '../pages/admin/AdminOrders'
import MigrateImages from '../pages/admin/MigrateImages'
import AdminDiscounts from '../pages/admin/AdminDiscounts'
import { PreorderCampaignManager } from '../pages/admin/PreorderCampaignManager'
import { AdminPreorders } from '../pages/admin/AdminPreorders'

// Affiliate Pages
import { AffiliateDashboard } from '../pages/affiliate/AffiliateDashboard'

// Retailer Pages
import { RetailerDashboard } from '../pages/retailer/RetailerDashboard'
import { RetailerOrders } from '../pages/retailer/RetailerOrders'

// Brand Pages  
import { BrandDashboard } from '../pages/brand/BrandDashboard'
import { BrandOrders } from '../pages/brand/BrandOrders'

// Consumer Pages
import { ConsumerShop } from '../pages/ConsumerShop'
import { ConsumerCheckout } from '../pages/ConsumerCheckout'
// import { ConsumerPreorderCheckout } from '../pages/ConsumerPreorderCheckout' - Using unified checkout now
import { ConsumerPreorderCart } from '../pages/ConsumerPreorderCart'
import { ConsumerUnifiedCart } from '../pages/ConsumerUnifiedCart'
import { CheckoutSuccess } from '../pages/CheckoutSuccess'
import { ConsumerLogin } from '../pages/ConsumerLogin'
import { ConsumerProductDetail } from '../pages/ConsumerProductDetail'
import { ConsumerBrands } from '../pages/ConsumerBrands'
import { ConsumerPreorders } from '../pages/ConsumerPreorders'
import { ConsumerOrderHistory } from '../pages/ConsumerOrderHistory'
import { ConsumerBrandDetail } from '../pages/ConsumerBrandDetail'
import { Wishlist } from '../pages/Wishlist'

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'admin' | 'retailer' | 'brand' | 'consumer' | 'affiliate'>
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

// Consumer Route Component - Allow any authenticated user on consumer pages
const ConsumerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore()
  console.log('[ConsumerRoute] Checking authentication for consumer pages')
  
  if (!user) {
    console.log('[ConsumerRoute] Not authenticated, redirecting to consumer login')
    return <Navigate to="/shop/login" replace />
  }
  
  console.log('[ConsumerRoute] User authenticated, access granted')
  return <>{children}</>
}

// B2B Route Component - Block consumers from accessing B2B pages
const B2BRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore()
  console.log('[B2BRoute] Checking B2B access')
  
  if (!user) {
    console.log('[B2BRoute] Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  if (user.role === 'consumer') {
    console.log('[B2BRoute] Consumer trying to access B2B page, redirecting to shop')
    return <Navigate to="/shop" replace />
  }
  
  console.log('[B2BRoute] B2B access granted')
  return <>{children}</>
}

export const AppRoutes: React.FC = () => {
  const { user } = useAuthStore()
  console.log('AppRoutes rendering with user:', user?.email, 'role:', user?.role)
  
  return (
    <Routes>
   
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      
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
      
      {/* B2B Routes - Block consumers */}
      <Route path="/brands" element={
        <B2BRoute>
          <Brands />
        </B2BRoute>
      } />
      <Route path="/brands/:brandId" element={
        <B2BRoute>
          <BrandDetail />
        </B2BRoute>
      } />
      <Route path="/products/:productId" element={
        <B2BRoute>
          <ProductDetail />
        </B2BRoute>
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
      
      {/* B2B Commerce Routes */}
      <Route path="/cart" element={
        <B2BRoute>
          <Cart />
        </B2BRoute>
      } />
      <Route path="/checkout" element={
        <B2BRoute>
          <Checkout />
        </B2BRoute>
      } />
      <Route path="/orders" element={
        <B2BRoute>
          <Orders />
        </B2BRoute>
      } />
      <Route path="/orders/:orderId" element={
        <B2BRoute>
          <OrderDetail />
        </B2BRoute>
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
      <Route path="/admin/discounts" element={
        <AdminRoute>
          <AdminDiscounts />
        </AdminRoute>
      } />
      <Route path="/admin/preorders/manage" element={
        <AdminRoute>
          <PreorderCampaignManager />
        </AdminRoute>
      } />
      <Route path="/admin/preorders/:campaignId" element={
        <AdminRoute>
          <AdminPreorders />
        </AdminRoute>
      } />
      <Route path="/admin/products" element={
        <AdminRoute>
          <ProductManagement />
        </AdminRoute>
      } />
      <Route path="/admin/brands" element={
        <AdminRoute>
          <AdminBrands />
        </AdminRoute>
      } />
      <Route path="/admin/orders" element={
        <AdminRoute>
          <AdminOrders />
        </AdminRoute>
      } />
      <Route path="/admin/migrate-images" element={
        <AdminRoute>
          <MigrateImages />
        </AdminRoute>
      } />
      
      {/* Admin Auth Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Admin Setup - Special route, should be removed after initial setup */}
      <Route path="/admin/setup" element={<AdminSetup />} />
      
      {/* Affiliate Routes */}
      <Route path="/affiliate/dashboard" element={
        <ProtectedRoute allowedRoles={['affiliate']}>
          <AffiliateDashboard />
        </ProtectedRoute>
      } />
      
      {/* Retailer Routes */}
      <Route path="/retailer/dashboard" element={
        <ProtectedRoute allowedRoles={['retailer']}>
          <RetailerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/retailer/orders" element={
        <ProtectedRoute allowedRoles={['retailer']}>
          <RetailerOrders />
        </ProtectedRoute>
      } />
      <Route path="/retailer/orders/:orderId" element={
        <ProtectedRoute allowedRoles={['retailer']}>
          <OrderDetail />
        </ProtectedRoute>
      } />
      
      {/* Brand Routes */}
      <Route path="/brand/dashboard" element={
        <ProtectedRoute allowedRoles={['brand']}>
          <BrandDashboard />
        </ProtectedRoute>
      } />
      <Route path="/brand/orders" element={
        <ProtectedRoute allowedRoles={['brand']}>
          <BrandOrders />
        </ProtectedRoute>
      } />
      <Route path="/brand/orders/:orderId" element={
        <ProtectedRoute allowedRoles={['brand']}>
          <OrderDetail />
        </ProtectedRoute>
      } />
      
      {/* Consumer/B2C Routes - Public */}
      <Route path="/shop" element={<ConsumerShop />} />
      <Route path="/shop/brands" element={<ConsumerBrands />} />
      <Route path="/shop/brands/:brandId" element={<ConsumerBrandDetail />} />
      <Route path="/shop/preorders" element={<ConsumerPreorders />} />
      <Route path="/shop/preorder-cart" element={<ConsumerPreorderCart />} />
      <Route path="/shop/products/:productId" element={<ConsumerProductDetail />} />
      <Route path="/shop/cart" element={<ConsumerUnifiedCart />} />
      <Route path="/shop/login" element={<ConsumerLogin />} />
      <Route path="/shop/register" element={<ConsumerRegister />} />
      
      {/* Consumer Protected Routes */}
      <Route path="/shop/checkout" element={
        <ConsumerRoute>
          <ConsumerCheckout />
        </ConsumerRoute>
      } />
      <Route path="/shop/preorder-checkout" element={
        <Navigate to="/shop/checkout?mode=preorder" replace />
      } />
      <Route path="/shop/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/shop/account" element={
        <ConsumerRoute>
          <Profile />
        </ConsumerRoute>
      } />
      <Route path="/shop/order-history" element={
        <ConsumerRoute>
          <ConsumerOrderHistory />
        </ConsumerRoute>
      } />
      {/* Legacy routes - redirect to unified order history */}
      <Route path="/shop/orders" element={
        <ConsumerRoute>
          <ConsumerOrderHistory />
        </ConsumerRoute>
      } />
      <Route path="/shop/preorder-history" element={
        <ConsumerRoute>
          <ConsumerOrderHistory />
        </ConsumerRoute>
      } />
      <Route path="/shop/wishlist" element={
        <ConsumerRoute>
          <Wishlist />
        </ConsumerRoute>
      } />
      
      {/* Legacy consumer routes - redirect to new /shop/* pattern */}
      <Route path="/consumer/*" element={<Navigate to="/shop" replace />} />
      
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