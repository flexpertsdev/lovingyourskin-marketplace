import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Button } from '../components/ui'
import { useAuthStore } from '../stores/auth.store'
import { cn } from '../lib/utils/cn'

interface TabProps {
  label: string
  value: string
  isActive: boolean
  onClick: () => void
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-6 py-3 font-medium transition-colors border-b-2',
      isActive
        ? 'text-rose-gold border-rose-gold'
        : 'text-text-secondary border-transparent hover:text-text-primary'
    )}
  >
    {label}
  </button>
)

interface ProfileData {
  firstName: string
  lastName: string
  phone: string
  companyName: string
  vatNumber: string
  companyAddress: string
  businessType: string
  language: string
  currency: string
  emailNotifications: {
    orderUpdates: boolean
    newProducts: boolean
    promotions: boolean
    announcements: boolean
  }
}

export const Profile: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  
  // Initialize profile data from localStorage or defaults
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    const savedData = localStorage.getItem(`profile-${user?.id}`)
    if (savedData) {
      return JSON.parse(savedData)
    }
    
    // Default values - no fake data
    return {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      phone: '',
      companyName: '',
      vatNumber: '',
      companyAddress: '',
      businessType: 'Retail Store',
      language: user?.language || 'en',
      currency: 'GBP',
      emailNotifications: {
        orderUpdates: true,
        newProducts: true,
        promotions: false,
        announcements: true
      }
    }
  })
  
  // Save to localStorage whenever profileData changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`profile-${user.id}`, JSON.stringify(profileData))
    }
  }, [profileData, user?.id])
  
  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleNotificationChange = (field: string, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [field]: value
      }
    }))
  }
  
  const handleSave = () => {
    setSaveStatus('Changes saved successfully!')
    setTimeout(() => setSaveStatus(null), 3000)
  }
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-background-gray">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-light">My Profile</h1>
            <Button 
              variant="secondary" 
              size="small"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-border-gray mb-8">
            <Tab
              label="Account Details"
              value="account"
              isActive={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
            />
            <Tab
              label="Company Info"
              value="company"
              isActive={activeTab === 'company'}
              onClick={() => setActiveTab('company')}
            />
            <Tab
              label="Preferences"
              value="preferences"
              isActive={activeTab === 'preferences'}
              onClick={() => setActiveTab('preferences')}
            />
            <Tab
              label="Security"
              value="security"
              isActive={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
            />
          </div>
          
          {/* Save Status */}
          {saveStatus && (
            <div className="mb-4 p-4 bg-success-green/10 text-success-green rounded-lg">
              {saveStatus}
            </div>
          )}
          
          {/* Content */}
          <div className="max-w-4xl">
            {activeTab === 'account' && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-xl font-medium mb-6">Account Details</h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-border-gray rounded-lg bg-background-gray cursor-not-allowed"
                    />
                    <p className="text-xs text-text-secondary mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+44 20 1234 5678"
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="w-full px-4 py-2 border border-border-gray rounded-lg bg-background-gray cursor-not-allowed capitalize"
                    />
                  </div>
                  
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            )}
            
            {activeTab === 'company' && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-xl font-medium mb-6">Company Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter your company name"
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      VAT Number
                    </label>
                    <input
                      type="text"
                      value={profileData.vatNumber}
                      onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                      placeholder="e.g., GB123456789"
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Company Address
                    </label>
                    <textarea
                      rows={3}
                      value={profileData.companyAddress}
                      onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                      placeholder="Enter your company address"
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Business Type
                    </label>
                    <select 
                      value={profileData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    >
                      <option value="Retail Store">Retail Store</option>
                      <option value="Online Retailer">Online Retailer</option>
                      <option value="Beauty Salon">Beauty Salon</option>
                      <option value="Spa">Spa</option>
                      <option value="Department Store">Department Store</option>
                      <option value="K-Beauty Brand">K-Beauty Brand</option>
                      <option value="Distributor">Distributor</option>
                    </select>
                  </div>
                  
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            )}
            
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-xl font-medium mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Language
                    </label>
                    <select 
                      value={profileData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    >
                      <option value="en">English</option>
                      <option value="ko">한국어</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Currency
                    </label>
                    <select 
                      value={profileData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    >
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="CHF">CHF (Fr)</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={profileData.emailNotifications.orderUpdates}
                          onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
                          className="w-4 h-4 text-rose-gold" 
                        />
                        <span>Order updates</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={profileData.emailNotifications.newProducts}
                          onChange={(e) => handleNotificationChange('newProducts', e.target.checked)}
                          className="w-4 h-4 text-rose-gold" 
                        />
                        <span>New product launches</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={profileData.emailNotifications.promotions}
                          onChange={(e) => handleNotificationChange('promotions', e.target.checked)}
                          className="w-4 h-4 text-rose-gold" 
                        />
                        <span>Promotional offers</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={profileData.emailNotifications.announcements}
                          onChange={(e) => handleNotificationChange('announcements', e.target.checked)}
                          className="w-4 h-4 text-rose-gold" 
                        />
                        <span>Important announcements</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button onClick={handleSave}>Save Preferences</Button>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-xl font-medium mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-soft-pink rounded-lg">
                    <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <Button variant="secondary" size="small">Enable 2FA</Button>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                        />
                        <p className="text-xs text-text-secondary mt-1">
                          Minimum 12 characters, include uppercase, lowercase, numbers and symbols
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => {
                    alert('Password update functionality would be implemented here')
                  }}>Update Password</Button>
                  
                  <div className="pt-6 border-t border-border-gray">
                    <h3 className="font-medium mb-4 text-error-red">Danger Zone</h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="ghost" className="text-error-red hover:bg-error-red/10">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}