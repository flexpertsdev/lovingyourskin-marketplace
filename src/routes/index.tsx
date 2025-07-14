import React from 'react'
import { Routes, Route } from 'react-router-dom'
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

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/test" element={<Test />} />
      <Route path="/test-auth" element={<TestAuth />} />
      <Route path="/components" element={<ComponentDemo />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Product Discovery Routes */}
      <Route path="/brands" element={<Brands />} />
      <Route path="/brands/:brandId" element={<BrandDetail />} />
      <Route path="/products/:productId" element={<ProductDetail />} />
      
      {/* Marketing Pages */}
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
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      
      {/* Legal and Info Pages */}
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/refunds" element={<RefundPolicy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/careers" element={<Careers />} />
      
      {/* 404 */}
      <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
    </Routes>
  )
}