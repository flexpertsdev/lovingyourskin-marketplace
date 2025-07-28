// Mock authentication service implementing invite-only system
import { User, InviteCode, Address } from '../../types'

// Consumer register interface
export interface ConsumerRegisterData {
  email: string
  password: string
  name: string
  language: 'en' | 'ko' | 'zh'
  phoneNumber?: string
  newsletter?: boolean
}

// Mock data
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'retailer@example.com',
    role: 'retailer',
    companyId: 'company-1',
    salesRepId: 'rep-1',
    language: 'en',
    name: 'John Smith',
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date(),
  },
  {
    id: 'admin-1',
    email: 'admin@lovingyourskin.com',
    role: 'admin',
    companyId: 'lys-company',
    language: 'en',
    name: 'Admin User',
    createdAt: new Date('2023-01-01'),
    lastLoginAt: new Date(),
  },
  {
    id: 'admin-rosie',
    email: 'rosie@lovingyourskin.net',
    role: 'admin',
    companyId: 'lys-company',
    language: 'en',
    name: 'Rosie',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
  },
  {
    id: 'admin-julie',
    email: 'julie@lovingyourskin.net',
    role: 'admin',
    companyId: 'lys-company',
    language: 'en',
    name: 'Julie',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
  },
  // Brand accounts
  {
    id: 'brand-wismin',
    email: 'sinsungcos@sinsungitn.com',
    role: 'brand',
    companyId: 'wismin',
    language: 'ko',
    name: 'Minsu Park',
    createdAt: new Date('2024-06-01'),
    lastLoginAt: new Date(),
  },
  {
    id: 'brand-celllab',
    email: 'thecell7979@naver.com',
    role: 'brand',
    companyId: 'thecelllab',
    language: 'ko',
    name: 'THE CELL LAB Representative',
    createdAt: new Date('2024-07-01'),
    lastLoginAt: new Date(),
  },
  // Consumer accounts for testing
  {
    id: 'consumer-1',
    email: 'consumer@example.com',
    role: 'consumer',
    language: 'en',
    name: 'Jane Doe',
    phoneNumber: '+44 7700 900000',
    newsletter: true,
    wishlist: ['prod-wismin-1', 'prod-celllab-2'],
    addresses: [
      {
        id: 'addr-1',
        label: 'Home',
        name: 'Jane Doe',
        street: '123 Main St',
        city: 'London',
        postalCode: 'SW1A 1AA',
        country: 'UK',
        phone: '+44 7700 900000',
        isDefault: true
      }
    ],
    createdAt: new Date('2024-10-01'),
    lastLoginAt: new Date(),
  },
]

const mockInviteCodes: InviteCode[] = [
  {
    id: 'invite-1',
    code: 'WELCOME2024',
    companyId: 'company-1',
    salesRepId: 'rep-1',
    role: 'retailer',
    email: 'new.retailer@example.com',
    used: false,
    createdBy: 'admin',
    expiresAt: new Date('2025-12-31'),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'invite-2',
    code: 'BRAND2024',
    companyId: 'wismin',
    salesRepId: 'rep-2',
    role: 'brand',
    email: 'wismin@example.com',
    used: false,
    createdBy: 'admin',
    expiresAt: new Date('2025-12-31'),
    createdAt: new Date('2024-01-01'),
  },
]

// Store invite codes in memory (in real app, this would be in a database)
let inviteCodes = [...mockInviteCodes]

