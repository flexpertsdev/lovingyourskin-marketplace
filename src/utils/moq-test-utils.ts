// Test utilities for MOQ validation logic

import { Brand, Product, CartItem } from '../types'
import { calculateMOQStatus } from './discount-helpers'

// Mock product factory for testing MOQ scenarios
export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'test-product',
  brandId: 'test-brand',
  brand: { id: 'test-brand', name: 'Test Brand' },
  category: 'Skincare',
  name: 'Test Product',
  description: 'Test product for MOQ validation',
  slug: 'test-product',
  images: { primary: '', gallery: [] },
  status: 'active',
  featured: false,
  isPreorder: false,
  isB2B: true,
  isB2C: false,
  tags: [],
  variants: [{
    variantId: 'variant-1',
    sku: 'TEST-001',
    isDefault: true,
    status: 'active',
    inventory: {
      b2b: { stock: 1000, available: 1000, reserved: 0 },
      b2c: { stock: 0, available: 0, reserved: 0 }
    },
    pricing: {
      b2b: {
        enabled: true,
        wholesalePrice: 10,
        minOrderQuantity: 1,
        unitsPerCarton: 12,
        currency: 'GBP'
      },
      b2c: {
        enabled: false,
        retailPrice: 20,
        currency: 'GBP'
      }
    }
  }],
  MOQ: 50, // Default MOQ of 50 units
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

// Mock brand factory for testing
export const createMockBrand = (overrides: Partial<Brand> = {}): Brand => ({
  id: 'test-brand',
  slug: 'test-brand',
  name: 'Test Brand',
  tagline: 'Quality skincare',
  description: 'A test brand for MOQ validation',
  logo: '',
  heroImage: '',
  establishedYear: 2020,
  productCount: 5,
  minimumOrder: 100,
  MOA: 3000, // Default MOA of £3000
  country: 'UK',
  certifications: [],
  featureTags: [],
  categories: ['Skincare'],
  stats: {
    yearsInBusiness: 4,
    productsSold: '10K+',
    customerSatisfaction: 95
  },
  active: true,
  featured: false,
  ...overrides
})

// Mock cart item factory
export const createMockCartItem = (
  product: Product, 
  quantity: number,
  overrides: Partial<CartItem> = {}
): CartItem => ({
  id: `cart-${product.id}-${Date.now()}`,
  product,
  quantity,
  addedAt: new Date(),
  ...overrides
})

// Test scenarios for MOQ validation
export const MOQTestScenarios = {
  // Scenario 1: Single product meets MOQ
  singleProductMeetsMonQ: () => {
    const product = createMockProduct({ MOQ: 50 })
    const brand = createMockBrand()
    const cartItem = createMockCartItem(product, 5) // 5 cartons = 60 units (5 * 12)
    
    return {
      brand,
      cartItems: [cartItem],
      expectedResult: {
        met: true,
        status: 'met',
        canCheckout: true
      }
    }
  },

  // Scenario 2: Single product doesn't meet MOQ
  singleProductFailsMOQ: () => {
    const product = createMockProduct({ MOQ: 50 })
    const brand = createMockBrand()
    const cartItem = createMockCartItem(product, 2) // 2 cartons = 24 units (2 * 12)
    
    return {
      brand,
      cartItems: [cartItem],
      expectedResult: {
        met: false,
        status: 'error',
        canCheckout: false,
        remainingItems: 26 // Need 26 more units
      }
    }
  },

  // Scenario 3: MOA exceeded, MOQ waived
  moaExceededMOQWaived: () => {
    const product = createMockProduct({ 
      MOQ: 100,
      variants: [{
        ...createMockProduct().variants[0],
        pricing: {
          ...createMockProduct().variants[0].pricing,
          b2b: {
            ...createMockProduct().variants[0].pricing.b2b,
            wholesalePrice: 200 // £200 per item
          }
        }
      }]
    })
    const brand = createMockBrand({ MOA: 3000 })
    const cartItem = createMockCartItem(product, 2) // 2 cartons = £4800 (200 * 12 * 2)
    
    return {
      brand,
      cartItems: [cartItem],
      expectedResult: {
        met: true,
        status: 'met',
        canCheckout: true,
        moaExceeded: true
      }
    }
  },

  // Scenario 4: Multiple products, mixed MOQ compliance
  multipleProductsMixedMOQ: () => {
    const product1 = createMockProduct({ 
      id: 'product-1', 
      name: 'Product 1',
      MOQ: 50 
    })
    const product2 = createMockProduct({ 
      id: 'product-2', 
      name: 'Product 2',
      MOQ: 30 
    })
    const brand = createMockBrand()
    
    const cartItem1 = createMockCartItem(product1, 5) // 60 units - meets MOQ
    const cartItem2 = createMockCartItem(product2, 1) // 12 units - fails MOQ (needs 30)
    
    return {
      brand,
      cartItems: [cartItem1, cartItem2],
      expectedResult: {
        met: false,
        status: 'warning', // Some products meet MOQ
        canCheckout: false,
        current: 60, // Units that meet MOQ (product1 only)
        required: 80, // Total required (50 + 30)
        remainingItems: 18 // Units needed for product2 (30 - 12)
      }
    }
  },

  // Scenario 5: No MOQ set on products
  noMOQSetAllowed: () => {
    const product = createMockProduct({ MOQ: 0 }) // No MOQ requirement
    const brand = createMockBrand()
    const cartItem = createMockCartItem(product, 1)
    
    return {
      brand,
      cartItems: [cartItem],
      expectedResult: {
        met: true,
        status: 'met',
        canCheckout: true,
        required: 0
      }
    }
  }
}

