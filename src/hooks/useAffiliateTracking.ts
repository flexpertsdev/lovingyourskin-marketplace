import { useEffect, useCallback } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { firebaseAffiliateService } from '../services/firebase/affiliate.service'

// Key for localStorage
const AFFILIATE_STORAGE_KEY = 'lys_affiliate_tracking'
const AFFILIATE_EXPIRY_DAYS = 30 // Cookie-like expiry

export interface AffiliateTrackingData {
  code: string
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
  referrer?: string
  landingPage: string
  timestamp: number
  sessionId: string
  appliedAt?: number // When it was applied to an order
}

export const useAffiliateTracking = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('lys_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      sessionStorage.setItem('lys_session_id', sessionId)
    }
    return sessionId
  }

  // Save tracking data to localStorage
  const saveTrackingData = (data: AffiliateTrackingData) => {
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(data))
  }

  // Get tracking data from localStorage
  const getTrackingData = (): AffiliateTrackingData | null => {
    try {
      const stored = localStorage.getItem(AFFILIATE_STORAGE_KEY)
      if (!stored) return null

      const data = JSON.parse(stored) as AffiliateTrackingData
      
      // Check if data has expired (30 days)
      const expiryTime = AFFILIATE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      if (Date.now() - data.timestamp > expiryTime) {
        localStorage.removeItem(AFFILIATE_STORAGE_KEY)
        return null
      }

      return data
    } catch {
      return null
    }
  }

  // Clear tracking data (after successful order)
  const clearTrackingData = () => {
    localStorage.removeItem(AFFILIATE_STORAGE_KEY)
  }

  // Mark tracking as applied
  const markAsApplied = () => {
    const data = getTrackingData()
    if (data) {
      data.appliedAt = Date.now()
      saveTrackingData(data)
    }
  }

  // Track affiliate click/visit
  const trackAffiliateVisit = useCallback(async (trackingData: AffiliateTrackingData) => {
    try {
      // Validate the affiliate code first
      const validation = await firebaseAffiliateService.validateAffiliateCode(trackingData.code)
      
      if (validation.valid && validation.affiliateCode) {
        // Track the visit in Firebase
        await firebaseAffiliateService.trackAffiliateClick({
          affiliateCodeId: validation.affiliateCode.id,
          affiliateCode: trackingData.code,
          sessionId: trackingData.sessionId,
          utmSource: trackingData.source,
          utmMedium: trackingData.medium,
          utmCampaign: trackingData.campaign,
          utmTerm: trackingData.term,
          utmContent: trackingData.content,
          referrerUrl: trackingData.referrer,
          landingPage: trackingData.landingPage
        })

        // Save to localStorage for persistence
        saveTrackingData(trackingData)
        
        return true
      }
    } catch (error) {
      console.error('Failed to track affiliate visit:', error)
    }
    return false
  }, [])

  // Check and capture affiliate parameters on mount and route change
  useEffect(() => {
    // Check for affiliate parameters in URL
    const ref = searchParams.get('ref') || searchParams.get('affiliate')
    const utmSource = searchParams.get('utm_source')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')
    const utmTerm = searchParams.get('utm_term')
    const utmContent = searchParams.get('utm_content')

    // If we have a ref code and it's different from stored one, track it
    if (ref) {
      const existingData = getTrackingData()
      
      // Only track if it's a new code or doesn't exist
      if (!existingData || existingData.code !== ref) {
        const trackingData: AffiliateTrackingData = {
          code: ref.toUpperCase(),
          source: utmSource || undefined,
          medium: utmMedium || undefined,
          campaign: utmCampaign || undefined,
          term: utmTerm || undefined,
          content: utmContent || undefined,
          referrer: document.referrer || undefined,
          landingPage: location.pathname + location.search,
          timestamp: Date.now(),
          sessionId: getSessionId()
        }

        trackAffiliateVisit(trackingData)
      }
    }
  }, [location, searchParams, trackAffiliateVisit])

  // Get the active affiliate code (if any)
  const getActiveAffiliateCode = useCallback((): string | null => {
    const data = getTrackingData()
    return data?.code || null
  }, [])

  // Check if affiliate code is active and valid
  const hasActiveAffiliateCode = useCallback((): boolean => {
    const data = getTrackingData()
    return !!data && !data.appliedAt // Not yet applied to an order
  }, [])

  // Get full tracking data
  const getFullTrackingData = useCallback((): AffiliateTrackingData | null => {
    return getTrackingData()
  }, [])

  // Update tracking status (for cart/purchase events)
  const updateTrackingStatus = useCallback(async (
    status: 'added_to_cart' | 'purchased',
    orderData?: {
      orderId: string
      orderValue: number
      customerId: string
      customerEmail: string
      commission: number
    }
  ) => {
    const trackingData = getTrackingData()
    if (!trackingData) return

    try {
      await firebaseAffiliateService.updateTrackingStatus(
        trackingData.sessionId,
        status,
        orderData
      )

      // If purchased, mark as applied
      if (status === 'purchased') {
        markAsApplied()
      }
    } catch (error) {
      console.error('Failed to update tracking status:', error)
    }
  }, [])

  return {
    getActiveAffiliateCode,
    hasActiveAffiliateCode,
    getFullTrackingData,
    clearTrackingData,
    updateTrackingStatus,
    trackAffiliateVisit
  }
}