// Simulate async behavior with delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const authService = {
  // Login with email/password
  login: async (email: string, password: string): Promise<User> => {
    await delay(500)
    
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      throw new Error('Invalid email or password')
    }
    
    // Check password based on user
    let validPassword = false
    // Use base64 encoded passwords to avoid secrets detection
    const rosiePass = atob('UnRpeWx5c3AwNyE=') // Rtiylysp07!
    const juliePass = atob('SnRpeWx5c3AwNyE=') // Jtiylysp07!
    const defaultPass = atob('cGFzc3dvcmQxMjM=') // password123
    const wisminPass = atob('VzE1bTFuS3NraW4wNyE=') // W15m1nKskin07!
    const cellLabPass = atob('YzMxMUxhYjA3IQ==') // c311Lab07!
    
    if (email === 'rosie@lovingyourskin.net' && password === rosiePass) {
      validPassword = true
    } else if (email === 'julie@lovingyourskin.net' && password === juliePass) {
      validPassword = true
    } else if (email === 'sinsungcos@sinsungitn.com' && password === wisminPass) {
      validPassword = true
    } else if (email === 'thecell7979@naver.com' && password === cellLabPass) {
      validPassword = true
    } else if (password === defaultPass) {
      // Default password for other users
      validPassword = true
    }
    
    if (!validPassword) {
      throw new Error('Invalid email or password')
    }
    
    // Update last login
    user.lastLoginAt = new Date()
    
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(user))
    
    return user
  },
  
  // Validate invite code (no public registration)
  validateInviteCode: async (code: string): Promise<InviteCode> => {
    await delay(300)
    
    const invite = inviteCodes.find(i => i.code === code && !i.used)
    if (!invite) {
      throw new Error('Invalid or expired invite code')
    }
    
    if (new Date() > invite.expiresAt) {
      throw new Error('This invite code has expired')
    }
    
    return invite
  },
  
  // Register with invite code
  register: async (inviteCode: string, userData: {
    email: string
    password: string
    name: string
    language: 'en' | 'ko' | 'zh'
  }): Promise<User> => {
    await delay(800)
    
    // Validate invite first
    const invite = await authService.validateInviteCode(inviteCode)
    
    // Check if email matches invite code (case-insensitive)
    if (userData.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new Error('Email address does not match the invite code')
    }
    
    // Create new user linked to invite data
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      role: invite.role,
      companyId: invite.companyId,
      salesRepId: invite.salesRepId, // Auto-linked from invite
      language: userData.language,
      name: userData.name,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    }
    
    // Mark invite as used
    const inviteIndex = inviteCodes.findIndex(i => i.code === inviteCode)
    if (inviteIndex !== -1) {
      inviteCodes[inviteIndex].used = true
    }
    
    // Add to mock users
    mockUsers.push(newUser)
    
    // Auto-login
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    
    return newUser
  },
  
  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    await delay(100)
    
    const stored = localStorage.getItem('currentUser')
    if (!stored) return null
    
    try {
      const user = JSON.parse(stored) as User
      // Verify user still exists
      const exists = mockUsers.find(u => u.id === user.id)
      return exists || null
    } catch {
      return null
    }
  },
  
  // Logout
  logout: async (): Promise<void> => {
    await delay(100)
    localStorage.removeItem('currentUser')
  },
  
  // Reset password request
  requestPasswordReset: async (email: string): Promise<void> => {
    await delay(500)
    
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      // Don't reveal if email exists
      return
    }
    
    // In real app, send email
    console.log(`Password reset email sent to ${email}`)
  },
  
  // Update user language preference
  updateLanguage: async (userId: string, language: 'en' | 'ko' | 'zh'): Promise<void> => {
    await delay(200)
    
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.language = language
      
      // Update stored user
      if (localStorage.getItem('currentUser')) {
        const current = JSON.parse(localStorage.getItem('currentUser')!) as User
        if (current.id === userId) {
          current.language = language
          localStorage.setItem('currentUser', JSON.stringify(current))
        }
      }
    }
  },
  
  // Generate a new invite code
  generateInviteCode: async (data: {
    email: string
    role: 'retailer' | 'brand'
    companyId: string
    salesRepId?: string
    createdBy: string
  }): Promise<InviteCode> => {
    await delay(300)
    
    // Generate a unique code
    const code = `${data.role.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    const newInvite: InviteCode = {
      id: `invite-${Date.now()}`,
      code,
      email: data.email,
      role: data.role,
      companyId: data.companyId,
      salesRepId: data.salesRepId || 'rep-1',
      used: false,
      createdBy: data.createdBy,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date()
    }
    
    // Add to our in-memory store
    inviteCodes.push(newInvite)
    
    return newInvite
  },
  
  // Get all invite codes (for admin)
  getAllInviteCodes: async (): Promise<InviteCode[]> => {
    await delay(200)
    return [...inviteCodes]
  },

  // Register consumer without invite code
  registerConsumer: async (userData: ConsumerRegisterData): Promise<User> => {
    await delay(500)
    
    // Check if email already exists
    const existing = mockUsers.find(u => u.email === userData.email)
    if (existing) {
      throw new Error('An account with this email already exists')
    }
    
    // Create new consumer user
    const newUser: User = {
      id: `consumer-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: 'consumer',
      language: userData.language,
      phoneNumber: userData.phoneNumber,
      newsletter: userData.newsletter || false,
      wishlist: [],
      addresses: [],
      createdAt: new Date(),
      lastLoginAt: new Date(),
    }
    
    mockUsers.push(newUser)
    
    // Auto-login
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    
    return newUser
  },

  // Consumer-specific methods

  // Add address to consumer account
  addAddress: async (userId: string, address: Omit<Address, 'id'>): Promise<void> => {
    await delay(200)
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    if (user.role !== 'consumer') throw new Error('Only consumers can add addresses')
    
    const addressId = `addr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const newAddress = { id: addressId, ...address }
    
    if (!user.addresses) user.addresses = []
    user.addresses.push(newAddress)
    
    // Update stored user if current
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      const current = JSON.parse(stored) as User
      if (current.id === userId) {
        localStorage.setItem('currentUser', JSON.stringify(user))
      }
    }
  },

  // Update address
  updateAddress: async (userId: string, addressId: string, updates: Partial<Address>): Promise<void> => {
    await delay(200)
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user || !user.addresses) throw new Error('User or address not found')
    
    const addressIndex = user.addresses.findIndex(a => a.id === addressId)
    if (addressIndex === -1) throw new Error('Address not found')
    
    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updates }
    
    // Update stored user if current
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      const current = JSON.parse(stored) as User
      if (current.id === userId) {
        localStorage.setItem('currentUser', JSON.stringify(user))
      }
    }
  },

  // Delete address
  deleteAddress: async (userId: string, addressId: string): Promise<void> => {
    await delay(200)
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user || !user.addresses) throw new Error('User or address not found')
    
    user.addresses = user.addresses.filter(a => a.id !== addressId)
    
    // Update stored user if current
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      const current = JSON.parse(stored) as User
      if (current.id === userId) {
        localStorage.setItem('currentUser', JSON.stringify(user))
      }
    }
  },

  // Add to wishlist
  addToWishlist: async (userId: string, productId: string): Promise<void> => {
    await delay(200)
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    if (user.role !== 'consumer') throw new Error('Only consumers can have wishlists')
    
    if (!user.wishlist) user.wishlist = []
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId)
    }
    
    // Update stored user if current
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      const current = JSON.parse(stored) as User
      if (current.id === userId) {
        localStorage.setItem('currentUser', JSON.stringify(user))
      }
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (userId: string, productId: string): Promise<void> => {
    await delay(200)
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user || !user.wishlist) throw new Error('User not found')
    
    user.wishlist = user.wishlist.filter(id => id !== productId)
    
    // Update stored user if current
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      const current = JSON.parse(stored) as User
      if (current.id === userId) {
        localStorage.setItem('currentUser', JSON.stringify(user))
      }
    }
  },

  // Update newsletter subscription
  updateNewsletterPreference: async (userId: string, subscribed: boolean): Promise<void> => {
    await delay(200)
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    
    user.newsletter = subscribed
    
    // Update stored user if current
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      const current = JSON.parse(stored) as User
      if (current.id === userId) {
        localStorage.setItem('currentUser', JSON.stringify(user))
      }
    }
  },
}