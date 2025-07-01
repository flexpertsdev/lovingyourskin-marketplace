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
                  Request invitation
                </Link>
              </p>
            </div>
            
            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-soft-pink rounded-lg">
              <p className="text-sm font-medium text-deep-charcoal mb-2">Demo Credentials:</p>
              <p className="text-xs text-text-secondary">Retailer: retailer@example.com / password123</p>
              <p className="text-xs text-text-secondary">Brand: brand@wismin.com / password123</p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Section>
  )
}