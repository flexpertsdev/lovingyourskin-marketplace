import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Section } from '../../components/layout'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui'
import { useAuthStore } from '../../stores/auth.store'
import { authService } from '../../services'
import toast from 'react-hot-toast'

export const ConsumerRegister: React.FC = () => {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phoneNumber: '',
    language: 'en' as 'en' | 'ko' | 'zh',
    newsletter: false
  })
  
  const [validationError, setValidationError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    setIsLoading(true)
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      setIsLoading(false)
      return
    }
    
    // Validate password strength
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }
    
    try {
      // Register consumer (no invite code needed)
      const user = await authService.registerConsumer({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phoneNumber || undefined,
        language: formData.language,
        newsletter: formData.newsletter
      })
      
      // Update auth store
      setUser(user)
      
      toast.success('Welcome to Loving Your Skin!')
      navigate('/shop')
    } catch (error: any) {
      setValidationError(error.message || 'Registration failed')
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Section className="min-h-[calc(100vh-200px)] flex items-center bg-gradient-to-br from-soft-pink to-white">
      <Container size="sm">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-light text-deep-charcoal">Create Your Account</CardTitle>
            <CardDescription className="text-base mt-2">
              Join our K-beauty community and discover your perfect skincare routine
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoComplete="name"
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
              />
              
              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                autoComplete="tel"
                hint="We'll use this for order updates only"
              />
              
              <Select
                label="Preferred Language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'ko' | 'zh' })}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'ko', label: '한국어 (Korean)' },
                  { value: 'zh', label: '中文 (Chinese)' }
                ]}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                hint="Minimum 8 characters"
                required
                autoComplete="new-password"
              />
              
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={validationError || undefined}
                required
                autoComplete="new-password"
              />
              
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                  className="mt-1 text-rose-gold focus:ring-rose-gold rounded"
                />
                <label htmlFor="newsletter" className="text-sm text-text-secondary cursor-pointer">
                  I'd like to receive skincare tips, exclusive offers, and product updates via email
                </label>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Create Account
                </Button>
              </div>
              
              <p className="text-xs text-text-secondary text-center pt-2">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-rose-gold hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-rose-gold hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <Link to="/shop/login" className="text-rose-gold hover:text-rose-gold-dark font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-center text-sm text-text-secondary mt-3">
                Are you a retailer or brand?{' '}
                <Link to="/register" className="text-rose-gold hover:text-rose-gold-dark font-medium">
                  Register with invite code
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Section>
  )
}