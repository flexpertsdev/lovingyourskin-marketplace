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
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'
import { brandService } from '../../services'
import type { Brand } from '../../types'
import { ImageUploadManager } from '../../components/admin/ImageUploadManager'

// Extended Brand type for admin management - no longer needed as fields are now in main Brand type
type AdminBrand = Brand

export default function AdminBrands() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [brands, setBrands] = useState<AdminBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState<AdminBrand | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<AdminBrand | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    fetchBrands()
  }, [user, navigate])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      // Fetch brands from Firestore
      const allBrands = await brandService.getBrands()
      
      // Add default status to brands
      const brandsWithStatus: AdminBrand[] = allBrands.map(brand => ({
        ...brand,
        status: (brand.active ? 'active' : 'inactive') as AdminBrand['status']
      }))
      
      // Apply status filter
      const filtered = selectedStatus === 'all' 
        ? brandsWithStatus 
        : brandsWithStatus.filter(brand => brand.status === selectedStatus)
      
      // Apply search filter
      const searchFiltered = searchTerm
        ? filtered.filter(brand => {
            const name = typeof brand.name === 'string' ? brand.name : brand.name
            return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
          })
        : filtered

      setBrands(searchFiltered)
    } catch (error) {
      console.error('Error fetching brands:', error)
      toast.error('Failed to fetch brands')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [selectedStatus, searchTerm])

  const getBrandName = (brand: AdminBrand) => {
    return brand.name
  }

  const handleUpdateBrand = async (brandId: string, updates: Partial<AdminBrand>) => {
    try {
      // All fields are now part of Brand type, so we can send everything
      await brandService.update(brandId, updates)
      toast.success('Brand updated successfully')
      fetchBrands()
      setEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating brand:', error)
      toast.error('Failed to update brand')
    }
  }

  const handleCreateBrand = async (newBrand: Partial<AdminBrand>) => {
    try {
      // Provide required Brand fields with defaults
      const brandToCreate: Omit<Brand, 'id'> = {
        name: newBrand.name || '',
        slug: newBrand.slug || newBrand.name?.toLowerCase().replace(/\s+/g, '-') || '',
        tagline: newBrand.tagline || '',
        description: newBrand.description || '',
        story: newBrand.story || '',
        logo: newBrand.logo || '',
        heroImage: newBrand.heroImage || '',
        establishedYear: newBrand.establishedYear || new Date().getFullYear(),
        productCount: newBrand.productCount || 0,
        minimumOrder: newBrand.minimumOrder || 100,
        country: newBrand.country || 'KR',
        certifications: newBrand.certifications || [],
        featureTags: newBrand.featureTags || [],
        technologies: newBrand.technologies || [],
        categories: newBrand.categories || [],
        stats: newBrand.stats || {
          yearsInBusiness: 0,
          productsSold: '0',
          customerSatisfaction: 0
        },
        active: newBrand.active !== undefined ? newBrand.active : false,
        featured: newBrand.featured || false,
        isExclusivePartner: newBrand.isExclusivePartner || false,
        clinicalResults: newBrand.clinicalResults,
        logoStyle: newBrand.logoStyle,
        contactEmail: newBrand.contactEmail,
        contactPerson: newBrand.contactPerson,
        website: newBrand.website,
        productCategories: newBrand.productCategories,
        status: newBrand.status,
        applicationDate: newBrand.applicationDate,
        approvedDate: newBrand.approvedDate
      }
      
      await brandService.create(brandToCreate)
      toast.success('Brand created successfully')
      fetchBrands()
      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating brand:', error)
      toast.error('Failed to create brand')
    }
  }

  const handleDeleteBrand = async (brandId: string) => {
    try {
      await brandService.delete(brandId)
      toast.success('Brand deleted successfully')
      fetchBrands()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting brand:', error)
      toast.error('Failed to delete brand')
    }
  }

  const handleApproveBrand = async (brandId: string) => {
    try {
      // Update the brand to be active (admin-specific status is handled locally)
      await handleUpdateBrand(brandId, { 
        active: true,
        status: 'active', 
        approvedDate: new Date().toISOString() 
      })
      toast.success('Brand application approved')
    } catch (error) {
      console.error('Error approving brand:', error)
      toast.error('Failed to approve brand')
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Brand Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search brands..."
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
                <option value="active">Active</option>
                <option value="pending">Pending Approval</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </div>

            {/* Brands Table */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Brand Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Exclusive</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={getBrandName(brand)}
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Logo</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getBrandName(brand)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              brand.status === 'active' ? 'success' : 
                              brand.status === 'pending' ? 'default' : 
                              'default'
                            }
                          >
                            {brand.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {brand.isExclusivePartner ? (
                            <Badge variant="default">Exclusive</Badge>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {brand.productCategories?.slice(0, 2).join(', ')}
                            {brand.productCategories && brand.productCategories.length > 2 && '...'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {brand.contactEmail ? (
                            <a 
                              href={`mailto:${brand.contactEmail}`}
                              className="text-rose-gold hover:underline text-sm"
                            >
                              {brand.contactEmail}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {brand.status === 'pending' && (
                              <Button
                                size="small"
                                variant="primary"
                                onClick={() => handleApproveBrand(brand.id)}
                              >
                                Approve
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => {
                                setSelectedBrand(brand)
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
                                setBrandToDelete(brand)
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

        {/* Edit Brand Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Brand</DialogTitle>
            </DialogHeader>
            {selectedBrand && (
              <BrandEditForm
                brand={selectedBrand}
                onSave={handleUpdateBrand}
                onCancel={() => setEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Create Brand Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Brand</DialogTitle>
            </DialogHeader>
            <BrandCreateForm
              onSave={handleCreateBrand}
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
                This action cannot be undone. This will permanently delete the brand
                "{brandToDelete ? getBrandName(brandToDelete) : ''}" and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => brandToDelete && handleDeleteBrand(brandToDelete.id)}
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

// Brand Edit Form Component
function BrandEditForm({
  brand,
  onSave,
  onCancel
}: {
  brand: AdminBrand
  onSave: (brandId: string, updates: Partial<AdminBrand>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(brand)
  const categories = ['cleansers', 'toners', 'serums', 'moisturizers', 'masks', 'sun-care', 'hair-care', 'body-care']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(brand.id, formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <div className="space-y-4">
          <div>
            <Label htmlFor="name">Brand Name (English)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                name: e.target.value
              })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label>Brand Logo</Label>
            <ImageUploadManager
              images={formData.logo ? [formData.logo] : []}
              onChange={(images) => setFormData({ ...formData, logo: images[0] || '' })}
              entityType="brand"
              entityId={brand.id}
              maxImages={1}
              label=""
              helpText="Upload your brand logo. Recommended size: 400x400px"
            />
          </div>

          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Innovative K-Beauty Solutions"
            />
          </div>

          <div>
            <Label htmlFor="story">Brand Story</Label>
            <Textarea
              id="story"
              value={formData.story || ''}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              rows={6}
              placeholder="Tell the story of your brand..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="establishedYear">Established Year</Label>
              <Input
                id="establishedYear"
                type="number"
                value={formData.establishedYear || ''}
                onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) })}
                placeholder="2020"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="KR"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimumOrder">Minimum Order Quantity (units)</Label>
              <Input
                id="minimumOrder"
                type="number"
                value={formData.minimumOrder || ''}
                onChange={(e) => setFormData({ ...formData, minimumOrder: parseInt(e.target.value) })}
                placeholder="100"
              />
            </div>
            <div>
              <Label htmlFor="moa">MOA - Minimum Order Amount (£)</Label>
              <Input
                id="moa"
                type="number"
                value={formData.MOA || ''}
                onChange={(e) => setFormData({ ...formData, MOA: parseFloat(e.target.value) })}
                placeholder="3000"
                title="If order total exceeds this amount, MOQ requirements are waived"
              />
              <p className="text-xs text-gray-500 mt-1">MOQ waived if order exceeds this amount</p>
            </div>
          </div>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="heroImage">Hero Image URL</Label>
              <Input
                id="heroImage"
                value={formData.heroImage || ''}
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                placeholder="https://example.com/hero.jpg"
              />
            </div>

            <div>
              <Label>Logo Style</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="logoHeight">Height</Label>
                  <Input
                    id="logoHeight"
                    value={formData.logoStyle?.height || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      logoStyle: { ...formData.logoStyle, height: e.target.value }
                    })}
                    placeholder="60px"
                  />
                </div>
                <div>
                  <Label htmlFor="logoObjectFit">Object Fit</Label>
                  <select
                    id="logoObjectFit"
                    value={formData.logoStyle?.objectFit || 'contain'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      logoStyle: { ...formData.logoStyle, objectFit: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                  >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                    <option value="scale-down">Scale Down</option>
                  </select>
                </div>
              </div>
              <div className="mt-2">
                <Label htmlFor="logoBackground">Background Color</Label>
                <Input
                  id="logoBackground"
                  value={formData.logoStyle?.backgroundColor || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    logoStyle: { ...formData.logoStyle, backgroundColor: e.target.value }
                  })}
                  placeholder="#ffffff or transparent"
                />
              </div>
            </div>

            <div>
              <Label>Feature Tags</Label>
              <Input
                value={formData.featureTags?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  featureTags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                placeholder="Clean Beauty, Vegan, K-Beauty Innovation"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of tags</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label>Technologies</Label>
              {(formData.technologies || []).map((tech, index) => (
                <div key={index} className="border p-3 rounded mb-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Technology Name"
                      value={tech.name}
                      onChange={(e) => {
                        const newTech = [...(formData.technologies || [])]
                        newTech[index] = { ...tech, name: e.target.value }
                        setFormData({ ...formData, technologies: newTech })
                      }}
                    />
                    <Input
                      placeholder="Patent Number (optional)"
                      value={tech.patent || ''}
                      onChange={(e) => {
                        const newTech = [...(formData.technologies || [])]
                        newTech[index] = { ...tech, patent: e.target.value }
                        setFormData({ ...formData, technologies: newTech })
                      }}
                    />
                  </div>
                  <Textarea
                    placeholder="Technology Description"
                    className="mt-2"
                    value={tech.description}
                    onChange={(e) => {
                      const newTech = [...(formData.technologies || [])]
                      newTech[index] = { ...tech, description: e.target.value }
                      setFormData({ ...formData, technologies: newTech })
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    className="mt-2"
                    onClick={() => {
                      const newTech = formData.technologies?.filter((_, i) => i !== index) || []
                      setFormData({ ...formData, technologies: newTech })
                    }}
                  >
                    Remove Technology
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const newTech = [...(formData.technologies || []), { name: '', description: '' }]
                  setFormData({ ...formData, technologies: newTech })
                }}
              >
                Add Technology
              </Button>
            </div>

            <div>
              <Label>Clinical Results</Label>
              <div className="space-y-3 border p-3 rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hairLossValue">Hair Loss Reduction (%)</Label>
                    <Input
                      id="hairLossValue"
                      type="number"
                      value={formData.clinicalResults?.hairLossReduction?.value || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clinicalResults: {
                          ...formData.clinicalResults,
                          hairLossReduction: {
                            value: parseFloat(e.target.value),
                            duration: formData.clinicalResults?.hairLossReduction?.duration || ''
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hairLossDuration">Duration</Label>
                    <Input
                      id="hairLossDuration"
                      value={formData.clinicalResults?.hairLossReduction?.duration || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clinicalResults: {
                          ...formData.clinicalResults,
                          hairLossReduction: {
                            value: formData.clinicalResults?.hairLossReduction?.value || 0,
                            duration: e.target.value
                          }
                        }
                      })}
                      placeholder="4 weeks"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="satisfactionValue">Customer Satisfaction (%)</Label>
                    <Input
                      id="satisfactionValue"
                      type="number"
                      value={formData.clinicalResults?.customerSatisfaction?.value || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clinicalResults: {
                          ...formData.clinicalResults,
                          customerSatisfaction: {
                            value: parseFloat(e.target.value),
                            unit: '%'
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scalpHealthValue">Scalp Health Improvement (%)</Label>
                    <Input
                      id="scalpHealthValue"
                      type="number"
                      value={formData.clinicalResults?.scalpHealth?.value || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clinicalResults: {
                          ...formData.clinicalResults,
                          scalpHealth: {
                            value: parseFloat(e.target.value),
                            duration: formData.clinicalResults?.scalpHealth?.duration || ''
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>Certifications</Label>
              <div className="grid grid-cols-2 gap-2">
                {['CPNP', 'CPNP_UK', 'CPNP_EU', 'CPNP_CH', 'VEGAN', 'CRUELTY_FREE', 'EWG', 'DERMATOLOGIST_TESTED', 'CARBON_NEUTRAL'].map((cert) => (
                  <label key={cert} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.certifications?.includes(cert as any) || false}
                      onChange={(e) => {
                        const newCerts = e.target.checked
                          ? [...(formData.certifications || []), cert as any]
                          : formData.certifications?.filter(c => c !== cert) || []
                        setFormData({ ...formData, certifications: newCerts })
                      }}
                      className="mr-2"
                    />
                    {cert.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discounts" className="mt-6">
          <VolumeDiscountManager
            volumeDiscounts={formData.volumeDiscounts || []}
            onChange={(discounts) => setFormData({ ...formData, volumeDiscounts: discounts })}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminBrand['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
              >
                <option value="active">Active</option>
                <option value="pending">Pending Approval</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <Label>
                <input
                  type="checkbox"
                  checked={formData.isExclusivePartner}
                  onChange={(e) => setFormData({ ...formData, isExclusivePartner: e.target.checked })}
                  className="mr-2"
                />
                Exclusive Retailer Brand
              </Label>
            </div>

            <div>
              <Label>Product Categories</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.productCategories?.includes(category) || false}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...(formData.productCategories || []), category]
                          : formData.productCategories?.filter(c => c !== category) || []
                        setFormData({ ...formData, productCategories: newCategories })
                      }}
                      className="mr-2"
                    />
                    {category}
                  </label>
                ))}
              </div>
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

// Brand Create Form Component
function BrandCreateForm({
  onSave,
  onCancel
}: {
  onSave: (newBrand: Partial<AdminBrand>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<AdminBrand>>({
    name: '',
    description: '',
    status: 'pending',
    isExclusivePartner: false,
    productCategories: [],
    applicationDate: new Date().toISOString()
  })
  const categories = ['cleansers', 'toners', 'serums', 'moisturizers', 'masks', 'sun-care', 'hair-care', 'body-care']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="px-6 py-6 space-y-6">
        <div>
          <Label htmlFor="name">Brand Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              name: e.target.value
            })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson || ''}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail || ''}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website || ''}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <Label>Brand Logo</Label>
          <ImageUploadManager
            images={formData.logo ? [formData.logo] : []}
            onChange={(images) => setFormData({ ...formData, logo: images[0] || '' })}
            entityType="brand"
            entityId="new"
            maxImages={1}
            label=""
            helpText="Upload your brand logo. Recommended size: 400x400px"
          />
        </div>

        <div>
          <Label>
            <input
              type="checkbox"
              checked={formData.isExclusivePartner}
              onChange={(e) => setFormData({ ...formData, isExclusivePartner: e.target.checked })}
              className="mr-2"
            />
            Exclusive Retailer Brand
          </Label>
        </div>

        <div>
          <Label>Product Categories</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.productCategories?.includes(category) || false}
                  onChange={(e) => {
                    const newCategories = e.target.checked
                      ? [...(formData.productCategories || []), category]
                      : formData.productCategories?.filter(c => c !== category) || []
                    setFormData({ ...formData, productCategories: newCategories })
                  }}
                  className="mr-2"
                />
                {category}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 px-6 pb-6 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Brand</Button>
      </div>
    </form>
  )
}

// Volume Discount Manager Component
function VolumeDiscountManager({
  volumeDiscounts,
  onChange
}: {
  volumeDiscounts: Array<{ threshold: number; discountPercentage: number }>
  onChange: (discounts: Array<{ threshold: number; discountPercentage: number }>) => void
}) {
  const [previewAmount, setPreviewAmount] = useState('')

  const addDiscountTier = () => {
    const newDiscounts = [...volumeDiscounts, { threshold: 0, discountPercentage: 0 }]
    onChange(newDiscounts)
  }

  const removeDiscountTier = (index: number) => {
    const newDiscounts = volumeDiscounts.filter((_, i) => i !== index)
    onChange(newDiscounts)
  }

  const updateDiscountTier = (index: number, field: 'threshold' | 'discountPercentage', value: number) => {
    const newDiscounts = [...volumeDiscounts]
    newDiscounts[index] = { ...newDiscounts[index], [field]: value }
    onChange(newDiscounts)
  }

  const getApplicableDiscount = (amount: number) => {
    if (!volumeDiscounts.length) return null
    
    const applicable = volumeDiscounts
      .filter(tier => amount >= tier.threshold)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
    
    return applicable.length > 0 ? applicable[0] : null
  }

  const previewDiscount = previewAmount ? getApplicableDiscount(parseFloat(previewAmount)) : null

  // Validation
  const hasErrors = volumeDiscounts.some((tier, index) => {
    if (tier.threshold <= 0 || tier.discountPercentage <= 0 || tier.discountPercentage > 100) {
      return true
    }
    
    // Check for duplicate thresholds
    const duplicateThreshold = volumeDiscounts.some((otherTier, otherIndex) => 
      index !== otherIndex && tier.threshold === otherTier.threshold
    )
    
    return duplicateThreshold
  })

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Volume Discounts</h3>
            <p className="text-sm text-gray-500">
              Set automatic discounts based on order total. Higher order amounts get better discounts.
            </p>
          </div>
          <Button type="button" onClick={addDiscountTier} variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Add Tier
          </Button>
        </div>

        {volumeDiscounts.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No volume discounts configured</p>
            <p className="text-sm text-gray-400 mt-1">
              Add discount tiers to offer automatic discounts on larger orders
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {volumeDiscounts
              .map((tier, index) => ({ ...tier, originalIndex: index }))
              .sort((a, b) => a.threshold - b.threshold)
              .map(({ threshold, discountPercentage, originalIndex }) => {
                const hasThresholdError = threshold <= 0
                const hasPercentageError = discountPercentage <= 0 || discountPercentage > 100
                const hasDuplicateThreshold = volumeDiscounts.some((otherTier, otherIndex) => 
                  originalIndex !== otherIndex && threshold === otherTier.threshold && threshold > 0
                )
                
                return (
                  <div key={originalIndex} className={`p-4 border rounded-lg ${
                    hasThresholdError || hasPercentageError || hasDuplicateThreshold 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200'
                  }`}>
                    <div className="grid grid-cols-3 gap-4 items-end">
                      <div>
                        <Label htmlFor={`threshold-${originalIndex}`}>Minimum Order (£)</Label>
                        <Input
                          id={`threshold-${originalIndex}`}
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={threshold || ''}
                          onChange={(e) => updateDiscountTier(originalIndex, 'threshold', parseFloat(e.target.value) || 0)}
                          className={hasThresholdError || hasDuplicateThreshold ? 'border-red-300' : ''}
                          placeholder="1000"
                        />
                        {hasThresholdError && (
                          <p className="text-xs text-red-600 mt-1">Must be greater than 0</p>
                        )}
                        {hasDuplicateThreshold && (
                          <p className="text-xs text-red-600 mt-1">Duplicate threshold</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor={`percentage-${originalIndex}`}>Discount (%)</Label>
                        <Input
                          id={`percentage-${originalIndex}`}
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100"
                          value={discountPercentage || ''}
                          onChange={(e) => updateDiscountTier(originalIndex, 'discountPercentage', parseFloat(e.target.value) || 0)}
                          className={hasPercentageError ? 'border-red-300' : ''}
                          placeholder="5"
                        />
                        {hasPercentageError && (
                          <p className="text-xs text-red-600 mt-1">Must be between 0.1 and 100</p>
                        )}
                      </div>
                      
                      <div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() => removeDiscountTier(originalIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {threshold > 0 && discountPercentage > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        Orders £{threshold.toFixed(2)}+ get {discountPercentage}% off
                        {threshold > 0 && (
                          <span className="ml-2 text-green-600 font-medium">
                            (Save £{((threshold * discountPercentage) / 100).toFixed(2)} on £{threshold.toFixed(2)} order)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}

        {hasErrors && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">Please fix the following errors:</p>
            <ul className="text-red-700 text-sm mt-1 ml-4 list-disc">
              <li>All thresholds must be positive numbers</li>
              <li>All discount percentages must be between 0.1% and 100%</li>
              <li>No duplicate threshold amounts</li>
            </ul>
          </div>
        )}
      </div>

      {/* Discount Preview */}
      {volumeDiscounts.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-medium mb-3">Preview Discount Calculator</h4>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="previewAmount">Order Amount (£)</Label>
              <Input
                id="previewAmount"
                type="number"
                step="0.01"
                value={previewAmount}
                onChange={(e) => setPreviewAmount(e.target.value)}
                placeholder="Enter order amount to preview discount"
              />
            </div>
            <div className="flex-1">
              {previewAmount && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {previewDiscount ? (
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        {previewDiscount.discountPercentage}% discount applied
                      </p>
                      <p className="text-lg font-semibold">
                        £{(parseFloat(previewAmount) * (1 - previewDiscount.discountPercentage / 100)).toFixed(2)}
                        <span className="text-sm text-gray-500 ml-2">
                          (save £{(parseFloat(previewAmount) * (previewDiscount.discountPercentage / 100)).toFixed(2)})
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No discount applies</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Discount Tiers Summary */}
          {volumeDiscounts.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Current Discount Tiers:</h5>
              <div className="space-y-1">
                {volumeDiscounts
                  .filter(tier => tier.threshold > 0 && tier.discountPercentage > 0)
                  .sort((a, b) => a.threshold - b.threshold)
                  .map((tier, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • Orders £{tier.threshold.toFixed(2)}+ get {tier.discountPercentage}% off
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
