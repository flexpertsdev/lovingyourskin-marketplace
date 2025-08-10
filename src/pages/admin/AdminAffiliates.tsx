import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Textarea } from '../../components/ui/Textarea'
import { Label } from '../../components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import toast from 'react-hot-toast'
import { Search, Plus, Edit, Trash2, TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'
import { affiliateService, discountService } from '../../services'
import type { Affiliate } from '../../types/discount'
import type { DiscountCode } from '../../types/discount'
import { formatCurrency } from '../../utils/currency'

export default function AdminAffiliates() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [affiliateToDelete, setAffiliateToDelete] = useState<Affiliate | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    fetchAffiliates()
    fetchDiscountCodes()
  }, [user, navigate])

  const fetchAffiliates = async () => {
    setLoading(true)
    try {
      // TODO: Update affiliate service to use new Affiliate type
      const affiliateCodes = await affiliateService.getAllAffiliateCodes()
      // Map old AffiliateCode to new Affiliate type
      const allAffiliates: Affiliate[] = affiliateCodes.map(code => ({
        id: code.id,
        name: code.name || code.code, // Use code name or code itself
        email: '', // Not available in AffiliateCode
        phone: '',
        company: code.campaign || '',
        website: '',
        socialMedia: {},
        discountCodeId: code.id,
        discountCode: code.code,
        commissionType: code.commissionType,
        commissionValue: code.commissionValue,
        status: code.active ? 'active' as const : 'suspended' as const,
        stats: {
          totalClicks: 0,
          uniqueVisitors: 0,
          totalOrders: code.totalOrders || 0,
          conversionRate: 0,
          totalRevenue: code.totalRevenue || 0,
          totalCommission: code.commissionValue * code.totalOrders || 0,
          pendingCommission: 0,
          paidCommission: 0
        },
        paymentInfo: {
          method: 'bank_transfer' as const
        },
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
        createdBy: code.createdBy
      }))
      
      // Apply status filter
      const filtered = selectedStatus === 'all' 
        ? allAffiliates 
        : allAffiliates.filter((affiliate: Affiliate) => affiliate.status === selectedStatus)
      
      // Apply search filter
      const searchFiltered = searchTerm
        ? filtered.filter((affiliate: Affiliate) => 
            affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            affiliate.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            affiliate.discountCode?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : filtered

      setAffiliates(searchFiltered)
    } catch (error) {
      console.error('Error fetching affiliates:', error)
      toast.error('Failed to fetch affiliates')
    } finally {
      setLoading(false)
    }
  }

  const fetchDiscountCodes = async () => {
    try {
      const codes = await discountService.getAllDiscountCodes()
      // Filter for affiliate type codes that aren't already linked
      const affiliateCodes = codes.filter(code => code.type === 'affiliate')
      setDiscountCodes(affiliateCodes)
    } catch (error) {
      console.error('Error fetching discount codes:', error)
    }
  }

  useEffect(() => {
    fetchAffiliates()
  }, [selectedStatus, searchTerm])

  const handleUpdateAffiliate = async (affiliateId: string, updates: Partial<Affiliate>) => {
    try {
      // TODO: Update affiliate service to use new Affiliate type
      // For now, map to old AffiliateCode structure
      await affiliateService.updateAffiliateCode(affiliateId, {
        name: updates.name,
        campaign: updates.company,
        commissionType: updates.commissionType,
        commissionValue: updates.commissionValue,
        active: updates.status === 'active'
      })
      toast.success('Affiliate updated successfully')
      fetchAffiliates()
      setEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating affiliate:', error)
      toast.error('Failed to update affiliate')
    }
  }

  const handleCreateAffiliate = async (newAffiliate: Partial<Affiliate>) => {
    try {
      // First create an affiliate discount code if one doesn't exist
      let discountCodeId = newAffiliate.discountCodeId
      
      if (!discountCodeId && newAffiliate.discountCode) {
        // Create a new discount code for this affiliate
        const discountCode = await discountService.createDiscountCode({
          code: newAffiliate.discountCode,
          name: `${newAffiliate.name} Affiliate Code`,
          description: `Affiliate code for ${newAffiliate.name}`,
          type: 'affiliate',
          discountType: 'percentage',
          discountValue: 10, // Default 10% discount
          active: true,
          validFrom: new Date(),
          createdBy: user?.id || ''
        })
        discountCodeId = discountCode.id
      }

      // TODO: Update affiliate service to use new Affiliate type
      // For now, create using the old AffiliateCode structure
      const affiliateCode = newAffiliate.discountCode || `AFF${Date.now()}`
      
      await affiliateService.createAffiliateCode({
        code: affiliateCode,
        name: newAffiliate.name || 'Unnamed Affiliate',
        description: `Affiliate code for ${newAffiliate.name}`,
        campaign: newAffiliate.company || '',
        userId: user?.id,
        commissionType: newAffiliate.commissionType || 'percentage',
        commissionValue: newAffiliate.commissionValue || 10,
        discountType: 'percentage',
        discountValue: 10, // Default 10% discount for customers
        maxUses: undefined,
        maxUsesPerCustomer: undefined,
        active: newAffiliate.status === 'active',
        validFrom: new Date(),
        validUntil: undefined,
        createdBy: user?.id || ''
      })
      
      toast.success('Affiliate created successfully')
      fetchAffiliates()
      fetchDiscountCodes()
      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating affiliate:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to create affiliate: ${errorMessage}`)
    }
  }

  const handleDeleteAffiliate = async (affiliateId: string) => {
    try {
      // TODO: Update affiliate service to use new Affiliate type
      await affiliateService.deleteAffiliateCode(affiliateId)
      toast.success('Affiliate deleted successfully')
      fetchAffiliates()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting affiliate:', error)
      toast.error('Failed to delete affiliate')
    }
  }

  const handleApproveAffiliate = async (affiliateId: string) => {
    try {
      await handleUpdateAffiliate(affiliateId, { 
        status: 'active',
        approvedAt: new Date()
      })
      toast.success('Affiliate approved')
    } catch (error) {
      console.error('Error approving affiliate:', error)
      toast.error('Failed to approve affiliate')
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Affiliate Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Affiliates</p>
                      <p className="text-2xl font-semibold">{affiliates.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-rose-gold" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-semibold">
                        {affiliates.filter(a => a.status === 'active').length}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-semibold">
                        {formatCurrency(affiliates.reduce((sum, a) => sum + a.stats.totalRevenue, 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-rose-gold" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-semibold">
                        {affiliates.reduce((sum, a) => sum + a.stats.totalOrders, 0)}
                      </p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search affiliates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="terminated">Terminated</option>
              </select>

              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Affiliate
              </Button>
            </div>

            {/* Affiliates Table */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{affiliate.name}</div>
                            {affiliate.company && (
                              <div className="text-sm text-gray-500">{affiliate.company}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a href={`mailto:${affiliate.email}`} className="text-rose-gold hover:underline">
                            {affiliate.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          {affiliate.discountCode ? (
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {affiliate.discountCode}
                            </code>
                          ) : (
                            <span className="text-gray-400">No code</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {affiliate.commissionType === 'percentage' 
                            ? `${affiliate.commissionValue}%`
                            : formatCurrency(affiliate.commissionValue)}
                        </TableCell>
                        <TableCell>{affiliate.stats.totalOrders}</TableCell>
                        <TableCell>{formatCurrency(affiliate.stats.totalRevenue)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              affiliate.status === 'active' ? 'success' :
                              affiliate.status === 'pending' ? 'default' :
                              affiliate.status === 'suspended' ? 'error' :
                              'default'
                            }
                          >
                            {affiliate.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {affiliate.status === 'pending' && (
                              <Button
                                size="small"
                                variant="primary"
                                onClick={() => handleApproveAffiliate(affiliate.id)}
                              >
                                Approve
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => {
                                setSelectedAffiliate(affiliate)
                                setEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="small"
                              variant="secondary"
                              className="text-red-600"
                              onClick={() => {
                                setAffiliateToDelete(affiliate)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Affiliate Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Affiliate</DialogTitle>
            </DialogHeader>
            {selectedAffiliate && (
              <AffiliateEditForm
                affiliate={selectedAffiliate}
                discountCodes={discountCodes}
                onSave={handleUpdateAffiliate}
                onCancel={() => setEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Create Affiliate Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Affiliate</DialogTitle>
            </DialogHeader>
            <AffiliateCreateForm
              discountCodes={discountCodes}
              onSave={handleCreateAffiliate}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the affiliate
                "{affiliateToDelete?.name}" and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => affiliateToDelete && handleDeleteAffiliate(affiliateToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  )
}

// Affiliate Edit Form Component
function AffiliateEditForm({
  affiliate,
  discountCodes,
  onSave,
  onCancel
}: {
  affiliate: Affiliate
  discountCodes: DiscountCode[]
  onSave: (affiliateId: string, updates: Partial<Affiliate>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(affiliate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(affiliate.id, formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div>
              <Label>Social Media</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Instagram"
                  value={formData.socialMedia?.instagram || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                  })}
                />
                <Input
                  placeholder="YouTube"
                  value={formData.socialMedia?.youtube || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialMedia: { ...formData.socialMedia, youtube: e.target.value }
                  })}
                />
                <Input
                  placeholder="TikTok"
                  value={formData.socialMedia?.tiktok || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialMedia: { ...formData.socialMedia, tiktok: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commission" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="discountCodeId">Linked Discount Code</Label>
              <select
                id="discountCodeId"
                value={formData.discountCodeId}
                onChange={(e) => {
                  const code = discountCodes.find(c => c.id === e.target.value)
                  setFormData({ 
                    ...formData, 
                    discountCodeId: e.target.value,
                    discountCode: code?.code
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
              >
                <option value="">Select a discount code</option>
                {discountCodes.map(code => (
                  <option key={code.id} value={code.id}>
                    {code.code} - {code.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commissionType">Commission Type</Label>
                <select
                  id="commissionType"
                  value={formData.commissionType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    commissionType: e.target.value as 'percentage' | 'fixed' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <Label htmlFor="commissionValue">
                  Commission Value {formData.commissionType === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  id="commissionValue"
                  type="number"
                  value={formData.commissionValue}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    commissionValue: parseFloat(e.target.value) 
                  })}
                  required
                  min="0"
                  max={formData.commissionType === 'percentage' ? '100' : undefined}
                  step={formData.commissionType === 'percentage' ? '1' : '0.01'}
                />
              </div>
            </div>

            <div>
              <Label>Tiered Commission (Optional)</Label>
              {(formData.tieredCommission || []).map((tier, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    placeholder="Min Orders"
                    value={tier.minOrders}
                    onChange={(e) => {
                      const newTiers = [...(formData.tieredCommission || [])]
                      newTiers[index] = { ...tier, minOrders: parseInt(e.target.value) }
                      setFormData({ ...formData, tieredCommission: newTiers })
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Commission Value"
                    value={tier.commissionValue}
                    onChange={(e) => {
                      const newTiers = [...(formData.tieredCommission || [])]
                      newTiers[index] = { ...tier, commissionValue: parseFloat(e.target.value) }
                      setFormData({ ...formData, tieredCommission: newTiers })
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      const newTiers = formData.tieredCommission?.filter((_, i) => i !== index)
                      setFormData({ ...formData, tieredCommission: newTiers })
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="small"
                className="mt-2"
                onClick={() => {
                  const newTiers = [...(formData.tieredCommission || []), { minOrders: 0, commissionValue: 0 }]
                  setFormData({ ...formData, tieredCommission: newTiers })
                }}
              >
                Add Tier
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                value={formData.paymentInfo?.method || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  paymentInfo: { 
                    ...formData.paymentInfo, 
                    method: e.target.value as any 
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
              >
                <option value="">Select payment method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.paymentInfo?.method === 'bank_transfer' && (
              <>
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={formData.paymentInfo?.bankDetails?.accountName || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      paymentInfo: { 
                        ...formData.paymentInfo, 
                        method: 'bank_transfer',
                        bankDetails: { 
                          accountName: e.target.value,
                          accountNumber: formData.paymentInfo?.bankDetails?.accountNumber || '',
                          sortCode: formData.paymentInfo?.bankDetails?.sortCode,
                          iban: formData.paymentInfo?.bankDetails?.iban,
                          swift: formData.paymentInfo?.bankDetails?.swift
                        }
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.paymentInfo?.bankDetails?.accountNumber || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      paymentInfo: { 
                        ...formData.paymentInfo, 
                        method: 'bank_transfer',
                        bankDetails: { 
                          accountName: formData.paymentInfo?.bankDetails?.accountName || '',
                          accountNumber: e.target.value,
                          sortCode: formData.paymentInfo?.bankDetails?.sortCode,
                          iban: formData.paymentInfo?.bankDetails?.iban,
                          swift: formData.paymentInfo?.bankDetails?.swift
                        }
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="sortCode">Sort Code / Routing Number</Label>
                  <Input
                    id="sortCode"
                    value={formData.paymentInfo?.bankDetails?.sortCode || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      paymentInfo: { 
                        ...formData.paymentInfo, 
                        method: 'bank_transfer',
                        bankDetails: { 
                          accountName: formData.paymentInfo?.bankDetails?.accountName || '',
                          accountNumber: formData.paymentInfo?.bankDetails?.accountNumber || '',
                          sortCode: e.target.value,
                          iban: formData.paymentInfo?.bankDetails?.iban,
                          swift: formData.paymentInfo?.bankDetails?.swift
                        }
                      }
                    })}
                  />
                </div>
              </>
            )}

            {formData.paymentInfo?.method === 'paypal' && (
              <div>
                <Label htmlFor="paypalEmail">PayPal Email</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={formData.paymentInfo?.paypalEmail || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    paymentInfo: { 
                      ...formData.paymentInfo, 
                      method: 'paypal',
                      paypalEmail: e.target.value 
                    }
                  })}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-xl font-semibold">{formData.stats.totalClicks}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Unique Visitors</p>
                <p className="text-xl font-semibold">{formData.stats.uniqueVisitors}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-semibold">{formData.stats.totalOrders}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-xl font-semibold">
                  {formData.stats.conversionRate.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(formData.stats.totalRevenue)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total Commission</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(formData.stats.totalCommission)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Pending Commission</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(formData.stats.pendingCommission)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Paid Commission</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(formData.stats.paidCommission)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  status: e.target.value as Affiliate['status'] 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            {formData.status === 'suspended' && (
              <div>
                <Label htmlFor="suspendedReason">Suspension Reason</Label>
                <Textarea
                  id="suspendedReason"
                  value={formData.suspendedReason || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    suspendedReason: e.target.value 
                  })}
                  rows={3}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="Internal notes about this affiliate..."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 px-6 pb-6 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}

// Affiliate Create Form Component
function AffiliateCreateForm({
  discountCodes,
  onSave,
  onCancel
}: {
  discountCodes: DiscountCode[]
  onSave: (newAffiliate: Partial<Affiliate>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<Affiliate>>({
    name: '',
    email: '',
    status: 'pending',
    commissionType: 'percentage',
    commissionValue: 10,
    stats: {
      totalClicks: 0,
      uniqueVisitors: 0,
      totalOrders: 0,
      conversionRate: 0,
      totalRevenue: 0,
      totalCommission: 0,
      pendingCommission: 0,
      paidCommission: 0
    }
  })
  const [createNewCode, setCreateNewCode] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="px-6 py-6 space-y-6">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company || ''}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website || ''}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>

        <div>
          <Label>Discount Code</Label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                checked={createNewCode}
                onChange={() => setCreateNewCode(true)}
                className="mr-2"
              />
              Create new discount code
            </label>
            {createNewCode && (
              <Input
                placeholder="AFFILIATE2024"
                value={formData.discountCode || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  discountCode: e.target.value.toUpperCase() 
                })}
                required={createNewCode}
              />
            )}
            
            <label className="flex items-center">
              <input
                type="radio"
                checked={!createNewCode}
                onChange={() => setCreateNewCode(false)}
                className="mr-2"
              />
              Use existing discount code
            </label>
            {!createNewCode && (
              <select
                value={formData.discountCodeId || ''}
                onChange={(e) => {
                  const code = discountCodes.find(c => c.id === e.target.value)
                  setFormData({ 
                    ...formData, 
                    discountCodeId: e.target.value,
                    discountCode: code?.code
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                required={!createNewCode}
              >
                <option value="">Select a discount code</option>
                {discountCodes.map(code => (
                  <option key={code.id} value={code.id}>
                    {code.code} - {code.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="commissionType">Commission Type</Label>
            <select
              id="commissionType"
              value={formData.commissionType}
              onChange={(e) => setFormData({ 
                ...formData, 
                commissionType: e.target.value as 'percentage' | 'fixed' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <Label htmlFor="commissionValue">
              Commission Value {formData.commissionType === 'percentage' ? '(%)' : '($)'}
            </Label>
            <Input
              id="commissionValue"
              type="number"
              value={formData.commissionValue}
              onChange={(e) => setFormData({ 
                ...formData, 
                commissionValue: parseFloat(e.target.value) 
              })}
              required
              min="0"
              max={formData.commissionType === 'percentage' ? '100' : undefined}
              step={formData.commissionType === 'percentage' ? '1' : '0.01'}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="status">Initial Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ 
              ...formData, 
              status: e.target.value as Affiliate['status'] 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
          >
            <option value="pending">Pending (Requires Approval)</option>
            <option value="active">Active (Approved)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4 px-6 pb-6 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Affiliate</Button>
      </div>
    </form>
  )
}