import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { firebaseAffiliateService } from '../../services/firebase/affiliate.service'
import { AffiliateCode } from '../../types/affiliate'
import { formatCurrency } from '../../utils/format'
import { toast } from 'react-hot-toast'

// Icon components
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const Edit2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Copy = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

export const AffiliateCodeManager: React.FC = () => {
  const [affiliateCodes, setAffiliateCodes] = useState<AffiliateCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCode, setEditingCode] = useState<AffiliateCode | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    commissionType: 'percentage' as 'percentage' | 'fixed',
    commissionValue: 10,
    discountType: 'percentage' as 'percentage' | 'fixed' | 'none',
    discountValue: 0,
    maxUses: undefined as number | undefined,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    active: true
  })
  
  useEffect(() => {
    loadAffiliateCodes()
  }, [])
  
  const loadAffiliateCodes = async () => {
    try {
      setLoading(true)
      const codes = await firebaseAffiliateService.getAllAffiliateCodes()
      setAffiliateCodes(codes)
    } catch (error) {
      console.error('Error loading affiliate codes:', error)
      toast.error('Failed to load affiliate codes')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const data: any = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        commissionType: formData.commissionType,
        commissionValue: formData.commissionValue,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        validFrom: new Date(formData.validFrom),
        active: formData.active,
        createdBy: 'admin' // In real app, get from auth
      }
      
      // Only add optional fields if they have values
      if (formData.description) {
        data.description = formData.description
      }
      if (formData.maxUses) {
        data.maxUses = formData.maxUses
      }
      if (formData.validUntil) {
        data.validUntil = new Date(formData.validUntil)
      }
      
      if (editingCode) {
        await firebaseAffiliateService.updateAffiliateCode(editingCode.id, data)
        toast.success('Affiliate code updated')
      } else {
        await firebaseAffiliateService.createAffiliateCode(data)
        toast.success('Affiliate code created')
      }
      
      // Reset form
      setFormData({
        code: '',
        name: '',
        description: '',
        commissionType: 'percentage',
        commissionValue: 10,
        discountType: 'percentage',
        discountValue: 0,
        maxUses: undefined,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        active: true
      })
      setShowCreateForm(false)
      setEditingCode(null)
      
      // Reload codes
      loadAffiliateCodes()
    } catch (error: any) {
      console.error('Error saving affiliate code:', error)
      toast.error(error.message || 'Failed to save affiliate code')
    }
  }
  
  const handleEdit = (code: AffiliateCode) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      name: code.name,
      description: code.description || '',
      commissionType: code.commissionType,
      commissionValue: code.commissionValue,
      discountType: code.discountType,
      discountValue: code.discountValue,
      maxUses: code.maxUses,
      validFrom: new Date(code.validFrom).toISOString().split('T')[0],
      validUntil: code.validUntil ? new Date(code.validUntil).toISOString().split('T')[0] : '',
      active: code.active
    })
    setShowCreateForm(true)
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this affiliate code?')) return
    
    try {
      await firebaseAffiliateService.deleteAffiliateCode(id)
      toast.success('Affiliate code deleted')
      loadAffiliateCodes()
    } catch (error) {
      console.error('Error deleting affiliate code:', error)
      toast.error('Failed to delete affiliate code')
    }
  }
  
  const copyAffiliateUrl = (code: string) => {
    const url = `${window.location.origin}?utm_affiliate=${code}`
    navigator.clipboard.writeText(url)
    toast.success('Affiliate URL copied to clipboard')
  }
  
  if (loading) {
    return <div className="p-8">Loading affiliate codes...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Affiliate Codes</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? 'secondary' : 'primary'}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? 'Cancel' : 'Create Code'}
        </Button>
      </div>
      
      {showCreateForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              {editingCode ? 'Edit Affiliate Code' : 'Create New Affiliate Code'}
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SUMMER2024"
                    required
                    disabled={!!editingCode}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Summer Campaign"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Commission</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.commissionType}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as any })}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">£</option>
                    </select>
                    <Input
                      type="number"
                      value={formData.commissionValue}
                      onChange={(e) => setFormData({ ...formData, commissionValue: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Discount</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="none">None</option>
                      <option value="percentage">%</option>
                      <option value="fixed">£</option>
                    </select>
                    <Input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      disabled={formData.discountType === 'none'}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Max Uses</label>
                  <Input
                    type="number"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Valid From</label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Valid Until</label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    min={formData.validFrom}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Active
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  {editingCode ? 'Update' : 'Create'} Code
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingCode(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4">
        {affiliateCodes.map((code) => (
          <Card key={code.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{code.code}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      code.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {code.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{code.name}</p>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Commission:</span>
                      <p className="font-medium">
                        {code.commissionType === 'percentage' ? `${code.commissionValue}%` : formatCurrency(code.commissionValue)}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Discount:</span>
                      <p className="font-medium">
                        {code.discountType === 'none' ? 'None' :
                         code.discountType === 'percentage' ? `${code.discountValue}%` : formatCurrency(code.discountValue)}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Uses:</span>
                      <p className="font-medium">
                        {code.currentUses} / {code.maxUses || '∞'}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <p className="font-medium">{formatCurrency(code.totalRevenue)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => copyAffiliateUrl(code.code)}
                    title="Copy affiliate URL"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleEdit(code)}
                    title="Edit code"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleDelete(code.id)}
                    title="Delete code"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {affiliateCodes.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No affiliate codes created yet</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}