// Test runner function
export const runMOQTest = (
  testName: string,
  scenario: ReturnType<typeof MOQTestScenarios[keyof typeof MOQTestScenarios]>
) => {
  console.log(`\n🧪 Running MOQ Test: ${testName}`)
  
  const { brand, cartItems, expectedResult } = scenario
  const result = calculateMOQStatus(brand, cartItems, [])
  
  console.log('📊 Test Results:')
  console.log('Expected:', expectedResult)
  console.log('Actual:', {
    met: result.met,
    status: result.status,
    canCheckout: result.canCheckout,
    current: result.current,
    required: result.required,
    remainingItems: result.remainingItems,
    moaExceeded: result.moaExceeded,
    orderTotal: result.orderTotal
  })
  
  // Basic assertions
  const assertions = []
  if (expectedResult.met !== undefined) {
    assertions.push({
      test: 'MOQ Met',
      expected: expectedResult.met,
      actual: result.met,
      passed: expectedResult.met === result.met
    })
  }
  
  if (expectedResult.status) {
    assertions.push({
      test: 'Status',
      expected: expectedResult.status,
      actual: result.status,
      passed: expectedResult.status === result.status
    })
  }
  
  if (expectedResult.canCheckout !== undefined) {
    assertions.push({
      test: 'Can Checkout',
      expected: expectedResult.canCheckout,
      actual: result.canCheckout,
      passed: expectedResult.canCheckout === result.canCheckout
    })
  }
  
  const allPassed = assertions.every(a => a.passed)
  
  console.log('\n✅ Assertions:')
  assertions.forEach(assertion => {
    const icon = assertion.passed ? '✅' : '❌'
    console.log(`${icon} ${assertion.test}: Expected ${assertion.expected}, Got ${assertion.actual}`)
  })
  
  console.log(`\n${allPassed ? '🎉 Test PASSED' : '💥 Test FAILED'}`)
  
  return {
    passed: allPassed,
    result,
    assertions
  }
}

// Run all MOQ tests
export const runAllMOQTests = () => {
  console.log('🚀 Starting MOQ Validation Tests...\n')
  
  const testResults = Object.entries(MOQTestScenarios).map(([testName, scenarioFn]) => 
    runMOQTest(testName, scenarioFn())
  )
  
  const passedTests = testResults.filter(r => r.passed).length
  const totalTests = testResults.length
  
  console.log(`\n📈 Test Summary: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎊 All MOQ tests passed! The logic is working correctly.')
  } else {
    console.log('🔧 Some tests failed. Please review the MOQ logic.')
  }
  
  return testResults
}
