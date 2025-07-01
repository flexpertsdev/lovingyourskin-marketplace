import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Landing } from '../pages/Landing'
import { ComponentDemo } from '../pages/ComponentDemo'
import { Login, Register } from '../pages/auth'
import { Brands } from '../pages/Brands'
import { BrandDetail } from '../pages/BrandDetail'
import { ProductDetail } from '../pages/ProductDetail'
import { Test } from '../pages/Test'
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

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/test" element={<Test />} />
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
      
      {/* 404 */}
      <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
    </Routes>
  )
}