import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/Badge'
import { Textarea } from '../../components/ui/Textarea'
import { Label } from '../../components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import toast from 'react-hot-toast'
import { Search, Plus, Edit, Trash2, Copy, Calendar, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'
import { discountService } from '../../services'
import type { DiscountCode } from '../../types/discount'
import { formatCurrency } from '../../utils/currency'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

export default function AdminDiscounts() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [filteredDiscounts, setFilteredDiscounts] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [discountToDelete, setDiscountToDelete] = useState<DiscountCode | null>(null)
  
  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<DiscountCode>>({
    code: '',
    name: '',
    description: '',
    type: 'general',
    discountType: 'percentage',
    discountValue: 10,
    active: true,
    validFrom: new Date(),
    conditions: {}
  })

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    fetchDiscounts()
  }, [user, navigate])

  const fetchDiscounts = async () => {
    setLoading(true)
    try {
      const allDiscounts = await discountService.getAllDiscountCodes()
      setDiscounts(allDiscounts)
      applyFilters(allDiscounts, selectedType, searchTerm)
    } catch (error) {
      console.error('Error fetching discounts:', error)
      toast.error('Failed to fetch discount codes')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (discountList: DiscountCode[], typeFilter: string, searchFilter: string) => {
    let filtered = discountList

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(discount => discount.type === typeFilter)
    }

    // Apply search filter
    if (searchFilter) {
      filtered = filtered.filter(discount =>
        discount.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
        discount.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        discount.description?.toLowerCase().includes(searchFilter.toLowerCase())
      )
    }

    setFilteredDiscounts(filtered)
  }

  useEffect(() => {
    applyFilters(discounts, selectedType, searchTerm)
  }, [discounts, selectedType, searchTerm])

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const discountData: any = {
        code: (formData.code || '').toUpperCase(),
        name: formData.name || '',
        description: formData.description || '',
        type: formData.type || 'general',
        discountType: formData.discountType || 'percentage',
        discountValue: formData.discountValue || 0,
        validFrom: formData.validFrom || new Date(),
        active: formData.active !== undefined ? formData.active : true,
        createdBy: user?.id || ''
      }
      
      // Only add optional fields if they have values
      if (formData.maxUses) discountData.maxUses = formData.maxUses
      if (formData.maxUsesPerCustomer) discountData.maxUsesPerCustomer = formData.maxUsesPerCustomer
      if (formData.validUntil) discountData.validUntil = formData.validUntil
      if (formData.conditions) discountData.conditions = formData.conditions
      
      await discountService.createDiscountCode(discountData)
      toast.success('Discount code created successfully')
      resetForm()
      setViewMode('list')
      fetchDiscounts()
    } catch (error) {
      console.error('Error creating discount:', error)
      toast.error('Failed to create discount code')
    }
  }

  const handleUpdateDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDiscount) return
    
    try {
      await discountService.updateDiscountCode(selectedDiscount.id, formData)
      toast.success('Discount code updated successfully')
      resetForm()
      setViewMode('list')
      setSelectedDiscount(null)
      fetchDiscounts()
    } catch (error) {
      console.error('Error updating discount:', error)
      toast.error('Failed to update discount code')
    }
  }

  const handleDeleteDiscount = async (discountId: string) => {
    try {
      await discountService.deleteDiscountCode(discountId)
      toast.success('Discount code deleted successfully')
      setDeleteDialogOpen(false)
      setDiscountToDelete(null)
      if (viewMode === 'detail' && selectedDiscount?.id === discountId) {
        setViewMode('list')
        setSelectedDiscount(null)
      }
      fetchDiscounts()
    } catch (error) {
      console.error('Error deleting discount:', error)
      toast.error('Failed to delete discount code')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'general',
      discountType: 'percentage',
      discountValue: 10,
      active: true,
      validFrom: new Date(),
      conditions: {}
    })
  }

  const startCreate = () => {
    resetForm()
    setViewMode('create')
  }

  const startEdit = (discount: DiscountCode) => {
    setSelectedDiscount(discount)
    setFormData(discount)
    setViewMode('edit')
  }

  const viewDetail = (discount: DiscountCode) => {
    setSelectedDiscount(discount)
    setViewMode('detail')
  }

  const backToList = () => {
    setViewMode('list')
    setSelectedDiscount(null)
    resetForm()
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied: ${code}`)
  }

  const getUsagePercentage = (discount: DiscountCode) => {
    if (!discount.maxUses) return null
    return Math.round((discount.currentUses / discount.maxUses) * 100)
  }

  const isExpired = (discount: DiscountCode) => {
    if (!discount.validUntil) return false
    return new Date(discount.validUntil) < new Date()
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Discount Code Management</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search discount codes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="affiliate">Affiliate</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="vip">VIP</option>
                  <option value="promotional">Promotional</option>
                <option value="no-moq">No MOQ</option>
                </select>

                <Button onClick={startCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Discount Code
                </Button>
              </div>

              {/* Discounts Table */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold"></div>
                </div>
              ) : (
                <div className="overflow-x-auto min-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDiscounts.map((discount) => (
                        <TableRow 
                          key={discount.id} 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => viewDetail(discount)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                {discount.code}
                              </code>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyCode(discount.code)
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{discount.name}</TableCell>
                          <TableCell>
                            <Badge variant="default">{discount.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {discount.discountType === 'percentage' 
                              ? `${discount.discountValue}%`
                              : formatCurrency(discount.discountValue)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">
                                {discount.currentUses} / {discount.maxUses || '∞'}
                              </span>
                              {discount.maxUses && (
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-rose-gold h-2 rounded-full"
                                    style={{ width: `${getUsagePercentage(discount)}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {!discount.active ? (
                              <Badge variant="default">Inactive</Badge>
                            ) : isExpired(discount) ? (
                              <Badge variant="default">Expired</Badge>
                            ) : (
                              <Badge variant="success">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {discount.validUntil ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-sm">
                                  {formatDate(discount.validUntil)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">No expiry</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEdit(discount)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="small"
                                variant="secondary"
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDiscountToDelete(discount)
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

                  {filteredDiscounts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No discount codes found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the discount code
                  "{discountToDelete?.code}" and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => discountToDelete && handleDeleteDiscount(discountToDelete.id)}
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

  // DETAIL VIEW
  if (viewMode === 'detail' && selectedDiscount) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Discount Code Details</CardTitle>
                  <p className="text-gray-600 mt-1">View discount code information and statistics</p>
                </div>
                <Button onClick={backToList} variant="secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Discount Codes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardContent>
                    <h3 className="font-medium mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Code:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-3 py-1 rounded font-mono">
                            {selectedDiscount.code}
                          </code>
                          <button
                            onClick={() => copyCode(selectedDiscount.code)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedDiscount.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="default">{selectedDiscount.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        {!selectedDiscount.active ? (
                          <Badge variant="default">Inactive</Badge>
                        ) : isExpired(selectedDiscount) ? (
                          <Badge variant="default">Expired</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </div>
                      {selectedDiscount.description && (
                        <div>
                          <span className="text-gray-600">Description:</span>
                          <p className="mt-1 text-sm">{selectedDiscount.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Discount Details */}
                <Card>
                  <CardContent>
                    <h3 className="font-medium mb-4">Discount Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount Type:</span>
                        <span className="capitalize">{selectedDiscount.discountType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount Value:</span>
                        <span className="font-medium text-green-600">
                          {selectedDiscount.discountType === 'percentage' 
                            ? `${selectedDiscount.discountValue}%`
                            : formatCurrency(selectedDiscount.discountValue)}
                        </span>
                      </div>
                      {selectedDiscount.conditions?.minOrderValue && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Order:</span>
                          <span>{formatCurrency(selectedDiscount.conditions.minOrderValue)}</span>
                        </div>
                      )}
                      {selectedDiscount.conditions?.newCustomersOnly && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Eligibility:</span>
                          <Badge variant="default">New Customers Only</Badge>
                        </div>
                      )}
                      {selectedDiscount.removesMOQ && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Special Feature:</span>
                          <Badge variant="success">Removes MOQ Requirements</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Validity & Usage */}
                <Card>
                  <CardContent>
                    <h3 className="font-medium mb-4">Validity & Usage</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid From:</span>
                        <span>{formatDateTime(selectedDiscount.validFrom)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid Until:</span>
                        <span>
                          {selectedDiscount.validUntil 
                            ? formatDateTime(selectedDiscount.validUntil)
                            : 'No expiry'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Uses:</span>
                        <span>{selectedDiscount.maxUses || 'Unlimited'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Uses Per Customer:</span>
                        <span>{selectedDiscount.maxUsesPerCustomer || 'Unlimited'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Statistics */}
                <Card>
                  <CardContent>
                    <h3 className="font-medium mb-4">Usage Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Times Used:</span>
                        <span className="font-medium">{selectedDiscount.currentUses}</span>
                      </div>
                      {selectedDiscount.maxUses && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Usage Rate:</span>
                            <span>{getUsagePercentage(selectedDiscount)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-rose-gold h-2 rounded-full"
                              style={{ width: `${getUsagePercentage(selectedDiscount)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(selectedDiscount.totalRevenue || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Savings:</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(selectedDiscount.totalSavings || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <Card className="mt-6">
                <CardContent>
                  <h3 className="font-medium mb-4">Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => startEdit(selectedDiscount)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Discount Code
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => copyCode(selectedDiscount.code)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button
                      variant="secondary"
                      className="text-red-600"
                      onClick={() => {
                        setDiscountToDelete(selectedDiscount)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the discount code
                  "{discountToDelete?.code}" and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => discountToDelete && handleDeleteDiscount(discountToDelete.id)}
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

  // CREATE FORM VIEW
  if (viewMode === 'create') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Create New Discount Code</CardTitle>
                  <p className="text-gray-600 mt-1">Set up a new discount code for your customers</p>
                </div>
                <Button onClick={backToList} variant="secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Discount Codes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDiscount} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="code">Discount Code *</Label>
                      <Input
                        id="code"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        placeholder="SUMMER2024"
                      />
                    </div>

                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Summer Sale 2024"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Special summer discount for all customers"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountCode['type'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                      >
                        <option value="general">General</option>
                        <option value="affiliate">Affiliate</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="vip">VIP</option>
                        <option value="promotional">Promotional</option>
                        <option value="no-moq">No MOQ (Remove MOQ Requirements)</option>
                      </select>
                    </div>
                  </div>

                  {/* Discount Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Discount Settings</h3>

                    <div>
                      <Label htmlFor="discountType">Discount Type</Label>
                      <select
                        id="discountType"
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="discountValue">
                        Discount Value {formData.discountType === 'percentage' ? '(%)' : '($)'} *
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                        required
                        min="0"
                        max={formData.discountType === 'percentage' ? '100' : undefined}
                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="minOrderValue">Minimum Order Value ($)</Label>
                      <Input
                        id="minOrderValue"
                        type="number"
                        value={formData.conditions?.minOrderValue || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          conditions: {
                            ...formData.conditions,
                            minOrderValue: e.target.value ? parseFloat(e.target.value) : undefined
                          }
                        })}
                        placeholder="No minimum"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          className="mr-2"
                        />
                        Active (Code can be used immediately)
                      </Label>

                      {formData.type === 'no-moq' && (
                        <Label>
                          <input
                            type="checkbox"
                            checked={formData.removesMOQ || false}
                            onChange={(e) => setFormData({ ...formData, removesMOQ: e.target.checked })}
                            className="mr-2"
                          />
                          Remove MOQ Requirements (Allows B2B orders below minimum quantity)
                        </Label>
                      )}

                      <Label>
                        <input
                          type="checkbox"
                          checked={formData.conditions?.newCustomersOnly || false}
                          onChange={(e) => setFormData({
                            ...formData,
                            conditions: {
                              ...formData.conditions,
                              newCustomersOnly: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        New Customers Only
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Validity & Usage Limits */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Validity & Usage Limits</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="validFrom">Valid From *</Label>
                      <Input
                        id="validFrom"
                        type="datetime-local"
                        value={formData.validFrom ? new Date(formData.validFrom).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setFormData({ ...formData, validFrom: new Date(e.target.value) })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                      <Input
                        id="validUntil"
                        type="datetime-local"
                        value={formData.validUntil ? new Date(formData.validUntil).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          validUntil: e.target.value ? new Date(e.target.value) : undefined 
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxUses">Max Total Uses</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        value={formData.maxUses || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          maxUses: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder="Unlimited"
                        min="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxUsesPerCustomer">Max Uses Per Customer</Label>
                      <Input
                        id="maxUsesPerCustomer"
                        type="number"
                        value={formData.maxUsesPerCustomer || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          maxUsesPerCustomer: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder="Unlimited"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={backToList}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Discount Code
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  // EDIT FORM VIEW
  if (viewMode === 'edit' && selectedDiscount) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Edit Discount Code</CardTitle>
                  <p className="text-gray-600 mt-1">Update discount code: {selectedDiscount.code}</p>
                </div>
                <Button onClick={backToList} variant="secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Discount Codes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateDiscount} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="code">Discount Code *</Label>
                      <Input
                        id="code"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        placeholder="SUMMER2024"
                      />
                    </div>

                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Summer Sale 2024"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Special summer discount for all customers"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Type</Label>
                      <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountCode['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                      >
                      <option value="general">General</option>
                      <option value="affiliate">Affiliate</option>
                      <option value="seasonal">Seasonal</option>
                      <option value="vip">VIP</option>
                      <option value="promotional">Promotional</option>
                        <option value="no-moq">No MOQ (Remove MOQ Requirements)</option>
                        </select>
                    </div>
                  </div>

                  {/* Discount Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Discount Settings</h3>

                    <div>
                      <Label htmlFor="discountType">Discount Type</Label>
                      <select
                        id="discountType"
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="discountValue">
                        Discount Value {formData.discountType === 'percentage' ? '(%)' : '($)'} *
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                        required
                        min="0"
                        max={formData.discountType === 'percentage' ? '100' : undefined}
                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="minOrderValue">Minimum Order Value ($)</Label>
                      <Input
                        id="minOrderValue"
                        type="number"
                        value={formData.conditions?.minOrderValue || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          conditions: {
                            ...formData.conditions,
                            minOrderValue: e.target.value ? parseFloat(e.target.value) : undefined
                          }
                        })}
                        placeholder="No minimum"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          className="mr-2"
                        />
                        Active (Code can be used immediately)
                      </Label>

                      {formData.type === 'no-moq' && (
                        <Label>
                          <input
                            type="checkbox"
                            checked={formData.removesMOQ || false}
                            onChange={(e) => setFormData({ ...formData, removesMOQ: e.target.checked })}
                            className="mr-2"
                          />
                          Remove MOQ Requirements (Allows B2B orders below minimum quantity)
                        </Label>
                      )}

                      <Label>
                        <input
                          type="checkbox"
                          checked={formData.conditions?.newCustomersOnly || false}
                          onChange={(e) => setFormData({
                            ...formData,
                            conditions: {
                              ...formData.conditions,
                              newCustomersOnly: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        New Customers Only
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Validity & Usage Limits */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Validity & Usage Limits</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="validFrom">Valid From *</Label>
                      <Input
                        id="validFrom"
                        type="datetime-local"
                        value={formData.validFrom ? new Date(formData.validFrom).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setFormData({ ...formData, validFrom: new Date(e.target.value) })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                      <Input
                        id="validUntil"
                        type="datetime-local"
                        value={formData.validUntil ? new Date(formData.validUntil).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          validUntil: e.target.value ? new Date(e.target.value) : undefined 
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxUses">Max Total Uses</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        value={formData.maxUses || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          maxUses: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder="Unlimited"
                        min="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxUsesPerCustomer">Max Uses Per Customer</Label>
                      <Input
                        id="maxUsesPerCustomer"
                        type="number"
                        value={formData.maxUsesPerCustomer || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          maxUsesPerCustomer: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder="Unlimited"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Current Usage Stats (Read-only) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-3">Current Usage Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Times Used:</span>
                      <p className="font-medium">{selectedDiscount.currentUses}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Revenue:</span>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedDiscount.totalRevenue || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Savings:</span>
                      <p className="font-medium text-blue-600">
                        {formatCurrency(selectedDiscount.totalSavings || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={backToList}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  // Fallback
  return null
}