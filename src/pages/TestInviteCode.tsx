import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Layout } from '../components/layout'
import { Section, Container } from '../components/layout'
import { Button, Card, CardContent } from '../components/ui'
import { authService } from '../services'
import { useAuthStore } from '../stores/auth.store'

export const TestInviteCode: React.FC = () => {
  const { user } = useAuthStore()
  const [inviteCode, setInviteCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const handleCreateInvite = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await authService.generateInviteCode({
        email: 'test.retailer@example.com',
        role: 'retailer',
        companyId: 'test-company-1',
        salesRepId: 'rep-1',
        createdBy: user?.id || 'admin',
        expiresInDays: 30
      })
      
      setInviteCode(result.code)
      setSuccess(`Invite code created successfully: ${result.code}`)
      toast.success(`Invite code created: ${result.code}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create invite code')
      toast.error(err.message || 'Failed to create invite code')
    } finally {
      setLoading(false)
    }
  }

  const handleListInvites = async () => {
    setLoading(true)
    setError('')
    
    try {
      const invites = await authService.getAllInviteCodes()
      console.log('All invite codes:', invites)
      setSuccess(`Found ${invites.length} invite codes. Check console for details.`)
      toast.success(`Found ${invites.length} invite codes`)
    } catch (err: any) {
      setError(err.message || 'Failed to list invite codes')
      toast.error(err.message || 'Failed to list invite codes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Section className="py-8">
        <Container>
          <h1 className="text-3xl font-light text-deep-charcoal mb-8">Test Invite Code Creation</h1>
          
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current User:</p>
                  <p className="font-medium">{user?.email || 'Not logged in'}</p>
                  <p className="text-sm text-gray-600">Role: {user?.role || 'N/A'}</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleCreateInvite} 
                    disabled={loading || !user}
                    fullWidth
                  >
                    {loading ? 'Creating...' : 'Create Test Invite Code'}
                  </Button>
                  
                  <Button 
                    onClick={handleListInvites} 
                    disabled={loading || !user}
                    variant="secondary"
                    fullWidth
                  >
                    {loading ? 'Loading...' : 'List All Invite Codes'}
                  </Button>
                </div>

                {inviteCode && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-medium text-green-800">Invite Code:</p>
                    <p className="font-mono text-lg text-green-900">{inviteCode}</p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800">Error:</p>
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-medium text-green-800">Success:</p>
                    <p className="text-green-700">{success}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <h2 className="text-xl font-medium mb-4">Testing Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Make sure you're logged in as an admin user</li>
              <li>Click "Create Test Invite Code" to generate a new invite code</li>
              <li>The code will be displayed if successful</li>
              <li>Click "List All Invite Codes" to see all codes in the console</li>
              <li>Go to <a href="/admin/users" className="text-blue-600 underline">/admin/users</a> to see the full UI</li>
            </ol>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}