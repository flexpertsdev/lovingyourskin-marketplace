import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Container, Section } from '../../components/layout'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui'
import { useAuthStore } from '../../stores/auth.store'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register, isLoading, error, clearError } = useAuthStore()
  
  const [inviteCode, setInviteCode] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    language: 'en' as 'en' | 'ko' | 'zh'
  })
  
  const [validationError, setValidationError] = useState('')
  
  // Handle URL parameters on mount
  useEffect(() => {
    const codeParam = searchParams.get('code')
    const emailParam = searchParams.get('email')
    
    if (codeParam) {
      setInviteCode(codeParam.toUpperCase())
    }
    
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }))
    }
  }, [searchParams])
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError('')
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }
    
    // Validate password strength
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }
    
    try {
      // Pass invite code (can be empty string for consumer registration)
      const result = await register(inviteCode, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        language: formData.language
      })
      
      // Redirect based on user role
      if (result?.user) {
        switch (result.user.role) {
          case 'consumer':
            navigate('/shop')
            break
          case 'affiliate':
            navigate('/affiliate/dashboard')
            break
          case 'admin':
            navigate('/admin/dashboard')
            break
          case 'retailer':
            navigate('/retailer/dashboard')
            break
          case 'brand':
            navigate('/brand/dashboard')
            break
          default:
            navigate('/dashboard')
        }
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      // Error is handled by the store
    }
  }
  
  return (
    <Section className="min-h-[calc(100vh-200px)] flex items-center">
      <Container size="sm">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Join the Loving Your Skin community
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoComplete="name"
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
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
                required
                autoComplete="new-password"
              />
              
              <Input
                label="Invitation Code (Optional)"
                placeholder="Enter code if you have one"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                hint="Have a retailer, brand, or affiliate code? Enter it here"
                maxLength={30}
              />
              
              {validationError && (
                <div className="text-red-500 text-sm">{validationError}</div>
              )}
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <Button
                type="submit"
                fullWidth
                size="large"
                loading={isLoading}
                disabled={isLoading}
              >
                Create Account
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="text-rose-gold hover:text-rose-gold-dark font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Section>
  )
}