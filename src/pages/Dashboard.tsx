import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { useAuthStore } from '../stores/auth.store'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  useEffect(() => {
    // Redirect to role-specific dashboard
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true })
          break
        case 'brand':
          navigate('/brand/dashboard', { replace: true })
          break
        case 'retailer':
          navigate('/retailer/dashboard', { replace: true })
          break
        case 'affiliate':
          navigate('/affiliate/dashboard', { replace: true })
          break
        case 'consumer':
          navigate('/shop', { replace: true })
          break
        default:
          // If no specific role, stay on generic dashboard
          break
      }
    }
  }, [user, navigate])
  
  // Show loading while redirecting
  return (
    <Layout>
      <Section>
        <Container>
          <div className="text-center py-20">
            <h2 className="text-2xl font-light mb-4">Loading Dashboard...</h2>
            <p className="text-text-secondary">Redirecting to your dashboard...</p>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}