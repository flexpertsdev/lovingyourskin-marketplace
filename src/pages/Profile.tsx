import React, { useState } from 'react'
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

export const Profile: React.FC = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('account')
  
  return (
    <Layout>
      <div className="min-h-screen bg-background-gray">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-light mb-8">My Profile</h1>
          
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
                        defaultValue="Sarah"
                        className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Mitchell"
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
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+44 20 7123 4567"
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                  
                  <Button>Save Changes</Button>
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
                      defaultValue="Beauty Boutique London"
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      VAT Number
                    </label>
                    <input
                      type="text"
                      defaultValue="GB123456789"
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Company Address
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="123 Oxford Street\nLondon, W1D 1AB\nUnited Kingdom"
                      className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Business Type
                    </label>
                    <select className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold">
                      <option>Retail Store</option>
                      <option>Online Retailer</option>
                      <option>Beauty Salon</option>
                      <option>Spa</option>
                      <option>Department Store</option>
                    </select>
                  </div>
                  
                  <Button>Save Changes</Button>
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
                    <select className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold">
                      <option>English</option>
                      <option>한국어</option>
                      <option>中文</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Currency
                    </label>
                    <select className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold">
                      <option>GBP (£)</option>
                      <option>EUR (€)</option>
                      <option>CHF (Fr)</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-rose-gold" />
                        <span>Order updates</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-rose-gold" />
                        <span>New product launches</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 text-rose-gold" />
                        <span>Promotional offers</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-rose-gold" />
                        <span>Important announcements</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button>Save Preferences</Button>
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
                  
                  <Button>Update Password</Button>
                  
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