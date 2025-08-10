import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import toast from 'react-hot-toast';
import { Loader2, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { getProductName, getProductPrimaryImage } from '@/utils/product-helpers';
import { ImageUploadManager } from '@/components/admin/ImageUploadManager';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Fetch products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

      // Apply brand filter
      if (selectedBrand !== 'all') {
        q = query(q, where('brandId', '==', selectedBrand));
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        q = query(q, where('category', '==', selectedCategory));
      }

      const querySnapshot = await getDocs(q);
      const fetchedProducts: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      console.log('Fetched products:', fetchedProducts.length, fetchedProducts);

      // Apply search filter (client-side for now)
      const filtered = searchTerm
        ? fetchedProducts.filter(product => {
            const name = getProductName(product);
            const description = product.description;
            return name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              description?.toLowerCase().includes(searchTerm.toLowerCase());
          })
        : fetchedProducts;

      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedBrand, selectedCategory, searchTerm]);

  // Update product
  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('Product updated successfully');
      
      fetchProducts();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  // Create product
  const handleCreateProduct = async (newProduct: Partial<Product>) => {
    try {
      const productName = typeof newProduct.name === 'string' ? newProduct.name : (newProduct.name as any)?.en || '';
      const productId = `${newProduct.brandId}-${productName.toLowerCase().replace(/\s+/g, '-')}`;
      await setDoc(doc(db, 'products', productId), {
        ...newProduct,
        id: productId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
      });
      
      toast.success('Product created successfully');
      
      fetchProducts();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      
      toast.success('Product deleted successfully');
      
      fetchProducts();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const brands = ['all', 'baohlab', 'lalucell', 'sunnicorn', 'the-cell-lab', 'wismin'];
  const categories = ['all', 'cleansers', 'toners', 'serums', 'moisturizers', 'masks', 'sun-care', 'hair-care', 'body-care', 'eye-care', 'lip-care', 'sets'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Product Management</CardTitle>
          </CardHeader>
          <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)}
              options={brands.map((brand) => ({
                value: brand,
                label: brand === 'all' ? 'All Brands' : brand
              }))}
              placeholder="Select brand"
              className="w-[200px]"
            />

            <Select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categories.map((category) => ({
                value: category,
                label: category === 'all' ? 'All Categories' : category
              }))}
              placeholder="Select category"
              className="w-[200px]"
            />

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={getProductPrimaryImage(product) || '/placeholder.png'}
                          alt={getProductName(product)}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {getProductName(product)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const brandName = product.brand?.name;
                          return typeof brandName === 'string' ? brandName : (brandName as any)?.en || product.brandId;
                        })()}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        {product.variants?.[0]?.pricing?.b2c?.retailPrice
                          ? `$${product.variants[0].pricing.b2c.retailPrice}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.status === 'active' ? 'success' : 'default'}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => {
                              setSelectedProduct(product);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="small"
                            variant="secondary"
                            className="text-red-600"
                            onClick={() => {
                              setProductToDelete(product);
                              setDeleteDialogOpen(true);
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

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductEditForm
            product={selectedProduct}
            onSave={handleUpdateProduct}
          />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          <ProductCreateForm
            onSave={handleCreateProduct}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete ? getProductName(productToDelete) : ''}" from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && handleDeleteProduct(productToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </Layout>
  );
}

// Product Edit Form Component
function ProductEditForm({
  product,
  onSave,
}: {
  product: Product;
  onSave: (productId: string, updates: Partial<Product>) => void;
}) {
  const [formData, setFormData] = useState(product);
  const [isDirty, setIsDirty] = useState(false);

  // Track changes for save-on-submit pattern
  const updateFormData = (updates: Partial<Product>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleImagesUpdate = (images: string[]) => {
    updateFormData({
      images: {
        primary: images[0] || formData.images?.primary || '',
        gallery: images
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isDirty) {
      toast('No changes to save', { icon: 'ℹ️' });
      return;
    }

    onSave(product.id, formData);
    setIsDirty(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <div className="px-6 py-6 space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={getProductName(formData)}
                onChange={(e) => updateFormData({ name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateFormData({ shortDescription: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => updateFormData({ category: e.target.value })}
                  options={['cleansers', 'toners', 'serums', 'moisturizers', 'masks', 'sun-care', 'hair-care', 'body-care', 'eye-care', 'lip-care', 'sets'].map((cat) => ({
                    value: cat,
                    label: cat
                  }))}
                  placeholder="Select category"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => updateFormData({ status: e.target.value as 'active' | 'presale' | 'discontinued' | 'out-of-stock' })}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'presale', label: 'Presale' },
                    { value: 'discontinued', label: 'Discontinued' },
                    { value: 'out-of-stock', label: 'Out of Stock' }
                  ]}
                  placeholder="Select status"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => updateFormData({ featured: e.target.checked })}
                  className="h-4 w-4 text-rose-gold"
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPreorder"
                  checked={formData.isPreorder}
                  onChange={(e) => updateFormData({ isPreorder: e.target.checked })}
                  className="h-4 w-4 text-rose-gold"
                />
                <Label htmlFor="isPreorder">Pre-order Product</Label>
              </div>
            </div>

            {formData.isPreorder && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preorderDiscount">Pre-order Discount (%)</Label>
                  <Input
                    id="preorderDiscount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.preorderDiscount || ''}
                    onChange={(e) => updateFormData({ preorderDiscount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="preorderEndDate">Pre-order End Date</Label>
                  <Input
                    id="preorderEndDate"
                    type="date"
                    value={formData.preorderEndDate || ''}
                    onChange={(e) => updateFormData({ preorderEndDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <div className="px-6 py-6 space-y-4">
            {formData.variants?.map((variant, index) => (
              <Card key={variant.variantId}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Variant: {variant.sku || `Variant ${index + 1}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>B2C Retail Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.pricing?.b2c?.retailPrice || ''}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = {
                            ...variant,
                            pricing: {
                              ...variant.pricing,
                              b2c: {
                                ...variant.pricing.b2c,
                                retailPrice: parseFloat(e.target.value),
                              },
                            },
                          };
                          updateFormData({ variants: newVariants });
                        }}
                      />
                    </div>

                    <div>
                      <Label>B2B Wholesale Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.pricing?.b2b?.wholesalePrice || ''}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = {
                            ...variant,
                            pricing: {
                              ...variant.pricing,
                              b2b: {
                                ...variant.pricing.b2b,
                                wholesalePrice: parseFloat(e.target.value),
                              },
                            },
                          };
                          updateFormData({ variants: newVariants });
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>B2C Stock</Label>
                      <Input
                        type="number"
                        value={variant.inventory?.b2c?.stock || 0}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = {
                            ...variant,
                            inventory: {
                              ...variant.inventory,
                              b2c: {
                                ...variant.inventory.b2c,
                                stock: parseInt(e.target.value),
                                available: parseInt(e.target.value) - (variant.inventory?.b2c?.reserved || 0),
                              },
                            },
                          };
                          updateFormData({ variants: newVariants });
                        }}
                      />
                    </div>

                    <div>
                      <Label>B2B Stock</Label>
                      <Input
                        type="number"
                        value={variant.inventory?.b2b?.stock || 0}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = {
                            ...variant,
                            inventory: {
                              ...variant.inventory,
                              b2b: {
                                ...variant.inventory.b2b,
                                stock: parseInt(e.target.value),
                                available: parseInt(e.target.value) - (variant.inventory?.b2b?.reserved || 0),
                              },
                            },
                          };
                          updateFormData({ variants: newVariants });
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <div className="px-6 py-6">
            <ImageUploadManager
              images={formData.images?.gallery || []}
              onChange={handleImagesUpdate}
              entityType="product"
              entityId={product.id || 'new'}
              brandId={formData.brandId}
              maxImages={10}
              label="Product Images"
              helpText="Upload up to 10 images. The first image will be used as the primary image."
            />
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <div className="px-6 py-6 space-y-4">
            <div>
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                value={formData.ingredients}
                onChange={(e) => updateFormData({ ingredients: e.target.value })}
                rows={4}
                placeholder="Full ingredient list"
              />
            </div>

            <div>
              <Label htmlFor="usage">Usage Instructions</Label>
              <Textarea
                id="usage"
                value={formData.usage || ''}
                onChange={(e) => updateFormData({ usage: e.target.value })}
                rows={3}
                placeholder="How to use this product"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) =>
                  updateFormData({
                    tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
                  })
                }
                placeholder="e.g., hydrating, anti-aging, brightening"
              />
            </div>
          </div>
        </TabsContent>

        {/* New Specifications Tab */}
        <TabsContent value="specifications" className="mt-6">
          <div className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={formData.specifications?.origin || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, origin: e.target.value },
                    })
                  }
                  placeholder="e.g., Korea"
                />
              </div>

              <div>
                <Label htmlFor="pao">PAO (Period After Opening)</Label>
                <Input
                  id="pao"
                  value={formData.specifications?.pao || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, pao: e.target.value },
                    })
                  }
                  placeholder="e.g., 6M, 12M"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="keyIngredient">Key Ingredient</Label>
                <Input
                  id="keyIngredient"
                  value={formData.specifications?.keyIngredient || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, keyIngredient: e.target.value },
                    })
                  }
                  placeholder="Main active ingredient"
                />
              </div>

              <div>
                <Label htmlFor="treatmentDuration">Treatment Duration</Label>
                <Input
                  id="treatmentDuration"
                  value={formData.specifications?.treatmentDuration || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, treatmentDuration: e.target.value },
                    })
                  }
                  placeholder="e.g., 4 weeks"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="setContents">Set Contents (for product sets)</Label>
              <Textarea
                id="setContents"
                value={formData.specifications?.setContents || ''}
                onChange={(e) =>
                  updateFormData({
                    specifications: { ...formData.specifications, setContents: e.target.value },
                  })
                }
                rows={2}
                placeholder="List items in the set"
              />
            </div>

            <div>
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.specifications?.features?.join('\n') || ''}
                onChange={(e) =>
                  updateFormData({
                    specifications: { 
                      ...formData.specifications, 
                      features: e.target.value.split('\n').filter(Boolean)
                    },
                  })
                }
                rows={4}
                placeholder="Key product features
