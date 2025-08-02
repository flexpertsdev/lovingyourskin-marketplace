import React from 'react'
import { Layout } from '../../components/layout'
import { Container, Section } from '../../components/layout'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'
import { AffiliateCodeManager } from '../../components/admin/AffiliateCodeManager'

export const AdminAffiliates: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      <Section>
        <Container>
          <div className="mb-8">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/dashboard')}
              className="mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-light mb-2">Affiliate Management</h1>
                <p className="text-text-secondary">
                  Create and manage affiliate codes for partners and influencers
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => window.open(`${window.location.origin}/?utm_affiliate=TEST`, '_blank')}
                >
                  Test Affiliate Link
                </Button>
              </div>
            </div>
          </div>

          <AffiliateCodeManager />
        </Container>
      </Section>
    </Layout>
  )
}