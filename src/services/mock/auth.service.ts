// Mock authentication service implementing invite-only system
import { User, InviteCode } from '../../types'

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
    expiresAt: new Date('2025-12-31'),
    createdAt: new Date('2024-01-01'),
  },
]

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
    if (email === 'rosie@lovingyourskin.net' && password === 'Rtiylysp07!') {
      validPassword = true
    } else if (email === 'julie@lovingyourskin.net' && password === 'Jtiylysp07!') {
      validPassword = true
    } else if (password === 'password123') {
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
    
    const invite = mockInviteCodes.find(i => i.code === code && !i.used)
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
    invite.used = true
    
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
}