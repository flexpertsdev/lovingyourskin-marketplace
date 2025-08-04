import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Layout } from '../components/layout'
import { orderService } from '../services'
import { cn } from '../lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { MessageThread } from '../types'
import { useAuthStore } from '../stores/auth.store'
import toast from 'react-hot-toast'

interface ThreadWithOrder extends MessageThread {
  order?: {
    id: string
    brandName?: string
    status: string
    retailerName?: string
  }
}

export const Messages: React.FC = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Get all message threads for the current user
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['messageThreads', user?.role, user?.id],
    queryFn: async () => {
      // Get all orders first
      const orders = await orderService.getOrders()
      
      // For each order, get its message thread
      const threadsPromises = orders.map(async (order) => {
        try {
          const thread = await orderService.getOrderMessageThread(order.id)
          if (thread) {
            return {
              ...thread,
              order: {
                id: order.id,
                brandName: order.brandName,
                status: order.status,
                retailerName: order.retailerName
              }
            } as ThreadWithOrder
          }
          return null
        } catch (error) {
          console.error(`Failed to fetch thread for order ${order.id}:`, error)
          return null
        }
      })
      
      const threadsResults = await Promise.all(threadsPromises)
      const validThreads = threadsResults.filter(Boolean) as ThreadWithOrder[]
      
      // Filter threads based on user role
      if (user?.role === 'admin') {
        return validThreads // Admin sees all
      } else if (user?.role === 'retailer') {
        // Retailer sees only their order threads
        return validThreads.filter(thread => 
          thread.participants.some(p => p.userId === user.id && p.role === 'buyer')
        )
      } else if (user?.role === 'brand') {
        // Brand sees only threads where they are a participant
        return validThreads.filter(thread => 
          thread.participants.some(p => p.userId === user.id && p.role === 'brand')
        )
      }
      
      return []
    },
    enabled: !!user
  })
  
  // Get messages for selected thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['threadMessages', selectedThreadId],
    queryFn: async () => {
      if (!selectedThreadId) return []
      return await orderService.getThreadMessages(selectedThreadId)
    },
    enabled: !!selectedThreadId
  })
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string, content: string }) => {
      if (!user) throw new Error('User not authenticated')
      
      // Map user role to message sender role
      const mapUserRoleToSenderRole = (userRole: string) => {
        if (userRole === 'admin') return 'lys_team'
        if (userRole === 'retailer') return 'buyer'
        return userRole as 'brand' | 'buyer' | 'lys_team'
      }
      
      return await orderService.sendMessage(threadId, {
        content,
        senderId: user.id,
        senderName: user.name,
        senderRole: mapUserRoleToSenderRole(user.role),
        threadId
      })
    },
    onSuccess: () => {
      setMessageInput('')
      queryClient.invalidateQueries({ queryKey: ['threadMessages', selectedThreadId] })
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] })
    },
    onError: (error) => {
      toast.error('Failed to send message')
      console.error('Send message error:', error)
    }
  })
  
  // Mark messages as read when thread is selected
  useEffect(() => {
    if (selectedThreadId && user) {
      orderService.markMessagesAsRead(selectedThreadId, user.id).catch(console.error)
    }
  }, [selectedThreadId, user])
  
  const selectedThread = threads.find(t => t.id === selectedThreadId)
  
  return (
    <Layout>
      <div className="min-h-screen bg-background-gray">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-light mb-8">Messages</h1>
          
          {threadsLoading ? (
            <div className="text-center py-8">Loading conversations...</div>
          ) : threads.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-text-secondary">
              No conversations yet
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Thread List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border-gray">
                  <h2 className="font-medium">All Conversations</h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {threads.length} {threads.length === 1 ? 'order' : 'orders'}
                  </p>
                </div>
                <div className="overflow-y-auto h-full">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={cn(
                        'w-full p-4 text-left hover:bg-soft-pink-hover transition-colors border-b border-border-gray',
                        selectedThreadId === thread.id && 'bg-soft-pink'
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">
                          {thread.order?.brandName || 'Order'}
                        </div>
                        {thread.unreadCount > 0 && (
                          <span className="bg-rose-gold text-white text-xs px-2 py-1 rounded-full">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-secondary">
                        Order #{thread.orderId}
                        {thread.order?.retailerName && user?.role === 'admin' && (
                          <span className="ml-1">• {thread.order.retailerName}</span>
                        )}
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        {thread.lastMessage ? (
                          <>
                            <span className="block truncate">
                              {thread.lastMessage.senderName}: {thread.lastMessage.content}
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(thread.lastMessage.createdAt), { addSuffix: true })}
                            </span>
                          </>
                        ) : (
                          'No messages yet'
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            
              {/* Message View */}
              <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
                {selectedThreadId && selectedThread ? (
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-border-gray">
                      <h3 className="font-medium">{selectedThread.order?.brandName || 'Order'}</h3>
                      <p className="text-sm text-text-secondary">
                        Order #{selectedThread.orderId} • Status: {selectedThread.order?.status}
                      </p>
                      {/* Show participants for admin */}
                      {user?.role === 'admin' && (
                        <div className="text-xs text-text-secondary mt-1">
                          Participants: {selectedThread.participants.map(p => p.name).join(', ')}
                        </div>
                      )}
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messagesLoading ? (
                        <div className="text-center py-4 text-text-secondary">Loading messages...</div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-text-secondary">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isCurrentUser = message.senderId === user?.id
                          
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                'flex',
                                isCurrentUser ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <div className={cn('max-w-[70%]', !isCurrentUser && 'flex items-start gap-2')}>
                                {!isCurrentUser && (
                                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                                    {message.senderName?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  {!isCurrentUser && (
                                    <div className="text-xs text-text-secondary mb-1">
                                      {message.senderName} 
                                      {message.senderRole && <span className="ml-1">({message.senderRole})</span>}
                                    </div>
                                  )}
                                  <div
                                    className={cn(
                                      'rounded-lg px-4 py-2',
                                      isCurrentUser
                                        ? 'bg-rose-gold text-white'
                                        : 'bg-background-gray'
                                    )}
                                  >
                                    <div className="text-sm">{message.content}</div>
                                    <div className={cn(
                                      'text-xs mt-1',
                                      isCurrentUser ? 'text-white/70' : 'text-text-secondary'
                                    )}>
                                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                    
                    {/* Input */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (messageInput.trim() && selectedThreadId) {
                          sendMessageMutation.mutate({
                            threadId: selectedThreadId,
                            content: messageInput.trim()
                          })
                        }
                      }}
                      className="p-4 border-t border-border-gray"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                          disabled={sendMessageMutation.isPending}
                        />
                        <button 
                          type="submit"
                          disabled={!messageInput.trim() || sendMessageMutation.isPending}
                          className="px-6 py-2 bg-rose-gold text-white rounded-lg hover:bg-rose-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-text-secondary">
                    Select a conversation to view messages
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}