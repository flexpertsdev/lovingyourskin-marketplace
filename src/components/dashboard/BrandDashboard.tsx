import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Section, Grid } from '../layout'
import { Card, CardContent, Button } from '../ui'
import { useAuthStore } from '../../stores/auth.store'
import { productService } from '../../services'
import { useQuery } from '@tanstack/react-query'

export const BrandDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // Get brand details
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => productService.getBrands()
  })
  
  const brand = brands?.find(b => b.id === user?.companyId)
  
  // Clean metrics for brands (no fake data)
  const metrics = {
    totalRetailers: 0,
    activeOrders: 0,
    totalProducts: brand?.productCount || 0,
    pendingInquiries: 0
  }
  
  return (
    <>
      <Section>
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-light text-deep-charcoal mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-text-secondary">
              {brand?.name.en || brand?.name.ko || 'Brand Dashboard'}
            </p>
          </div>
          
          {/* Key Metrics */}
          <Grid cols={4} gap="md" className="mb-10">
            <Card className="text-center">
              <CardContent className="py-8">
                <p className="text-sm text-text-secondary mb-2">Total Retailers</p>
                <p className="text-4xl font-light text-deep-charcoal">{metrics.totalRetailers}</p>
                <p className="text-xs text-text-secondary mt-2">Partner stores</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="py-8">
                <p className="text-sm text-text-secondary mb-2">Active Orders</p>
                <p className="text-4xl font-light text-deep-charcoal">{metrics.activeOrders}</p>
                <p className="text-xs text-text-secondary mt-2">In progress</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="py-8">
                <p className="text-sm text-text-secondary mb-2">Products Listed</p>
                <p className="text-4xl font-light text-deep-charcoal">{metrics.totalProducts}</p>
                <Button 
                  variant="ghost" 
                  size="small" 
                  className="mt-3"
                  onClick={() => navigate(`/brands/${user?.companyId}`)}
                >
                  View Catalog →
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="py-8">
                <p className="text-sm text-text-secondary mb-2">New Inquiries</p>
                <p className="text-4xl font-light text-deep-charcoal">{metrics.pendingInquiries}</p>
                <p className="text-xs text-text-secondary mt-2">Awaiting response</p>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Quick Actions */}
          <div className="mb-10">
            <h2 className="text-xl font-light mb-4 text-deep-charcoal">Quick Actions</h2>
            <Grid cols={3} gap="md">
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => navigate(`/brands/${user?.companyId}`)}
              >
                📦 View My Products
              </Button>
              <Button 
                variant="secondary" 
                fullWidth
                disabled
              >
                📊 Sales Analytics
                <span className="text-xs ml-2">(Coming Soon)</span>
              </Button>
              <Button 
                variant="secondary" 
                fullWidth
                disabled
              >
                💬 Retailer Messages
                <span className="text-xs ml-2">(Coming Soon)</span>
              </Button>
            </Grid>
          </div>
          
          {/* Brand Information */}
          {brand && (
            <div className="mb-10">
              <h2 className="text-xl font-light mb-4 text-deep-charcoal">Brand Overview</h2>
              <Card>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-medium text-deep-charcoal mb-4">Brand Details</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Brand Name:</dt>
                          <dd className="font-medium">{brand.name.en}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Categories:</dt>
                          <dd className="font-medium">{brand.categories.join(', ')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Products:</dt>
                          <dd className="font-medium">{brand.productCount} items</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Min. Order:</dt>
                          <dd className="font-medium">{brand.minimumOrder} units</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h3 className="font-medium text-deep-charcoal mb-4">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {brand.certifications.map((cert, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-soft-pink rounded-full text-sm"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border-gray">
                    <p className="text-sm text-text-secondary mb-4">{brand.description.en}</p>
                    <Button 
                      variant="primary"
                      onClick={() => navigate(`/brands/${user?.companyId}`)}
                    >
                      View Full Brand Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Coming Soon Features */}
          <div>
            <h2 className="text-xl font-light mb-4 text-deep-charcoal">Coming Soon</h2>
            <Grid cols={3} gap="md">
              <Card className="bg-gray-50">
                <CardContent className="text-center py-10">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="font-medium text-deep-charcoal mb-2">Sales Analytics</h3>
                  <p className="text-sm text-text-secondary">
                    Track your performance and growth across all retailers
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50">
                <CardContent className="text-center py-10">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="font-medium text-deep-charcoal mb-2">Retailer Directory</h3>
                  <p className="text-sm text-text-secondary">
                    Connect with verified retailers in your target markets
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50">
                <CardContent className="text-center py-10">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="font-medium text-deep-charcoal mb-2">Marketing Tools</h3>
                  <p className="text-sm text-text-secondary">
                    Access promotional materials and campaign management
                  </p>
                </CardContent>
              </Card>
            </Grid>
          </div>
          
          {/* Support Section */}
          <div className="mt-10 bg-soft-pink rounded-xl p-6">
            <h3 className="text-lg font-medium text-deep-charcoal mb-2">Need Help?</h3>
            <p className="text-text-secondary mb-4">
              Our team is here to support your success in international markets.
            </p>
            <div className="flex gap-4">
              <Button variant="secondary" size="small" onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
              <Button variant="ghost" size="small" disabled>
                Download Brand Guide
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}