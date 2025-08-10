import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { firebaseDiscountService } from '../../services/firebase/discount.service'
import { useConsumerCartStore } from '../../stores/consumer-cart.store'
import { useAuthStore } from '../../stores/auth.store'
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
  const { affiliateCode, setAffiliateCode, getSubtotal, items } = useConsumerCartStore()
  const { user } = useAuthStore()

  const handleApplyCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter a discount code')
      return
    }

    setLoading(true)
    try {
      const subtotal = getSubtotal()
      
      // Get product and brand IDs from cart
      const productIds = items.map(item => item.product.id)
      const brandIds = [...new Set(items.map(item => item.product.brandId))]
      
      // Validate the discount code with order details
      const validation = await firebaseDiscountService.validateDiscountCode(code, {
        customerId: user?.id,
        orderValue: subtotal,
        productIds,
        brandIds,
        isNewCustomer: !user?.createdAt || (new Date().getTime() - new Date(user.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000 // New if account < 30 days
      })
      
      if (!validation.valid || !validation.discountCode) {
        toast.error(validation.error || 'Invalid discount code')
        return
      }

      const discountData = validation.discountCode
      
      // Apply the discount
      const discount = {
        type: discountData.discountType,
        value: discountData.discountValue
      }

      setAffiliateCode(code.toUpperCase(), discount)
      
      // Call onApply callback if provided
      if (onApply) {
        onApply(code.toUpperCase(), discount)
      }

      toast.success(
        `Discount applied! ${
          discount.type === 'percentage' 
            ? `${discount.value}% off` 
            : `$${discount.value} off`
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