import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Section } from '../../components/layout'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui'
import { useAuthStore } from '../../stores/auth.store'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    try {
      await login(formData.email, formData.password)
      // Get updated user after login
      const authStore = useAuthStore.getState()
      const user = authStore.user
      
      // Redirect based on user role
      if (user) {
        switch (user.role) {
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
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={error && error.includes('email') ? error : undefined}
                required
                autoComplete="email"
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={error && !error.includes('email') ? error : undefined}
                required
                autoComplete="current-password"
              />
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-text-secondary">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-rose-gold hover:text-rose-gold-dark">
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                fullWidth
                size="large"
                loading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link to="/register" className="text-rose-gold hover:text-rose-gold-dark font-medium">
                  Sign up
                </Link>
              </p>
            </div>
            
            {/* Temporary link to admin dashboard for already logged in users */}
            <div className="mt-6 text-center border-t pt-6">
              <p className="text-sm text-text-secondary mb-2">Already logged in?</p>
              <div className="space-x-4">
                <Link to="/admin/dashboard" className="text-rose-gold hover:text-rose-gold-dark text-sm">
                  Go to Admin Dashboard
                </Link>
                <Link to="/dashboard" className="text-rose-gold hover:text-rose-gold-dark text-sm">
                  Go to Dashboard
                </Link>
              </div>
            </div>
            
          </CardContent>
        </Card>
      </Container>
    </Section>
  )
}