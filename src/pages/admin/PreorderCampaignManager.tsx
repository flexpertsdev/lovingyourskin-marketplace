import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Container, Section } from '../../components/layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { preorderService, productService } from '../../services'
import { useAuthStore } from '../../stores/auth.store'
import { PreorderCampaign, PreorderStats } from '../../types/preorder'
import { Product } from '../../types'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'
import { 
  Calendar, 
  Clock, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign,
  Edit3,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  Zap,
  Archive,
  Eye,
  Copy
} from 'lucide-react'

interface CampaignFormData {
  name: string
  description: string
  discountPercentage: number
  startDate: string
  endDate: string
  preorderDate: string
  deliveryTimeframe: string
  availableProducts: string[]
  targetRevenue?: number
  minOrderAmount?: number
  maxOrdersPerCustomer?: number
  tags?: string[]
}

export const PreorderCampaignManager: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [campaigns, setCampaigns] = useState<PreorderCampaign[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<PreorderCampaign | null>(null)
  const [campaignStats, setCampaignStats] = useState<PreorderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<PreorderCampaign | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    discountPercentage: 15,
    startDate: '',
    endDate: '',
    preorderDate: '',
    deliveryTimeframe: '3-4 weeks',
    availableProducts: [],
    targetRevenue: 10000,
    minOrderAmount: 50,
    maxOrdersPerCustomer: 5,
    tags: []
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
        totalRevenue: 0,
        availableProducts: Array.from(selectedProducts)
      }

      if (editingCampaign) {
        await preorderService.updateCampaign(editingCampaign.id, campaignData)
        toast.success('Campaign updated successfully')
      } else {
        await preorderService.createCampaign(campaignData)
        toast.success('Campaign created successfully')
      }

      resetForm()
      loadData()
    } catch (error) {
      console.error('Failed to save campaign:', error)
      toast.error('Failed to save campaign')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingCampaign(null)
    setSelectedProducts(new Set())
    setFormData({
      name: '',
      description: '',
      discountPercentage: 15,
      startDate: '',
      endDate: '',
      preorderDate: '',
      deliveryTimeframe: '3-4 weeks',
      availableProducts: [],
      targetRevenue: 10000,
      minOrderAmount: 50,
      maxOrdersPerCustomer: 5,
      tags: []
    })
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
    setSelectedProducts(new Set(campaign.availableProducts))
    setFormData({
      name: campaign.name,
      description: (campaign as any).description || ''
      discountPercentage: campaign.discountPercentage,
      startDate: campaign.startDate.toDate().toISOString().split('T')[0],
      endDate: campaign.endDate.toDate().toISOString().split('T')[0],
      preorderDate: campaign.preorderDate.toDate().toISOString().split('T')[0],
      deliveryTimeframe: campaign.deliveryTimeframe,
      availableProducts: campaign.availableProducts,
      targetRevenue: (campaign as any).targetRevenue || 10000,
      minOrderAmount: (campaign as any).minOrderAmount || 50,
      maxOrdersPerCustomer: (campaign as any).maxOrdersPerCustomer || 5,
      tags: (campaign as any).tags || []
    })
    setShowForm(true)
  }

  const handleDeleteCampaign = async (campaign: PreorderCampaign) => {
    if (window.confirm(`Are you sure you want to delete the campaign "${campaign.name}"?`)) {
      try {
        await preorderService.deleteCampaign(campaign.id)
        toast.success('Campaign deleted successfully')
        loadData()
      } catch (error) {
        console.error('Failed to delete campaign:', error)
        toast.error('Failed to delete campaign')
      }
    }
  }

  const handleDuplicateCampaign = (campaign: PreorderCampaign) => {
    setEditingCampaign(null)
    setSelectedProducts(new Set(campaign.availableProducts))
    setFormData({
      name: `${campaign.name} (Copy)`,
      description: (campaign as any).description || ''
      discountPercentage: campaign.discountPercentage,
      startDate: '',
      endDate: '',
      preorderDate: '',
      deliveryTimeframe: campaign.deliveryTimeframe,
      availableProducts: campaign.availableProducts,
      targetRevenue: (campaign as any).targetRevenue || 10000,
      minOrderAmount: (campaign as any).minOrderAmount || 50,
      maxOrdersPerCustomer: (campaign as any).maxOrdersPerCustomer || 5,
      tags: (campaign as any).tags || []
    })
    setShowForm(true)
  }

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts)
    if (newSelection.has(productId)) {
      newSelection.delete(productId)
    } else {
      newSelection.add(productId)
    }
    setSelectedProducts(newSelection)
  }

  const getCampaignStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: 'bg-success-green text-white', icon: <Zap className="w-3 h-3" /> },
      draft: { className: 'bg-gray-500 text-white', icon: <Edit3 className="w-3 h-3" /> },
      scheduled: { className: 'bg-blue-500 text-white', icon: <Clock className="w-3 h-3" /> },
      completed: { className: 'bg-purple-500 text-white', icon: <Check className="w-3 h-3" /> },
      archived: { className: 'bg-gray-400 text-white', icon: <Archive className="w-3 h-3" /> }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const filteredProducts = products.filter(product => {
    const name = product.name?.toLowerCase() || ''
    return name.includes(searchTerm.toLowerCase())
  })

  return (
    <Layout>
      <Section>
        <Container>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-light mb-2">Pre-order Campaign Manager</h1>
                  <p className="text-text-secondary">
                    Create and manage pre-order campaigns with exclusive discounts
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  size="large"
                  icon={<Plus className="w-5 h-5" />}
                  onClick={() => setShowForm(true)}
                >
                  Create Campaign
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">Total Campaigns</p>
                      <p className="text-2xl font-light">{campaigns.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-soft-pink rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-rose-gold" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">Active Campaign</p>
                      <p className="text-2xl font-light">
                        {campaigns.filter(c => c.status === 'active').length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-success-green/10 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-success-green" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">Total Revenue</p>
                      <p className="text-2xl font-light">
                        {formatCurrency(campaigns.reduce((sum, c) => sum + (c.totalRevenue || 0), 0))}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-rose-gold/10 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-rose-gold" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">Total Orders</p>
                      <p className="text-2xl font-light">
                        {campaigns.reduce((sum, c) => sum + (c.totalOrders || 0), 0)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaigns List */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>All Campaigns</CardTitle>
                <CardDescription>
                  Manage your pre-order campaigns and track their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-10 h-10 text-rose-gold" />
                      </div>
                      <p className="text-text-secondary mb-4">No campaigns created yet</p>
                      <Button 
                        variant="primary"
                        onClick={() => setShowForm(true)}
                      >
                        Create Your First Campaign
                      </Button>
                    </div>
                  ) : (
                    campaigns.map(campaign => (
                      <div 
                        key={campaign.id}
                        className="border border-border-gray rounded-xl p-6 hover:border-rose-gold transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-medium">{campaign.name}</h3>
                              {getCampaignStatusBadge(campaign.status)}
                            </div>
                            {(campaign as any).description && (
                              <p className="text-text-secondary text-sm mb-3">
                                {(campaign as any).description}
                              </p>
                            )}
                            <div className="flex items-center gap-6 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-text-secondary" />
                                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="w-4 h-4 text-text-secondary" />
                                {campaign.availableProducts.length} products
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-text-secondary" />
                                {campaign.discountPercentage}% discount
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {campaign.status === 'draft' && (
                              <Button
                                variant="success"
                                size="small"
                                onClick={() => handleActivateCampaign(campaign)}
                                icon={<Zap className="w-4 h-4" />}
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => {
                                setSelectedCampaign(campaign)
                                navigate(`/admin/preorders/${campaign.id}`)
                              }}
                              icon={<Eye className="w-4 h-4" />}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => handleEditCampaign(campaign)}
                              icon={<Edit3 className="w-4 h-4" />}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => handleDuplicateCampaign(campaign)}
                              icon={<Copy className="w-4 h-4" />}
                            >
                              Duplicate
                            </Button>
                            {campaign.status !== 'active' && (
                              <Button
                                variant="ghost"
                                size="small"
                                onClick={() => handleDeleteCampaign(campaign)}
                                icon={<Trash2 className="w-4 h-4" />}
                                className="text-red-500 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Campaign Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-text-secondary">Total Orders</p>
                            <p className="text-lg font-medium">{campaign.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Revenue</p>
                            <p className="text-lg font-medium">{formatCurrency(campaign.totalRevenue || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Processing Date</p>
                            <p className="text-lg font-medium">{formatDate(campaign.preorderDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Delivery</p>
                            <p className="text-lg font-medium">{campaign.deliveryTimeframe}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Campaign Form Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                  </DialogTitle>
                  <DialogDescription>
                    Set up your pre-order campaign with exclusive discounts and special offers
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateCampaign} className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="products">Products</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div>
                        <Label htmlFor="name">Campaign Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Spring Pre-order Sale"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe your campaign..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="discount">Discount Percentage</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              id="discount"
                              type="number"
                              min="5"
                              max="50"
                              value={formData.discountPercentage}
                              onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) })}
                              required
                            />
                            <span className="text-text-secondary">%</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="delivery">Delivery Timeframe</Label>
                          <Input
                            id="delivery"
                            value={formData.deliveryTimeframe}
                            onChange={(e) => setFormData({ ...formData, deliveryTimeframe: e.target.value })}
                            placeholder="e.g., 3-4 weeks"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="preorderDate">Processing Date</Label>
                          <Input
                            id="preorderDate"
                            type="date"
                            value={formData.preorderDate}
                            onChange={(e) => setFormData({ ...formData, preorderDate: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="products" className="space-y-4">
                      <div>
                        <Label>Search Products</Label>
                        <Input
                          placeholder="Search by product name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Select Products ({selectedProducts.size} selected)</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="small"
                              onClick={() => setSelectedProducts(new Set(products.map(p => p.id)))}
                            >
                              Select All
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="small"
                              onClick={() => setSelectedProducts(new Set())}
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg max-h-96 overflow-y-auto">
                          {filteredProducts.map(product => (
                            <div
                              key={product.id}
                              className={`flex items-center gap-3 p-3 hover:bg-soft-pink cursor-pointer transition-colors ${
                                selectedProducts.has(product.id) ? 'bg-soft-pink' : ''
                              }`}
                              onClick={() => toggleProductSelection(product.id)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedProducts.has(product.id)}
                                onChange={() => {}}
                                className="rounded border-border-gray"
                              />
                              <img
                                src={product.images?.primary || '/placeholder-product.png'}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-text-secondary">
                                  {product.brand?.name || product.brandId}
                                </p>
                              </div>
                              <Badge variant="default" className="text-xs">
                                {product.category}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="targetRevenue">Target Revenue</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-text-secondary">$</span>
                            <Input
                              id="targetRevenue"
                              type="number"
                              min="0"
                              value={formData.targetRevenue}
                              onChange={(e) => setFormData({ ...formData, targetRevenue: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="minOrder">Minimum Order Amount</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-text-secondary">$</span>
                            <Input
                              id="minOrder"
                              type="number"
                              min="0"
                              value={formData.minOrderAmount}
                              onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="maxOrders">Max Orders Per Customer</Label>
                        <Input
                          id="maxOrders"
                          type="number"
                          min="1"
                          value={formData.maxOrdersPerCustomer}
                          onChange={(e) => setFormData({ ...formData, maxOrdersPerCustomer: parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tags">Campaign Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={formData.tags?.join(', ')}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                          })}
                          placeholder="e.g., spring, new-arrivals, exclusive"
                          className="mt-1"
                        />
                      </div>

                      <div className="bg-soft-pink/30 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-rose-gold mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Campaign Settings</p>
                            <p className="text-sm text-text-secondary mt-1">
                              These settings help control the campaign's behavior and limits. 
                              Target revenue helps track campaign performance against goals.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={selectedProducts.size === 0}
                    >
                      {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}