import { useEffect } from 'react'
import { useAffiliateTracking } from '../../hooks/useAffiliateTracking'
import { useConsumerCartStore } from '../../stores/consumer-cart.store'
import { firebaseAffiliateService } from '../../services/firebase/affiliate.service'

export const AffiliateCodeAutoApply = () => {
  const { getActiveAffiliateCode, hasActiveAffiliateCode } = useAffiliateTracking()
  const { affiliateCode, setAffiliateCode } = useConsumerCartStore()

  useEffect(() => {
    const applyAffiliateCode = async () => {
      // Check if we have an active affiliate code from tracking
      if (hasActiveAffiliateCode() && !affiliateCode) {
        const trackedCode = getActiveAffiliateCode()
        
        if (trackedCode) {
          try {
            // Validate and get the affiliate code details
            const validation = await firebaseAffiliateService.validateAffiliateCode(trackedCode)
            
            if (validation.valid && validation.affiliateCode) {
              // Apply the affiliate code to the cart
              const discount = validation.affiliateCode.discountType !== 'none' ? {
                type: validation.affiliateCode.discountType,
                value: validation.affiliateCode.discountValue
              } : undefined
              
              setAffiliateCode(trackedCode, discount)
              
              // Don't show a toast here - let the cart/checkout show it
              console.log(`Auto-applied affiliate code: ${trackedCode}`)
            }
          } catch (error) {
            console.error('Failed to auto-apply affiliate code:', error)
          }
        }
      }
    }

    applyAffiliateCode()
  }, [hasActiveAffiliateCode, getActiveAffiliateCode, affiliateCode, setAffiliateCode])

  return null
}