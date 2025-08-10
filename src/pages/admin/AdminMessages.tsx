import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { Card, CardContent, Button, Badge } from '../../components/ui'
import { messageService } from '../../services'
import { useAuthStore } from '../../stores/auth.store'
import type { ContactMessage } from '../../types'

export const AdminMessages: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'urgent'>('all')

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    loadMessages()
  }, [user, navigate])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const data = await messageService.getContactMessages()
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messageService.updateMessageStatus(messageId, 'read')
      await loadMessages()
    } catch (error) {
      console.error('Failed to update message status:', error)
    }
  }

  const handleMarkAsUrgent = async (messageId: string, isUrgent: boolean) => {
    try {
      await messageService.updateMessagePriority(messageId, isUrgent ? 'urgent' : 'normal')
      await loadMessages()
    } catch (error) {
      console.error('Failed to update message priority:', error)
    }
  }

  const filteredMessages = messages.filter(message => {
    switch (filter) {
      case 'unread':
        return message.status === 'unread'
      case 'read':
        return message.status === 'read'
      case 'urgent':
        return message.priority === 'urgent'
      default:
        return true
    }
  })

  const getStatusBadge = (message: ContactMessage) => {
    if (message.priority === 'urgent') {
      return <Badge variant="error">Urgent</Badge>
    }
    if (message.status === 'unread') {
      return <Badge variant="warning">New</Badge>
    }
    return <Badge variant="default">Read</Badge>
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-gold mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading messages...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-medium text-deep-charcoal">Contact Messages</h1>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setFilter('all')}
            >
              All ({messages.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setFilter('unread')}
            >
              Unread ({messages.filter(m => m.status === 'unread').length})
            </Button>
            <Button
              variant={filter === 'urgent' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setFilter('urgent')}
            >
              Urgent ({messages.filter(m => m.priority === 'urgent').length})
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 space-y-4">
            {filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-text-secondary">No messages found</p>
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map(message => (
                <Card
                  key={message.id}
                  variant={selectedMessage?.id === message.id ? 'interactive' : 'default'}
                  className={`cursor-pointer transition-all ${
                    message.status === 'unread' ? 'border-rose-gold' : ''
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-deep-charcoal">
                        {message.senderName}
                      </h3>
                      {getStatusBadge(message)}
                    </div>
                    <p className="text-sm text-text-secondary mb-1">
                      {message.senderCompany}
                    </p>
                    <p className="text-sm text-text-secondary mb-2">
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-medium text-deep-charcoal mb-1">
                        {selectedMessage.senderName}
                      </h2>
                      <p className="text-text-secondary">
                        {selectedMessage.senderCompany}
                      </p>
                    </div>
                    {getStatusBadge(selectedMessage)}
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Email</label>
                      <p className="text-deep-charcoal">
                        <a href={`mailto:${selectedMessage.senderEmail}`} className="text-rose-gold hover:underline">
                          {selectedMessage.senderEmail}
                        </a>
                      </p>
                    </div>

                    {selectedMessage.senderPhone && (
                      <div>
                        <label className="text-sm font-medium text-text-secondary">Phone</label>
                        <p className="text-deep-charcoal">
                          <a href={`tel:${selectedMessage.senderPhone}`} className="text-rose-gold hover:underline">
                            {selectedMessage.senderPhone}
                          </a>
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-text-secondary">Subject</label>
                      <p className="text-deep-charcoal">{selectedMessage.subject}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text-secondary">Message</label>
                      <p className="text-deep-charcoal whitespace-pre-wrap">
                        {selectedMessage.content}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text-secondary">Received</label>
                      <p className="text-deep-charcoal">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {selectedMessage.status === 'unread' && (
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      variant={selectedMessage.priority === 'urgent' ? 'secondary' : 'primary'}
                      size="small"
                      onClick={() => handleMarkAsUrgent(
                        selectedMessage.id, 
                        selectedMessage.priority !== 'urgent'
                      )}
                    >
                      {selectedMessage.priority === 'urgent' ? 'Remove Urgent' : 'Mark as Urgent'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => window.open(`mailto:${selectedMessage.senderEmail}?subject=Re: ${selectedMessage.subject}`)}
                    >
                      Reply by Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <p className="text-text-secondary">
                    Select a message to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>
    </Layout>
  )
}