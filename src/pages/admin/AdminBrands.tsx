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
import { brandService, storageService } from '../../services'
import type { Brand } from '../../types'

// Extended Brand type for admin management
interface AdminBrand extends Brand {
  status?: 'active' | 'pending' | 'inactive'
  contactEmail?: string
  contactPerson?: string
  website?: string
  productCategories?: string[]
  applicationDate?: string
  approvedDate?: string
}

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
      // Filter out admin-specific properties before sending to brandService
      const { status, contactEmail, contactPerson, website, productCategories, applicationDate, approvedDate, ...brandData } = updates
      await brandService.update(brandId, brandData as Partial<Brand>)
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
      // Filter out admin-specific properties before sending to brandService
      const { status, contactEmail, contactPerson, website, productCategories, applicationDate, approvedDate, ...brandData } = newBrand
      
      // Provide required Brand fields with defaults
      const brandToCreate: Omit<Brand, 'id'> = {
        name: brandData.name || '',
        slug: brandData.slug || brandData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        tagline: brandData.tagline || '',
        description: brandData.description || '',
        logo: brandData.logo || '',
        heroImage: brandData.heroImage || '',
        establishedYear: brandData.establishedYear || new Date().getFullYear(),
        productCount: brandData.productCount || 0,
        minimumOrder: brandData.minimumOrder || 100,
        country: brandData.country || 'KR',
        certifications: brandData.certifications || [],
        featureTags: brandData.featureTags || [],
        categories: brandData.categories || [],
        stats: brandData.stats || {
          yearsInBusiness: 0,
          productsSold: '0',
          customerSatisfaction: 0
        },
        active: brandData.active !== undefined ? brandData.active : false,
        featured: brandData.featured || false,
        isExclusivePartner: brandData.isExclusivePartner || false
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
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const categories = ['cleansers', 'toners', 'serums', 'moisturizers', 'masks', 'sun-care', 'hair-care', 'body-care']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(brand.id, formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
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
            <Label htmlFor="logo">Logo</Label>
            <div className="space-y-2">
              {formData.logo && (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.logo}
                    alt="Brand logo"
                    className="w-20 h-20 object-contain border rounded"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => setFormData({ ...formData, logo: '' })}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="logo"
                  value={formData.logo || ''}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    if (formData.logo && !storageService.isFirebaseStorageUrl(formData.logo)) {
                      setUploadingLogo(true)
                      try {
                        const newUrl = await storageService.migrateExternalImage(
                          formData.logo,
                          'brand',
                          brand.id
                        )
                        setFormData({ ...formData, logo: newUrl })
                        toast.success('Logo uploaded to Firebase Storage')
                      } catch (error) {
                        toast.error('Failed to upload logo')
                      } finally {
                        setUploadingLogo(false)
                      }
                    }
                  }}
                  disabled={!formData.logo || storageService.isFirebaseStorageUrl(formData.logo) || uploadingLogo}
                >
                  {uploadingLogo ? 'Uploading...' : 'Upload to Firebase'}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploadingLogo(true)
                      try {
                        const path = storageService.getBrandLogoPath(brand.id, file.name)
                        const url = await storageService.uploadImageFile(file, path)
                        setFormData({ ...formData, logo: url })
                        toast.success('Logo uploaded successfully')
                      } catch (error) {
                        console.error('Upload error:', error)
                        toast.error('Failed to upload logo')
                      } finally {
                        setUploadingLogo(false)
                      }
                    }
                  }}
                  disabled={uploadingLogo}
                />
                <span className="text-sm text-gray-500">or</span>
              </div>
              <p className="text-xs text-gray-500">
                Upload an image file or enter an image URL above
              </p>
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