One per line"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="spf">SPF (for sunscreens)</Label>
                <Input
                  id="spf"
                  value={formData.specifications?.spf || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, spf: e.target.value },
                    })
                  }
                  placeholder="e.g., SPF50+"
                />
              </div>

              <div>
                <Label htmlFor="paRating">PA Rating</Label>
                <Input
                  id="paRating"
                  value={formData.specifications?.paRating || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, paRating: e.target.value },
                    })
                  }
                  placeholder="e.g., PA++++"
                />
              </div>

              <div>
                <Label htmlFor="volume">Volume/Size</Label>
                <Input
                  id="volume"
                  value={formData.specifications?.volume || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, volume: e.target.value },
                    })
                  }
                  placeholder="e.g., 50ml, 100g"
                />
              </div>
            </div>

            <div>
              <Label>Certifications</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['CPNP', 'CPNP_UK', 'CPNP_EU', 'CPNP_CH', 'VEGAN', 'CRUELTY_FREE', 'EWG', 'DERMATOLOGIST_TESTED', 'CARBON_NEUTRAL'].map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`cert-${cert}`}
                      checked={formData.specifications?.certifications?.includes(cert) || false}
                      onChange={(e) => {
                        const currentCerts = formData.specifications?.certifications || [];
                        const newCerts = e.target.checked
                          ? [...currentCerts, cert]
                          : currentCerts.filter(c => c !== cert);
                        updateFormData({
                          specifications: { ...formData.specifications, certifications: newCerts },
                        });
                      }}
                      className="h-4 w-4 text-rose-gold"
                    />
                    <Label htmlFor={`cert-${cert}`} className="text-sm">{cert.replace(/_/g, ' ')}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 px-6 pb-6 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={() => {
          setFormData(product);
          setIsDirty(false);
        }}>
          Reset
        </Button>
        <Button type="submit" disabled={!isDirty}>
          {isDirty ? 'Save Changes' : 'No Changes'}
        </Button>
      </div>
    </form>
  );
}

