import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Container, Section, Grid } from '../../components/layout'
import { Card, CardContent, Button, Badge, Input } from '../../components/ui'
import { preorderService, productService } from '../../services'
import { useAuthStore } from '../../stores/auth.store'
import { PreorderCampaign, PreorderStats } from '../../types/preorder'
import { Product } from '../../types'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'

interface CampaignFormData {
  name: string
  discountPercentage: number
  startDate: string
  endDate: string
  preorderDate: string
  deliveryTimeframe: string
  availableProducts: string[]
}

export const PreorderManagement: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [campaigns, setCampaigns] = useState<PreorderCampaign[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<PreorderCampaign | null>(null)
  const [campaignStats, setCampaignStats] = useState<PreorderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<PreorderCampaign | null>(null)
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    discountPercentage: 10,
    startDate: '',
    endDate: '',
    preorderDate: '',
    deliveryTimeframe: '3 weeks',
    availableProducts: []
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCampaign) {
      loadCampaignStats(selectedCampaign.id)
    }
  }, [selectedCampaign])

  const loadData = async () => {
    setLoading(true)
    try {
      const [campaignsData, productsData] = await Promise.all([
        preorderService.getCampaigns(),
        productService.getAll()
      ])
      setCampaigns(campaignsData)
      setProducts(productsData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load pre-order data')
    } finally {
      setLoading(false)
    }
  }

  const loadCampaignStats = async (campaignId: string) => {
    try {
      const stats = await preorderService.getCampaignStats(campaignId)
      setCampaignStats(stats)
    } catch (error) {
      console.error('Failed to load campaign stats:', error)
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const campaignData = {
        ...formData,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        preorderDate: Timestamp.fromDate(new Date(formData.preorderDate)),
        status: 'draft' as const,
        createdBy: user?.id || '',
        totalOrders: 0,
        totalRevenue: 0
      }

      if (editingCampaign) {
        await preorderService.updateCampaign(editingCampaign.id, campaignData)
        toast.success('Campaign updated successfully')
      } else {
        await preorderService.createCampaign(campaignData)
        toast.success('Campaign created successfully')
      }

      setShowForm(false)
      setEditingCampaign(null)
      setFormData({
        name: '',
        discountPercentage: 10,
        startDate: '',
        endDate: '',
        preorderDate: '',
        deliveryTimeframe: '3 weeks',
        availableProducts: []
      })
      loadData()
    } catch (error) {
      console.error('Failed to save campaign:', error)
      toast.error('Failed to save campaign')
    }
  }

  const handleActivateCampaign = async (campaign: PreorderCampaign) => {
    try {
      // Deactivate any active campaigns first
      const activeCampaigns = campaigns.filter(c => c.status === 'active')
      for (const activeCampaign of activeCampaigns) {
        await preorderService.updateCampaign(activeCampaign.id, { status: 'draft' })
      }

      // Activate the selected campaign
      await preorderService.updateCampaign(campaign.id, { status: 'active' })
      toast.success('Campaign activated successfully')
      loadData()
    } catch (error) {
      console.error('Failed to activate campaign:', error)
      toast.error('Failed to activate campaign')
    }
  }

  const handleEditCampaign = (campaign: PreorderCampaign) => {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name,
      discountPercentage: campaign.discountPercentage,
      startDate: campaign.startDate.toDate().toISOString().split('T')[0],
      endDate: campaign.endDate.toDate().toISOString().split('T')[0],
      preorderDate: campaign.preorderDate.toDate().toISOString().split('T')[0],
      deliveryTimeframe: campaign.deliveryTimeframe,
      availableProducts: campaign.availableProducts
    })
    setShowForm(true)
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      await preorderService.deleteCampaign(campaignId)
      toast.success('Campaign deleted successfully')
      loadData()
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-GB')
  }

  const getCampaignStatusColor = (status: PreorderCampaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success-green text-white'
      case 'completed':
        return 'bg-blue-500 text-white'
      case 'cancelled':
        return 'bg-error-red text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  if (loading) {
    return (
      <Layout>
        <Section>
          <Container>
            <div className="text-center py-20">Loading pre-order management...</div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section>
        <Container>
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-light mb-2">Pre-order Management</h1>
                <p className="text-text-secondary">Create and manage pre-order campaigns</p>
              </div>
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="secondary"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Campaign List */}
          {!showForm && !selectedCampaign && (
            <>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-light">All Campaigns</h2>
                <Button onClick={() => setShowForm(true)}>
                  Create New Campaign
                </Button>
              </div>

              <div className="grid gap-4">
                {campaigns.map(campaign => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    <CardContent>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium">{campaign.name}</h3>
                            <Badge className={getCampaignStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-text-secondary">
                            <div>
                              <p className="font-medium">Discount</p>
                              <p>{campaign.discountPercentage}% off</p>
                            </div>
                            <div>
                              <p className="font-medium">Campaign Period</p>
                              <p>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</p>
                            </div>
                            <div>
                              <p className="font-medium">Pre-order Date</p>
                              <p>{formatDate(campaign.preorderDate)}</p>
                            </div>
                            <div>
                              <p className="font-medium">Products</p>
                              <p>{campaign.availableProducts.length === 0 ? 'All products' : `${campaign.availableProducts.length} selected`}</p>
                            </div>
                          </div>

                          {campaign.totalOrders !== undefined && (
                            <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-text-secondary">Total Orders:</span>{' '}
                                <span className="font-medium">{campaign.totalOrders}</span>
                              </div>
                              <div>
                                <span className="text-text-secondary">Total Revenue:</span>{' '}
                                <span className="font-medium">${campaign.totalRevenue?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            View Details
                          </Button>
                          {campaign.status === 'draft' && (
                            <>
                              <Button
                                size="small"
                                variant="primary"
                                onClick={() => handleActivateCampaign(campaign)}
                              >
                                Activate
                              </Button>
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={() => handleEditCampaign(campaign)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="secondary"
                                className="text-error-red"
                                onClick={() => handleDeleteCampaign(campaign.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {campaigns.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-text-secondary mb-4">No pre-order campaigns yet</p>
                      <Button onClick={() => setShowForm(true)}>
                        Create Your First Campaign
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {/* Campaign Form */}
          {showForm && (
            <Card>
              <CardContent>
                <h2 className="text-xl font-light mb-6">
                  {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                </h2>

                <form onSubmit={handleCreateCampaign} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Campaign Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Summer Pre-order Special"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Discount Percentage</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Timeframe</label>
                      <Input
                        type="text"
                        value={formData.deliveryTimeframe}
                        onChange={(e) => setFormData({ ...formData, deliveryTimeframe: e.target.value })}
                        placeholder="e.g., 3 weeks"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pre-order Processing Date</label>
                      <Input
                        type="date"
                        value={formData.preorderDate}
                        onChange={(e) => setFormData({ ...formData, preorderDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Available Products (leave empty for all products)
                    </label>
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
                      {products.map(product => (
                        <label key={product.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.availableProducts.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  availableProducts: [...formData.availableProducts, product.id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  availableProducts: formData.availableProducts.filter(id => id !== product.id)
                                })
                              }
                            }}
                          />
                          <span className="text-sm">
                            {product.name} - {product.brandId}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit">
                      {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowForm(false)
                        setEditingCampaign(null)
                        setFormData({
                          name: '',
                          discountPercentage: 10,
                          startDate: '',
                          endDate: '',
                          preorderDate: '',
                          deliveryTimeframe: '3 weeks',
                          availableProducts: []
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Campaign Details */}
          {selectedCampaign && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-light">Campaign Details: {selectedCampaign.name}</h2>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedCampaign(null)
                    setCampaignStats(null)
                  }}
                >
                  Back to Campaigns
                </Button>
              </div>

              {/* Campaign Info */}
              <Card className="mb-6">
                <CardContent>
                  <Grid cols={4} gap="md">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Status</p>
                      <Badge className={getCampaignStatusColor(selectedCampaign.status)}>
                        {selectedCampaign.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Discount</p>
                      <p className="text-lg font-medium">{selectedCampaign.discountPercentage}% off</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Campaign Period</p>
                      <p className="text-sm">{formatDate(selectedCampaign.startDate)} - {formatDate(selectedCampaign.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Pre-order Date</p>
                      <p className="text-sm">{formatDate(selectedCampaign.preorderDate)}</p>
                    </div>
                  </Grid>
                </CardContent>
              </Card>

              {/* Campaign Statistics */}
              {campaignStats && (
                <>
                  <Grid cols={4} gap="md" className="mb-6">
                    <Card>
                      <CardContent>
                        <p className="text-sm text-text-secondary mb-2">Total Orders</p>
                        <p className="text-3xl font-light">{campaignStats.totalOrders}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <p className="text-sm text-text-secondary mb-2">Total Revenue</p>
                        <p className="text-3xl font-light">${campaignStats.totalRevenue.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <p className="text-sm text-text-secondary mb-2">Average Order Value</p>
                        <p className="text-3xl font-light">${campaignStats.averageOrderValue.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <p className="text-sm text-text-secondary mb-2">Conversion Rate</p>
                        <p className="text-3xl font-light">N/A</p>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Orders by Status */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardContent>
                        <h3 className="font-medium mb-4">Orders by Status</h3>
                        <div className="space-y-2">
                          {Object.entries(campaignStats.ordersByStatus).map(([status, count]) => (
                            <div key={status} className="flex justify-between">
                              <span className="text-sm capitalize">{status}:</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card>
                      <CardContent>
                        <h3 className="font-medium mb-4">Top Products</h3>
                        <div className="space-y-2">
                          {campaignStats.topProducts.slice(0, 5).map((product, index) => (
                            <div key={product.productId} className="flex justify-between text-sm">
                              <span className="truncate flex-1 mr-2">
                                {index + 1}. {product.productName}
                              </span>
                              <span className="font-medium">${product.revenue.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Actions */}
                  {selectedCampaign.status === 'active' && (
                    <Card>
                      <CardContent>
                        <h3 className="font-medium mb-4">Campaign Actions</h3>
                        <div className="flex gap-4">
                          <Button
                            onClick={() => navigate(`/admin/preorders/${selectedCampaign.id}`)}
                          >
                            View All Pre-orders
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleEditCampaign(selectedCampaign)}
                          >
                            Edit Products
                          </Button>
                          <Button
                            variant="secondary"
                            className="text-warning-amber"
                            onClick={() => {
                              if (confirm('Are you sure you want to end this campaign?')) {
                                preorderService.updateCampaign(selectedCampaign.id, { status: 'completed' })
                                  .then(() => {
                                    toast.success('Campaign ended')
                                    loadData()
                                    setSelectedCampaign(null)
                                  })
                                  .catch(() => toast.error('Failed to end campaign'))
                              }
                            }}
                          >
                            End Campaign
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}