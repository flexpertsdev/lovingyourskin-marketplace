import { useEffect, useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { firebaseAffiliateService } from '../services/firebase/affiliate.service'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import { v4 as uuidv4 } from 'uuid'

const AFFILIATE_SESSION_KEY = 'affiliate_session'
const AFFILIATE_CODE_KEY = 'affiliate_code'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

interface AffiliateSession {
  sessionId: string
  affiliateCode: string
  affiliateCodeId: string
  createdAt: number
  expiresAt: number
}

export function useAffiliateTracking() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { setAffiliateCode } = useConsumerCartStore()
  
  // Get or create session
  const getSession = useCallback((): AffiliateSession | null => {
    const sessionStr = localStorage.getItem(AFFILIATE_SESSION_KEY)
    if (!sessionStr) return null
    
    try {
      const session = JSON.parse(sessionStr) as AffiliateSession
      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(AFFILIATE_SESSION_KEY)
        localStorage.removeItem(AFFILIATE_CODE_KEY)
        return null
      }
      return session
    } catch {
      return null
    }
  }, [])
  
  // Save session
  const saveSession = useCallback((session: AffiliateSession) => {
    localStorage.setItem(AFFILIATE_SESSION_KEY, JSON.stringify(session))
    localStorage.setItem(AFFILIATE_CODE_KEY, session.affiliateCode)
    setAffiliateCode(session.affiliateCode)
  }, [setAffiliateCode])
  
  // Track affiliate click
  const trackClick = useCallback(async (code: string) => {
    try {
      // Validate affiliate code
      const validation = await firebaseAffiliateService.validateAffiliateCode(code)
      if (!validation.valid || !validation.affiliateCode) {
        console.warn('Invalid affiliate code:', validation.error)
        return
      }
      
      // Create session
      const sessionId = uuidv4()
      const session: AffiliateSession = {
        sessionId,
        affiliateCode: code,
        affiliateCodeId: validation.affiliateCode.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION
      }
      
      // Track the click
      await firebaseAffiliateService.trackAffiliateClick({
        affiliateCodeId: validation.affiliateCode.id,
        affiliateCode: code,
        sessionId,
        landingPage: window.location.href,
        referrerUrl: document.referrer || undefined,
        userAgent: navigator.userAgent,
        
        // UTM parameters
        utmSource: searchParams.get('utm_source') || undefined,
        utmMedium: searchParams.get('utm_medium') || undefined,
        utmCampaign: searchParams.get('utm_campaign') || undefined,
        utmTerm: searchParams.get('utm_term') || undefined,
        utmContent: searchParams.get('utm_content') || undefined
      })
      
      // Save session
      saveSession(session)
      
      console.log('Affiliate code tracked:', code)
    } catch (error) {
      console.error('Error tracking affiliate code:', error)
    }
  }, [searchParams, saveSession])
  
  // Check for affiliate code in URL
  useEffect(() => {
    // Check UTM parameters for affiliate code
    const utmAffiliate = searchParams.get('utm_affiliate')
    const refCode = searchParams.get('ref')
    const affiliateCode = searchParams.get('affiliate')
    
    const code = utmAffiliate || refCode || affiliateCode
    
    if (code) {
      // Check if we already have a session with different code
      const existingSession = getSession()
      if (!existingSession || existingSession.affiliateCode !== code) {
        trackClick(code)
      }
    } else {
      // Restore existing session if any
      const existingSession = getSession()
      if (existingSession) {
        setAffiliateCode(existingSession.affiliateCode)
      }
    }
  }, [searchParams, trackClick, getSession, setAffiliateCode])
  
  // Track cart updates
  const trackCartUpdate = useCallback(async () => {
    const session = getSession()
    if (!session) return
    
    try {
      await firebaseAffiliateService.updateTrackingStatus(
        session.sessionId,
        'added_to_cart'
      )
    } catch (error) {
      console.error('Error tracking cart update:', error)
    }
  }, [getSession])
  
  // Track purchase
  const trackPurchase = useCallback(async (orderId: string, orderValue: number, commission?: number) => {
    const session = getSession()
    if (!session) return
    
    try {
      await firebaseAffiliateService.updateTrackingStatus(
        session.sessionId,
        'purchased',
        {
          orderId,
          orderValue,
          commission
        }
      )
      
      // Clear session after purchase
      localStorage.removeItem(AFFILIATE_SESSION_KEY)
      localStorage.removeItem(AFFILIATE_CODE_KEY)
      setAffiliateCode(undefined)
    } catch (error) {
      console.error('Error tracking purchase:', error)
    }
  }, [getSession, setAffiliateCode])
  
  return {
    trackCartUpdate,
    trackPurchase,
    currentAffiliateCode: getSession()?.affiliateCode
  }
}