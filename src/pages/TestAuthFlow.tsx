import React from 'react'
import { useAuthStore } from '../stores/auth.store'
import { useUIStore } from '../stores/ui.store'
import { Layout } from '../components/layout'
import { Container } from '../components/layout'
import { Button } from '../components/ui'

export const TestAuthFlow: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout, updateLanguage } = useAuthStore()
  const { language } = useUIStore()

  const handleTestLogin = async () => {
    try {
      await login('admin@lovingyourskin.com', 'admin123')
      console.log('Login successful')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleTestRetailerLogin = async () => {
    try {
      await login('retailer@example.com', 'test123')
      console.log('Retailer login successful')
    } catch (error) {
      console.error('Retailer login failed:', error)
    }
  }

  const handleTestLogout = async () => {
    try {
      await logout()
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleLanguageTest = async (lang: 'en' | 'ko' | 'zh') => {
    if (user) {
      await updateLanguage(lang)
      console.log(`Language updated to ${lang}`)
    }
  }

  return (
    <Layout>
      <Container className="py-12">
        <h1 className="text-3xl font-bold mb-8">Auth Flow Test Page</h1>
        
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <pre className="bg-white p-4 rounded">
            {JSON.stringify({
              isAuthenticated,
              isLoading,
              user: user ? {
                email: user.email,
                role: user.role,
                language: user.language,
                id: user.id
              } : null,
              uiLanguage: language
            }, null, 2)}
          </pre>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Actions</h2>
          
          <div className="flex gap-4 flex-wrap">
            {!isAuthenticated ? (
              <>
                <Button onClick={handleTestLogin} disabled={isLoading}>
                  Login as Admin
                </Button>
                <Button onClick={handleTestRetailerLogin} disabled={isLoading}>
                  Login as Retailer
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleTestLogout} disabled={isLoading}>
                  Logout
                </Button>
                <Button onClick={() => handleLanguageTest('en')} disabled={isLoading}>
                  Set English
                </Button>
                <Button onClick={() => handleLanguageTest('ko')} disabled={isLoading}>
                  Set Korean
                </Button>
                <Button onClick={() => handleLanguageTest('zh')} disabled={isLoading}>
                  Set Chinese
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
          <p className="mb-4">Check the header to see if menu items change based on authentication and role.</p>
          <div className="space-y-2">
            <p><strong>Unauthenticated users should see:</strong> How It Works, For Brands, For Retailers, Login, Register</p>
            <p><strong>Authenticated retailers should see:</strong> Brands, Cart, Dashboard, Orders, Messages</p>
            <p><strong>Authenticated admins should see:</strong> Brands, Dashboard, Orders, Messages, Admin (with shield icon)</p>
          </div>
        </div>
      </Container>
    </Layout>
  )
}