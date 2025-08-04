import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'
import { authService } from '../services'
import { Container } from '../components/layout'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'

// Icon components
const AlertCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export const ConsumerLogin: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Redirect URL after login
  const redirect = searchParams.get('redirect') || '/consumer/shop'
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phoneNumber: '',
    newsletter: false,
    agreeToTerms: false
  })
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const user = await authService.login(loginData.email, loginData.password)
      
      if (user.role !== 'consumer') {
        throw new Error('Please use the business login for retailer accounts')
      }
      
      setUser(user)
      toast.success('Welcome back!')
      navigate(redirect)
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (!registerData.agreeToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }
    
    setLoading(true)
    
    try {
      const user = await authService.registerConsumer({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        phoneNumber: registerData.phoneNumber,
        newsletter: registerData.newsletter,
        language: 'en'
      })
      
      setUser(user)
      toast.success('Account created successfully!')
      navigate(redirect)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Container className="py-12 max-w-md mx-auto">
      <Card>
        <CardContent className="p-8">
          <h1 className="text-2xl font-light text-center mb-8">
            Welcome to Loving Your Skin
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex mb-8 border-b">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 pb-4 text-center transition-colors ${
                activeTab === 'login'
                  ? 'text-rose-gold border-b-2 border-rose-gold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 pb-4 text-center transition-colors ${
                activeTab === 'register'
                  ? 'text-rose-gold border-b-2 border-rose-gold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircleIcon />
              <span>{error}</span>
            </div>
          )}
          
          {/* Login Tab */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-rose-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Login
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Are you a business?{' '}
                <Link to="/login" className="text-rose-gold hover:underline">
                  Business Login
                </Link>
              </div>
            </form>
          )}
          
          {/* Register Tab */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  value={registerData.phoneNumber}
                  onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                  placeholder="+44 20 1234 5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={registerData.newsletter}
                    onChange={(e) => setRegisterData({ ...registerData, newsletter: e.target.checked })}
                    className="w-4 h-4 text-rose-gold rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I want to receive promotional emails about new products and offers
                  </span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={registerData.agreeToTerms}
                    onChange={(e) => setRegisterData({ ...registerData, agreeToTerms: e.target.checked })}
                    className="w-4 h-4 text-rose-gold rounded"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-rose-gold hover:underline">
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-rose-gold hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
              
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading || !registerData.agreeToTerms}
              >
                Create Account
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Are you a business?{' '}
                <Link to="/register" className="text-rose-gold hover:underline">
                  Business Registration
                </Link>
              </div>
            </form>
          )}
          
          {/* Guest Checkout Option */}
          {redirect.includes('checkout') && (
            <div className="mt-8 pt-8 border-t">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate('/shop/checkout?guest=true')}
              >
                Continue as Guest
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}