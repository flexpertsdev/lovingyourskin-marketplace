import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../components/auth'
import { Landing } from '../pages/Landing'
import { Login, Register } from '../pages/auth'
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
import { Preorder } from '../pages/Preorder'
import { PreorderDetail } from '../pages/PreorderDetail'

export const AppRoutes: React.FC = () => {
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
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } />
      <Route path="/orders/:orderId" element={
        <ProtectedRoute>
          <OrderDetail />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      
      {/* Preorder Routes - Protected */}
      <Route path="/preorder" element={
        <ProtectedRoute>
          <Preorder />
        </ProtectedRoute>
      } />
      <Route path="/preorder/:id" element={
        <ProtectedRoute>
          <PreorderDetail />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes - Require Admin Role */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/setup" element={
        <ProtectedRoute requiredRole="admin">
          <AdminSetup />
        </ProtectedRoute>
      } />
      
      {/* Legal and Info Pages - Public */}
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/refunds" element={<RefundPolicy />} />
      <Route path="/careers" element={<Careers />} />
      
      {/* 404 */}
      <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
    </Routes>
  )
}
