import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/layout'
import { Section, Container } from '../../components/layout'
import { Button, Card, CardContent, Input, Select, Badge } from '../../components/ui'
import { useAuthStore } from '../../stores/auth.store'
import { authService } from '../../services'
import toast from 'react-hot-toast'
import { InviteCode, Brand } from '../../types'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase/config'

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuthStore()
  const [showCreateInvite, setShowCreateInvite] = useState(false)
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: 'retailer' as 'retailer' | 'brand' | 'admin',
    companyId: '',
    salesRepId: '',
    expiresInDays: 30
  })

  // Load invite codes and users on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load invite codes
      const codes = await authService.getAllInviteCodes()
      setInviteCodes(codes || [])
      
      // Load users (if method exists)
      if (authService.getAllUsers) {
        const allUsers = await authService.getAllUsers()
        setUsers(allUsers || [])
      }
      
      // Load brands
      const brandsSnapshot = await getDocs(collection(db, 'brands'))
      const brandsData: Brand[] = []
      brandsSnapshot.forEach((doc) => {
        brandsData.push({ id: doc.id, ...doc.data() } as Brand)
      })
      setBrands(brandsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const inviteData = {
        email: formData.email,
        role: formData.role,
        companyId: formData.companyId || undefined,
        salesRepId: formData.salesRepId || undefined,
        createdBy: currentUser?.id || 'admin',
        expiresInDays: formData.expiresInDays
      }
      
      const result = await authService.generateInviteCode(inviteData)
      
      if (result) {
        toast.success(`Invite code created: ${result.code}`)
        setInviteCodes([result, ...inviteCodes])
        setFormData({
          email: '',
          role: 'retailer',
          companyId: '',
          salesRepId: '',
          expiresInDays: 30
        })
        setShowCreateInvite(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invite code')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('Code copied to clipboard')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }
  
  const copyRegistrationLink = async (code: string, email: string) => {
    try {
      const baseUrl = window.location.origin
      const registrationUrl = `${baseUrl}/register?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`
      await navigator.clipboard.writeText(registrationUrl)
      setCopiedCode(`link-${code}`)
      toast.success('Registration link copied to clipboard')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }
  
  const handleDeleteInvite = async (inviteId: string) => {
    if (!window.confirm('Are you sure you want to delete this invite code?')) {
      return
    }
    
    try {
      await authService.deleteInviteCode(inviteId)
      toast.success('Invite code deleted')
      // Refresh the list
      const codes = await authService.getAllInviteCodes()
      setInviteCodes(codes || [])
    } catch (error) {
      toast.error('Failed to delete invite code')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (date: Date) => {
    return new Date(date) < new Date()
  }

  return (
    <Layout>
      <Section className="py-8">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-light text-deep-charcoal mb-2">User Management</h1>
            <p className="text-text-secondary">Manage users and invite codes</p>
          </div>

          {/* Invite Codes Section */}
          <Card className="mb-8">
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-deep-charcoal">Invite Codes</h2>
                <Button
                  onClick={() => setShowCreateInvite(!showCreateInvite)}
                  size="small"
                >
                  {showCreateInvite ? 'Cancel' : 'Create Invite'}
                </Button>
              </div>

              {showCreateInvite && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-medium mb-4">Create New Invite Code</h3>
                  <form onSubmit={handleCreateInvite} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="retailer@example.com"
                      />
                      
                      <Select
                        label="Role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        required
                        options={[
                          { value: 'retailer', label: 'Retailer' },
                          { value: 'brand', label: 'Brand' },
                          ...(currentUser?.role === 'admin' ? [{ value: 'admin', label: 'Admin' }] : [])
                        ]}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {formData.role === 'brand' ? (
                        <Select
                          label="Brand"
                          value={formData.companyId}
                          onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                          required
                          options={[
                            { value: '', label: 'Select a brand' },
                            ...brands.map(brand => ({
                              value: brand.id,
                              label: brand.name
                            }))
                          ]}
                        />
                      ) : (
                        <Input
                          label="Company ID (Optional)"
                          value={formData.companyId}
                          onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                          placeholder="company-id"
                        />
                      )}
                      
                      <Input
                        label="Sales Rep ID (Optional)"
                        value={formData.salesRepId}
                        onChange={(e) => setFormData({ ...formData, salesRepId: e.target.value })}
                        placeholder="sales-rep-id"
                      />
                    </div>
                    
                    <Input
                      label="Expires In (Days)"
                      type="number"
                      value={formData.expiresInDays}
                      onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                      min="1"
                      max="365"
                      required
                    />
                    
                    <div className="flex gap-3">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Invite Code'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowCreateInvite(false)}
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Invite Codes Table */}
              {inviteCodes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Code</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Brand/Company</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Created</th>
                        <th className="text-left py-3 px-4">Expires</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inviteCodes.map((invite) => (
                        <tr key={invite.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">
                            {invite.code}
                          </td>
                          <td className="py-3 px-4">{invite.email}</td>
                          <td className="py-3 px-4 capitalize">{invite.role}</td>
                          <td className="py-3 px-4">
                            {invite.role === 'brand' && invite.companyId ? (
                              <span className="text-sm">
                                {(() => {
                                  const brand = brands.find(b => b.id === invite.companyId);
                                  if (!brand?.name) return invite.companyId;
                                  return brand.name;
                                })()}
                              </span>
                            ) : invite.companyId ? (
                              <span className="text-sm text-text-secondary">{invite.companyId}</span>
                            ) : (
                              <span className="text-sm text-text-secondary">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {invite.used ? (
                              <Badge variant="success">Used</Badge>
                            ) : isExpired(invite.expiresAt) ? (
                              <Badge variant="error">Expired</Badge>
                            ) : (
                              <Badge variant="warning">Pending</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {formatDate(invite.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {formatDate(invite.expiresAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={() => copyToClipboard(invite.code)}
                                disabled={invite.used || isExpired(invite.expiresAt)}
                              >
                                {copiedCode === invite.code ? 'Copied!' : 'Copy Code'}
                              </Button>
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={() => copyRegistrationLink(invite.code, invite.email)}
                                disabled={invite.used || isExpired(invite.expiresAt)}
                              >
                                {copiedCode === `link-${invite.code}` ? 'Copied!' : 'Copy Link'}
                              </Button>
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={() => handleDeleteInvite(invite.id)}
                                disabled={invite.used}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No invite codes yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Section */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-medium text-deep-charcoal mb-6">Users</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Current user */}
                    {currentUser && (
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{currentUser.name || 'N/A'}</td>
                        <td className="py-3 px-4">{currentUser.email}</td>
                        <td className="py-3 px-4 capitalize">{currentUser.role}</td>
                        <td className="py-3 px-4">{currentUser.companyId || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="success">Active</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {currentUser.createdAt ? formatDate(currentUser.createdAt) : 'N/A'}
                        </td>
                      </tr>
                    )}
                    
                    {/* Other users */}
                    {users
                      .filter(user => user.id !== currentUser?.id)
                      .map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{user.name || 'N/A'}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4 capitalize">{user.role}</td>
                          <td className="py-3 px-4">{user.companyId || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                              {user.status || 'Active'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                
                {users.length === 0 && !currentUser && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </Layout>
  )
}

export default UserManagement