// Product Create Form Component
function ProductCreateForm({
  onSave,
}: {
  onSave: (newProduct: Partial<Product>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    shortDescription: '',
    category: 'serums',
    status: 'active',
    brandId: 'baohlab',
    brand: {
      id: 'baohlab',
      name: 'BAOH Lab'
    },
    slug: '',
    featured: false,
    isPreorder: false,
    tags: [],
    images: {
      primary: '',
      gallery: []
    },
    variants: [{
      variantId: 'default',
      sku: '',
      color: null,
      colorHex: null,
      size: null,
      sizeUnit: null,
      isDefault: true,
      status: 'active',
      inventory: {
        b2b: {
          stock: 0,
          available: 0,
          reserved: 0
        },
        b2c: {
          stock: 0,
          available: 0,
          reserved: 0
        }
      },
      pricing: {
        b2b: {
          enabled: true,
          wholesalePrice: 0,
          minOrderQuantity: 1,
          unitsPerCarton: null,
          currency: 'GBP'
        },
        b2c: {
          enabled: true,
          retailPrice: 0,
          salePrice: null,
          currency: 'GBP'
        }
      }
    }],
    specifications: {
      certifications: [],
      features: []
    }
  });
  const [isDirty, setIsDirty] = useState(false);

  // Track changes for save-on-submit pattern
  const updateFormData = (updates: Partial<Product>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleImagesUpdate = (images: string[]) => {
    updateFormData({
      images: {
        primary: images[0] || formData.images?.primary || '',
        gallery: images
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brandId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Generate slug from name
    const slug = formData.name.toLowerCase().replace(/\s+/g, '-');
    
    onSave({ ...formData, slug });
    setIsDirty(false);
  };

  const brands = [
    { id: 'baohlab', name: 'BAOH Lab' },
    { id: 'lalucell', name: 'LaLucell' },
    { id: 'sunnicorn', name: 'Sunnicorn' },
    { id: 'the-cell-lab', name: 'The Cell Lab' },
    { id: 'wismin', name: 'Wismin' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <div className="px-6 py-6 space-y-4">
            <div>
              <Label htmlFor="brandId">Brand *</Label>
              <Select
                value={formData.brandId}
                onChange={(e) => {
                  const brand = brands.find(b => b.id === e.target.value);
                  updateFormData({ 
                    brandId: e.target.value,
                    brand: brand ? { id: brand.id, name: brand.name } : undefined
                  });
                }}
                options={brands.map((brand) => ({
                  value: brand.id,
                  label: brand.name
                }))}
                placeholder="Select brand"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateFormData({ name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription || ''}
                onChange={(e) => updateFormData({ shortDescription: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => updateFormData({ category: e.target.value })}
                  options={['cleansers', 'toners', 'serums', 'moisturizers', 'masks', 'sun-care', 'hair-care', 'body-care', 'eye-care', 'lip-care', 'sets'].map((cat) => ({
                    value: cat,
                    label: cat
                  }))}
                  placeholder="Select category"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => updateFormData({ status: e.target.value as 'active' | 'presale' | 'discontinued' | 'out-of-stock' })}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'presale', label: 'Presale' },
                    { value: 'discontinued', label: 'Discontinued' },
                    { value: 'out-of-stock', label: 'Out of Stock' }
                  ]}
                  placeholder="Select status"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => updateFormData({ featured: e.target.checked })}
                  className="h-4 w-4 text-rose-gold"
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPreorder"
                  checked={formData.isPreorder}
                  onChange={(e) => updateFormData({ isPreorder: e.target.checked })}
                  className="h-4 w-4 text-rose-gold"
                />
                <Label htmlFor="isPreorder">Pre-order Product</Label>
              </div>
            </div>

            {formData.isPreorder && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preorderDiscount">Pre-order Discount (%)</Label>
                  <Input
                    id="preorderDiscount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.preorderDiscount || ''}
                    onChange={(e) => updateFormData({ preorderDiscount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="preorderEndDate">Pre-order End Date</Label>
                  <Input
                    id="preorderEndDate"
                    type="date"
                    value={formData.preorderEndDate || ''}
                    onChange={(e) => updateFormData({ preorderEndDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <div className="px-6 py-6 space-y-4">
            <h3 className="text-lg font-medium">Default Variant</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SKU</Label>
                <Input
                  value={formData.variants?.[0]?.sku || ''}
                  onChange={(e) => {
                    const newVariants = [...(formData.variants || [])];
                    if (newVariants[0]) {
                      newVariants[0].sku = e.target.value;
                      updateFormData({ variants: newVariants });
                    }
                  }}
                  placeholder="e.g., BAOH-SERUM-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>B2C Retail Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.variants?.[0]?.pricing?.b2c?.retailPrice || ''}
                  onChange={(e) => {
                    const newVariants = [...(formData.variants || [])];
                    if (newVariants[0]) {
                      newVariants[0].pricing.b2c.retailPrice = parseFloat(e.target.value) || 0;
                      updateFormData({ variants: newVariants });
                    }
                  }}
                />
              </div>

              <div>
                <Label>B2B Wholesale Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.variants?.[0]?.pricing?.b2b?.wholesalePrice || ''}
                  onChange={(e) => {
                    const newVariants = [...(formData.variants || [])];
                    if (newVariants[0]) {
                      newVariants[0].pricing.b2b.wholesalePrice = parseFloat(e.target.value) || 0;
                      updateFormData({ variants: newVariants });
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>B2C Stock</Label>
                <Input
                  type="number"
                  value={formData.variants?.[0]?.inventory?.b2c?.stock || 0}
                  onChange={(e) => {
                    const newVariants = [...(formData.variants || [])];
                    if (newVariants[0]) {
                      const stock = parseInt(e.target.value) || 0;
                      newVariants[0].inventory.b2c.stock = stock;
                      newVariants[0].inventory.b2c.available = stock;
                      updateFormData({ variants: newVariants });
                    }
                  }}
                />
              </div>

              <div>
                <Label>B2B Stock</Label>
                <Input
                  type="number"
                  value={formData.variants?.[0]?.inventory?.b2b?.stock || 0}
                  onChange={(e) => {
                    const newVariants = [...(formData.variants || [])];
                    if (newVariants[0]) {
                      const stock = parseInt(e.target.value) || 0;
                      newVariants[0].inventory.b2b.stock = stock;
                      newVariants[0].inventory.b2b.available = stock;
                      updateFormData({ variants: newVariants });
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>B2B Min Order Quantity</Label>
                <Input
                  type="number"
                  value={formData.variants?.[0]?.pricing?.b2b?.minOrderQuantity || 1}
                  onChange={(e) => {
                    const newVariants = [...(formData.variants || [])];
                    if (newVariants[0]) {
                      newVariants[0].pricing.b2b.minOrderQuantity = parseInt(e.target.value) || 1;
                      updateFormData({ variants: newVariants });
                    }
                  }}
                />
              </div>

              <div>
                <Label>Units per Carton</Label>
                <Input
                  type="number"
                  value={formData.variants?.[0]?.pricing?.b2b?.unitsPerCarton || ''}
                  onChange={(e) => {
                    const newVariants = [...(formData.variants || [])];
                    if (newVariants[0]) {
                      newVariants[0].pricing.b2b.unitsPerCarton = e.target.value ? parseInt(e.target.value) : null;
                      updateFormData({ variants: newVariants });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <div className="px-6 py-6">
            <ImageUploadManager
              images={formData.images?.gallery || []}
              onChange={handleImagesUpdate}
              entityType="product"
              entityId="new"
              brandId={formData.brandId}
              maxImages={10}
              label="Product Images"
              helpText="Upload up to 10 images. The first image will be used as the primary image."
            />
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <div className="px-6 py-6 space-y-4">
            <div>
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                value={formData.ingredients || ''}
                onChange={(e) => updateFormData({ ingredients: e.target.value })}
                rows={4}
                placeholder="Full ingredient list"
              />
            </div>

            <div>
              <Label htmlFor="usage">Usage Instructions</Label>
              <Textarea
                id="usage"
                value={formData.usage || ''}
                onChange={(e) => updateFormData({ usage: e.target.value })}
                rows={3}
                placeholder="How to use this product"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) =>
                  updateFormData({
                    tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
                  })
                }
                placeholder="e.g., hydrating, anti-aging, brightening"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <div className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={formData.specifications?.origin || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, origin: e.target.value },
                    })
                  }
                  placeholder="e.g., Korea"
                />
              </div>

              <div>
                <Label htmlFor="pao">PAO (Period After Opening)</Label>
                <Input
                  id="pao"
                  value={formData.specifications?.pao || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, pao: e.target.value },
                    })
                  }
                  placeholder="e.g., 6M, 12M"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="keyIngredient">Key Ingredient</Label>
                <Input
                  id="keyIngredient"
                  value={formData.specifications?.keyIngredient || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, keyIngredient: e.target.value },
                    })
                  }
                  placeholder="Main active ingredient"
                />
              </div>

              <div>
                <Label htmlFor="treatmentDuration">Treatment Duration</Label>
                <Input
                  id="treatmentDuration"
                  value={formData.specifications?.treatmentDuration || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, treatmentDuration: e.target.value },
                    })
                  }
                  placeholder="e.g., 4 weeks"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="setContents">Set Contents (for product sets)</Label>
              <Textarea
                id="setContents"
                value={formData.specifications?.setContents || ''}
                onChange={(e) =>
                  updateFormData({
                    specifications: { ...formData.specifications, setContents: e.target.value },
                  })
                }
                rows={2}
                placeholder="List items in the set"
              />
            </div>

            <div>
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.specifications?.features?.join('\n') || ''}
                onChange={(e) =>
                  updateFormData({
                    specifications: { 
                      ...formData.specifications, 
                      features: e.target.value.split('\n').filter(Boolean)
                    },
                  })
                }
                rows={4}
                placeholder="Key product features
One per line"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="spf">SPF (for sunscreens)</Label>
                <Input
                  id="spf"
                  value={formData.specifications?.spf || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, spf: e.target.value },
                    })
                  }
                  placeholder="e.g., SPF50+"
                />
              </div>

              <div>
                <Label htmlFor="paRating">PA Rating</Label>
                <Input
                  id="paRating"
                  value={formData.specifications?.paRating || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, paRating: e.target.value },
                    })
                  }
                  placeholder="e.g., PA++++"
                />
              </div>

              <div>
                <Label htmlFor="volume">Volume/Size</Label>
                <Input
                  id="volume"
                  value={formData.specifications?.volume || ''}
                  onChange={(e) =>
                    updateFormData({
                      specifications: { ...formData.specifications, volume: e.target.value },
                    })
                  }
                  placeholder="e.g., 50ml, 100g"
                />
              </div>
            </div>

            <div>
              <Label>Certifications</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['CPNP', 'CPNP_UK', 'CPNP_EU', 'CPNP_CH', 'VEGAN', 'CRUELTY_FREE', 'EWG', 'DERMATOLOGIST_TESTED', 'CARBON_NEUTRAL'].map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`cert-${cert}`}
                      checked={formData.specifications?.certifications?.includes(cert) || false}
                      onChange={(e) => {
                        const currentCerts = formData.specifications?.certifications || [];
                        const newCerts = e.target.checked
                          ? [...currentCerts, cert]
                          : currentCerts.filter(c => c !== cert);
                        updateFormData({
                          specifications: { ...formData.specifications, certifications: newCerts },
                        });
                      }}
                      className="h-4 w-4 text-rose-gold"
                    />
                    <Label htmlFor={`cert-${cert}`} className="text-sm">{cert.replace(/_/g, ' ')}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 px-6 pb-6 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={() => {
          setFormData({
            name: '',
            description: '',
            shortDescription: '',
            category: 'serums',
            status: 'active',
            brandId: 'baohlab',
            brand: {
              id: 'baohlab',
              name: 'BAOH Lab'
            },
            slug: '',
            featured: false,
            isPreorder: false,
            tags: [],
            images: {
              primary: '',
              gallery: []
            },
            variants: [{
              variantId: 'default',
              sku: '',
              color: null,
              colorHex: null,
              size: null,
              sizeUnit: null,
              isDefault: true,
              status: 'active',
              inventory: {
                b2b: {
                  stock: 0,
                  available: 0,
                  reserved: 0
                },
                b2c: {
                  stock: 0,
                  available: 0,
                  reserved: 0
                }
              },
              pricing: {
                b2b: {
                  enabled: true,
                  wholesalePrice: 0,
                  minOrderQuantity: 1,
                  unitsPerCarton: null,
                  currency: 'GBP'
                },
                b2c: {
                  enabled: true,
                  retailPrice: 0,
                  salePrice: null,
                  currency: 'GBP'
                }
              }
            }],
            specifications: {
              certifications: [],
              features: []
            }
          });
          setIsDirty(false);
        }}>
          Reset
        </Button>
        <Button type="submit" disabled={!isDirty || !formData.name || !formData.brandId}>
          Create Product
        </Button>
      </div>
    </form>
  );
}