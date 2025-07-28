import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout } from '../layout'
import { Container, Section } from '../layout'
import { Button } from '../ui'
import { useAuthStore } from '../../stores/auth.store'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Orders', href: '/admin/orders', icon: '📦' },
    { name: 'Messages', href: '/admin/messages', icon: '💬' },
    { name: 'Products', href: '/admin/products', icon: '🛍️' },
    { name: 'Brands', href: '/admin/brands', icon: '🏢' },
  ]

  return (
    <Layout>
      <Section className="bg-gray-50 min-h-screen">
        <Container>
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 bg-white rounded-lg shadow-sm p-6 h-fit sticky top-20">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-deep-charcoal mb-1">Admin Panel</h2>
                <p className="text-sm text-text-secondary">{user?.email}</p>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-rose-gold/10 text-rose-gold font-medium'
                          : 'text-text-secondary hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}