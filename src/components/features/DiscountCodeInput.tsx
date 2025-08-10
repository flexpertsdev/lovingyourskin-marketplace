import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { firebaseAffiliateService } from '../../services/firebase/affiliate.service'
import { useConsumerCartStore } from '../../stores/consumer-cart.store'
import toast from 'react-hot-toast'

interface DiscountCodeInputProps {
  className?: string
  onApply?: (code: string, discount: { type: 'percentage' | 'fixed', value: number }) => void
}

export const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({ 
  className = '',
  onApply 
}) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const { affiliateCode, setAffiliateCode } = useConsumerCartStore()

  const handleApplyCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter a discount code')
      return
    }

    setLoading(true)
    try {
      // Validate the affiliate code
      const validation = await firebaseAffiliateService.validateAffiliateCode(code)
      
      if (!validation.valid || !validation.affiliateCode) {
        toast.error(validation.error || 'Invalid discount code')
        return
      }

      const affiliateData = validation.affiliateCode
      
      // Check if code is expired
      if (affiliateData.validUntil && new Date(affiliateData.validUntil) < new Date()) {
        toast.error('This discount code has expired')
        return
      }

      // Check usage limits
      if (affiliateData.maxUses && affiliateData.currentUses >= affiliateData.maxUses) {
        toast.error('This discount code has reached its usage limit')
        return
      }

      // Apply the discount
      const discount = {
        type: affiliateData.discountType as 'percentage' | 'fixed',
        value: affiliateData.discountValue
      }

      setAffiliateCode(code.toUpperCase(), discount)
      
      // Call onApply callback if provided
      if (onApply) {
        onApply(code.toUpperCase(), discount)
      }

      // Track the usage
      await firebaseAffiliateService.trackAffiliateClick({
        affiliateCodeId: affiliateData.id,
        affiliateCode: code.toUpperCase(),
        sessionId: `manual-${Date.now()}`,
        landingPage: window.location.href,
        userAgent: navigator.userAgent
      })

      toast.success(
        `Discount applied! ${
          discount.type === 'percentage' 
            ? `${discount.value}% off` 
            : `£${discount.value} off`
        }`
      )
      
      setCode('')
      setShowInput(false)
    } catch (error) {
      console.error('Error applying discount code:', error)
      toast.error('Failed to apply discount code')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCode = () => {
    setAffiliateCode(undefined, undefined)
    toast.success('Discount code removed')
  }

  // If a code is already applied, show it
  if (affiliateCode) {
    return (
      <div className={`bg-green-50 border border-green-200 p-3 rounded-md ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-800">
              Discount code <strong>{affiliateCode}</strong> applied
            </span>
          </div>
          <button
            onClick={handleRemoveCode}
            className="text-sm text-green-600 hover:text-green-700 underline"
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  // Show input field
  if (showInput) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter discount code"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleApplyCode()
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleApplyCode}
            disabled={loading || !code.trim()}
            variant="secondary"
            size="small"
          >
            {loading ? 'Applying...' : 'Apply'}
          </Button>
          <Button
            onClick={() => {
              setShowInput(false)
              setCode('')
            }}
            variant="ghost"
            size="small"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Show link to open input
  return (
    <button
      onClick={() => setShowInput(true)}
      className={`text-sm text-rose-gold hover:text-rose-gold-dark underline ${className}`}
    >
      Have a discount code?
    </button>
  )
}