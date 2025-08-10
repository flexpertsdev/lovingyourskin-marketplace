import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/layout'
import { Container, Section } from '../../components/layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge } from '../../components/ui'
import { useAuthStore } from '../../stores/auth.store'
import { firebaseAffiliateService } from '../../services/firebase/affiliate.service'
import { AffiliateCode } from '../../types/affiliate'
import { Package, Users, TrendingUp, DollarSign, Copy, Share2, Clock, CheckCircle } from 'lucide-react'

export const AffiliateDashboard: React.FC = () => {
  const { user } = useAuthStore()
  const [affiliateCode, setAffiliateCode] = useState<AffiliateCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalCommission: 0,
    pendingCommission: 0,
    paidCommission: 0,
    conversionRate: 0
  })

  useEffect(() => {
    if (user?.id) {
      loadAffiliateData()
    }
  }, [user])

  const loadAffiliateData = async () => {
    try {
      setLoading(true)
      // Load all affiliate codes and find the one for this user
      const codes = await firebaseAffiliateService.getAllAffiliateCodes()
      const userCode = codes.find(c => c.userId === user!.id)
      
      if (userCode) {
        setAffiliateCode(userCode)
        // Get stats for this affiliate code
        const stats = await firebaseAffiliateService.getAffiliateStats(userCode.id, 'all')
        setStats({
          totalOrders: stats.orders,
          totalSales: stats.totalRevenue,
          totalCommission: stats.totalCommission,
          pendingCommission: stats.totalCommission * 0.3, // Mock pending
          paidCommission: stats.totalCommission * 0.7, // Mock paid
          conversionRate: stats.conversionRate
        })
      }
    } catch (error) {
      console.error('Failed to load affiliate data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (affiliateCode) {
      navigator.clipboard.writeText(affiliateCode.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareCode = () => {
    if (affiliateCode) {
      const shareUrl = `${window.location.origin}/shop?ref=${affiliateCode.code}`
      const discountText = affiliateCode.discountType === 'percentage' 
        ? `${affiliateCode.discountValue}%`
        : `£${affiliateCode.discountValue}`
      const shareText = affiliateCode.discountType !== 'none'
        ? `Save ${discountText} on Korean beauty products with my code: ${affiliateCode.code}`
        : `Shop Korean beauty products with my code: ${affiliateCode.code}`
      
      if (navigator.share) {
        navigator.share({
          title: 'Loving Your Skin Discount',
          text: shareText,
          url: shareUrl
        })
      } else {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  if (loading) {
    return (
      <Layout mode="affiliate">
        <Section>
          <Container>
            <div className="text-center py-20">Loading affiliate dashboard...</div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout mode="affiliate">
      <Section>
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light mb-2">Affiliate Dashboard</h1>
            <p className="text-text-secondary">
              Welcome back, {user?.name}! Track your performance and earnings.
            </p>
          </div>

          {/* Affiliate Code Card */}
          {affiliateCode ? (
            <Card className="mb-8 bg-gradient-to-r from-rose-gold/10 to-rose-gold/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-2">Your Affiliate Code</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-3xl font-bold text-rose-gold">{affiliateCode.code}</span>
                      {affiliateCode.discountType !== 'none' && (
                        <Badge className="bg-success-green text-white">
                          {affiliateCode.discountType === 'percentage' 
                            ? `${affiliateCode.discountValue}% OFF`
                            : `£${affiliateCode.discountValue} OFF`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-4">
                      {affiliateCode.discountType !== 'none' && (
                        <>Your customers save {affiliateCode.discountType === 'percentage' 
                          ? `${affiliateCode.discountValue}%` 
                          : `£${affiliateCode.discountValue}`} • </>
                      )}
                      You earn {affiliateCode.commissionType === 'percentage' 
                        ? `${affiliateCode.commissionValue}%` 
                        : `£${affiliateCode.commissionValue}`} commission
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={copyCode}
                        variant="secondary"
                        size="small"
                        className="flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Code
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={shareCode}
                        variant="outline"
                        size="small"
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Share Link
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={affiliateCode.active ? 'bg-success-green text-white' : 'bg-gray-500 text-white'}>
                      {affiliateCode.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 bg-gray-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">No Affiliate Code Yet</h3>
                <p className="text-text-secondary mb-4">
                  Your affiliate code is being set up. Please check back soon or contact support.
                </p>
                <Button variant="secondary">Contact Support</Button>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Sales</p>
                    <p className="text-2xl font-semibold">{formatCurrency(stats.totalSales)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-rose-gold opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Orders</p>
                    <p className="text-2xl font-semibold">{stats.totalOrders}</p>
                  </div>
                  <Package className="w-8 h-8 text-rose-gold opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Commission</p>
                    <p className="text-2xl font-semibold">{formatCurrency(stats.totalCommission)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-rose-gold opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Conversion Rate</p>
                    <p className="text-2xl font-semibold">{stats.conversionRate}%</p>
                  </div>
                  <Users className="w-8 h-8 text-rose-gold opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commission Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Breakdown</CardTitle>
                <CardDescription>Track your earnings status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="font-medium">{formatCurrency(stats.pendingCommission)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success-green" />
                      <span className="text-sm">Paid</span>
                    </div>
                    <span className="font-medium">{formatCurrency(stats.paidCommission)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-medium">Total Earned</span>
                    <span className="text-lg font-semibold text-rose-gold">
                      {formatCurrency(stats.totalCommission)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Tips</CardTitle>
                <CardDescription>Improve your conversion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-success-green mt-1">✓</span>
                    <div>
                      <p className="text-sm font-medium">Share on Social Media</p>
                      <p className="text-xs text-text-secondary">
                        Post about your favorite products with your code
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-green mt-1">✓</span>
                    <div>
                      <p className="text-sm font-medium">Create Content</p>
                      <p className="text-xs text-text-secondary">
                        Write reviews and tutorials featuring products
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-green mt-1">✓</span>
                    <div>
                      <p className="text-sm font-medium">Email Newsletter</p>
                      <p className="text-xs text-text-secondary">
                        Include your code in email signatures
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}