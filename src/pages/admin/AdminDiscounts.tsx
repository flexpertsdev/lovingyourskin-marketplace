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
import { Search, Plus, Edit, Trash2, Copy, Calendar } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'
import { discountService } from '../../services'
import type { DiscountCode } from '../../types/discount'
import { formatCurrency } from '../../utils/currency'

export default function AdminDiscounts() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [discountToDelete, setDiscountToDelete] = useState<DiscountCode | null>(null)

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
      
      // Apply type filter
      const filtered = selectedType === 'all' 
        ? allDiscounts 
        : allDiscounts.filter(discount => discount.type === selectedType)
      
      // Apply search filter
      const searchFiltered = searchTerm
        ? filtered.filter(discount => 
            discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            discount.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : filtered

      setDiscounts(searchFiltered)
    } catch (error) {
      console.error('Error fetching discounts:', error)
      toast.error('Failed to fetch discount codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscounts()
  }, [selectedType, searchTerm])

  const handleUpdateDiscount = async (discountId: string, updates: Partial<DiscountCode>) => {
    try {
      await discountService.updateDiscountCode(discountId, updates)
      toast.success('Discount code updated successfully')
      fetchDiscounts()
      setEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating discount:', error)
      toast.error('Failed to update discount code')
    }
  }

  const handleCreateDiscount = async (newDiscount: Partial<DiscountCode>) => {
    try {
      await discountService.createDiscountCode({
        code: newDiscount.code || '',
        name: newDiscount.name || '',
        description: newDiscount.description || '',
        type: newDiscount.type || 'general',
        discountType: newDiscount.discountType || 'percentage',
        discountValue: newDiscount.discountValue || 0,
        maxUses: newDiscount.maxUses,
        maxUsesPerCustomer: newDiscount.maxUsesPerCustomer,
        validFrom: newDiscount.validFrom || new Date(),
        validUntil: newDiscount.validUntil,
        active: newDiscount.active !== undefined ? newDiscount.active : true,
        conditions: newDiscount.conditions,
        createdBy: user?.id || ''
      })
      toast.success('Discount code created successfully')
      fetchDiscounts()
      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating discount:', error)
      toast.error('Failed to create discount code')
    }
  }

  const handleDeleteDiscount = async (discountId: string) => {
    try {
      await discountService.deleteDiscountCode(discountId)
      toast.success('Discount code deleted successfully')
      fetchDiscounts()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting discount:', error)
      toast.error('Failed to delete discount code')
    }
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
              </select>

              <Button onClick={() => setCreateDialogOpen(true)}>
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
              <div className="overflow-x-auto">
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
                    {discounts.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {discount.code}
                            </code>
                            <button
                              onClick={() => copyCode(discount.code)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>{discount.name}</TableCell>
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
                            <Badge variant="error">Expired</Badge>
                          ) : (
                            <Badge variant="success">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {discount.validUntil ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm">
                                {new Date(discount.validUntil).toLocaleDateString()}
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
                              onClick={() => {
                                setSelectedDiscount(discount)
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Discount Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Discount Code</DialogTitle>
            </DialogHeader>
            {selectedDiscount && (
              <DiscountEditForm
                discount={selectedDiscount}
                onSave={handleUpdateDiscount}
                onCancel={() => setEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Create Discount Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Discount Code</DialogTitle>
            </DialogHeader>
            <DiscountCreateForm
              onSave={handleCreateDiscount}
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

// Discount Edit Form Component
function DiscountEditForm({
  discount,
  onSave,
  onCancel
}: {
  discount: DiscountCode
  onSave: (discountId: string, updates: Partial<DiscountCode>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(discount)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(discount.id, formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="discount">Discount</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="validity">Validity</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Discount Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                placeholder="SUMMER2024"
              />
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
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
              </select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discount" className="mt-6">
          <div className="space-y-4">
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
                Discount Value {formData.discountType === 'percentage' ? '(%)' : '($)'}
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
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="mt-6">
          <div className="space-y-4">
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
                placeholder="100"
                min="0"
                step="0.01"
              />
            </div>

            <div>
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

            <div>
              <Label>
                <input
                  type="checkbox"
                  checked={formData.conditions?.requiresAccount || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      requiresAccount: e.target.checked
                    }
                  })}
                  className="mr-2"
                />
                Requires Account (User must be logged in)
              </Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="validity" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-2"
                />
                Active
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Valid From</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxUses">Max Total Uses (Leave empty for unlimited)</Label>
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

            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong>Current Usage:</strong> {formData.currentUses} times
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total Revenue:</strong> {formatCurrency(formData.totalRevenue)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total Savings:</strong> {formatCurrency(formData.totalSavings)}
              </p>
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

// Discount Create Form Component
function DiscountCreateForm({
  onSave,
  onCancel
}: {
  onSave: (newDiscount: Partial<DiscountCode>) => void
  onCancel: () => void
}) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="px-6 py-6 space-y-6">
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

        <div className="grid grid-cols-2 gap-4">
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
            </select>
          </div>

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

        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="minOrderValue">Min Order Value ($)</Label>
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

      <div className="flex justify-end gap-4 px-6 pb-6 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Discount Code</Button>
      </div>
    </form>
  )
}