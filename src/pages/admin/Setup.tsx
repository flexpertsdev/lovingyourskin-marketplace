// src/pages/admin/Setup.tsx
import React from 'react'
import { Layout } from '@/components/layout'
import { Section, Container } from '@/components/layout'
import { InitializeFirebase } from '@/components/admin/InitializeFirebase'

export const AdminSetup: React.FC = () => {
  return (
    <Layout>
      <Section background="gray">
        <Container>
          <h1 className="text-3xl font-light text-deep-charcoal mb-8">Admin Setup</h1>
          
          <div className="space-y-8">
            <InitializeFirebase />
            
            {/* Add more setup components here as needed */}
          </div>
        </Container>
      </Section>
    </Layout>
  )
}