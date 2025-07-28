import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Container, Section } from '../../components/layout'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui'
import { useAuthStore } from '../../stores/auth.store'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register, isLoading, error, clearError } = useAuthStore()
  
  const [step, setStep] = useState<'invite' | 'details'>('invite')
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
      
      // If email is also provided, pre-fill it
      if (emailParam) {
        setFormData(prev => ({ ...prev, email: emailParam }))
      }
      
      // Auto-advance to details step if code is provided
      if (codeParam.trim().length >= 6) {
        setStep('details')
      }
    }
  }, [searchParams])
  
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteCode.trim().length < 6) {
      setValidationError('Please enter a valid invitation code')
      return
    }
    setValidationError('')
    setStep('details')
  }
  
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
      await register(inviteCode, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        language: formData.language
      })
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the store
    }
  }
  
  return (
    <Section className="min-h-[calc(100vh-200px)] flex items-center">
      <Container size="sm">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join Loving Your Skin</CardTitle>
            <CardDescription>
              {step === 'invite' 
                ? 'Enter your invitation code to get started' 
                : 'Create your account'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 'invite' ? (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <Input
                  label="Invitation Code"
                  placeholder="Enter your code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  error={validationError || (error && step === 'invite' ? error : undefined)}
                  hint="Don't have a code? Request one on our homepage"
                  required
                  maxLength={30}
                />
                
                <Button type="submit" fullWidth size="large">
                  Verify Code
                </Button>
                
                {/* Demo Codes */}
                <div className="mt-4 p-4 bg-soft-pink rounded-lg">
                  <p className="text-sm font-medium text-deep-charcoal mb-2">Demo Invitation Codes:</p>
                  <p className="text-xs text-text-secondary">Retailer: RETAIL2024</p>
                  <p className="text-xs text-text-secondary">Brand: BRAND2024</p>
                </div>
              </form>
            ) : (
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
                  error={validationError || (error || undefined)}
                  required
                  autoComplete="new-password"
                />
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep('invite')}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
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
              </form>
            )}
            
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