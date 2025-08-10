import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Button, Card, CardContent } from '../components/ui'
import { Spinner } from '../components/ui/Spinner'
import { Product } from '../types'
import { useAuthStore } from '../stores/auth.store'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import toast from 'react-hot-toast'

const HeartIcon = ({ filled = false }) => (
  <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)

export const Wishlist: React.FC = () => {
  const { user } = useAuthStore()
  const { addItem } = useConsumerCartStore()
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWishlist()
  }, [user])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      // TODO: Load wishlist from Firebase when backend is ready
      // For now, using localStorage
      const savedWishlist = localStorage.getItem(`wishlist_${user?.id || 'guest'}`)
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist))
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = (productId: string) => {
    const updatedItems = wishlistItems.filter(item => item.id !== productId)
    setWishlistItems(updatedItems)
    localStorage.setItem(`wishlist_${user?.id || 'guest'}`, JSON.stringify(updatedItems))
    toast.success('Removed from wishlist')
  }

  const moveToCart = (product: Product) => {
    if (!product.retailPrice) {
      toast.error('Product not available for retail purchase')
      return
    }

    addItem({
      productId: product.id,
      productName: typeof product.name === 'string' ? product.name : (product.name as any).en,
      variantId: product.variants?.[0]?.sku || 'default',
      price: product.retailPrice.item,
      quantity: 1,
      image: product.images?.primary || '',
      brandId: product.brandId
    })
    removeFromWishlist(product.id)
    toast.success('Moved to cart')
  }

  if (loading) {
    return (
      <Layout>
        <Section className="py-16">
          <Container className="flex justify-center">
            <Spinner size="large" />
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section className="py-8 md:py-12">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-deep-charcoal mb-2">
              My Wishlist
            </h1>
            <p className="text-text-secondary">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="flex justify-center mb-4">
                  <HeartIcon />
                </div>
                <h2 className="text-xl font-light mb-2">Your wishlist is empty</h2>
                <p className="text-text-secondary mb-6">
                  Save your favorite products to buy them later
                </p>
                <Link to="/shop">
                  <Button>Continue Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <Link to={`/shop/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 relative">
                      {product.images?.primary ? (
                        <img
                          src={product.images.primary}
                          alt={typeof product.name === 'string' ? product.name : (product.name as any).en}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <CardContent className="p-4">
                    <Link to={`/shop/products/${product.id}`}>
                      <h3 className="font-medium text-deep-charcoal mb-1 hover:text-rose-gold transition-colors">
                        {typeof product.name === 'string' ? product.name : (product.name as any).en}
                      </h3>
                    </Link>
                    
                    {product.retailPrice && (
                      <p className="text-lg font-light text-rose-gold mb-4">
                        ${product.retailPrice.item.toFixed(2)}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="small"
                        className="flex-1"
                        onClick={() => moveToCart(product)}
                      >
                        <ShoppingBagIcon />
                        <span className="ml-2">Add to Cart</span>
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => removeFromWishlist(product.id)}
                        className="px-3"
                      >
                        <HeartIcon filled />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}