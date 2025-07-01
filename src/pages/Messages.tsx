import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '../components/layout'
import { orderService } from '../services/mock/order.service'
import { cn } from '../lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { Message } from '../types'

interface ThreadSummary {
  orderId: string
  brandName: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  orderStatus: string
}

export const Messages: React.FC = () => {
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  
  // Get all orders to create message threads
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders()
  })
  
  // Get selected thread messages
  const { data: threadData } = useQuery({
    queryKey: ['messageThread', selectedThread],
    queryFn: async () => {
      if (!selectedThread) return null
      const thread = await orderService.getMessageThread(selectedThread)
      if (!thread) return null
      // Get messages for the thread
      const messages = await orderService.getMessages(thread.id)
      return { thread, messages }
    },
    enabled: !!selectedThread
  })
  
  // Transform orders into thread summaries
  const threads: ThreadSummary[] = orders.map(order => ({
    orderId: order.id,
    brandName: order.brandName || 'Multiple Brands',
    lastMessage: 'Click to view messages',
    lastMessageTime: new Date(order.createdAt),
    unreadCount: Math.floor(Math.random() * 3), // Mock unread count
    orderStatus: order.status
  }))
  
  const selectedThreadData = threads.find(t => t.orderId === selectedThread)
  
  return (
    <Layout>
      <div className="min-h-screen bg-background-gray">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-light mb-8">Messages</h1>
          
          <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Thread List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border-gray">
                <h2 className="font-medium">All Conversations</h2>
              </div>
              <div className="overflow-y-auto h-full">
                {threads.map((thread) => (
                  <button
                    key={thread.orderId}
                    onClick={() => setSelectedThread(thread.orderId)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-soft-pink-hover transition-colors border-b border-border-gray',
                      selectedThread === thread.orderId && 'bg-soft-pink'
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium">{thread.brandName}</div>
                      {thread.unreadCount > 0 && (
                        <span className="bg-rose-gold text-white text-xs px-2 py-1 rounded-full">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-secondary truncate">
                      Order #{thread.orderId}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {formatDistanceToNow(thread.lastMessageTime, { addSuffix: true })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Message View */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
              {selectedThread && threadData ? (
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-4 border-b border-border-gray">
                    <h3 className="font-medium">{selectedThreadData?.brandName}</h3>
                    <p className="text-sm text-text-secondary">
                      Order #{selectedThread} • Status: {selectedThreadData?.orderStatus}
                    </p>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {threadData.messages?.map((message: Message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.senderId === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-lg px-4 py-2',
                            message.senderId === 'user'
                              ? 'bg-rose-gold text-white'
                              : 'bg-background-gray'
                          )}
                        >
                          <div className="text-sm mb-1">{message.content}</div>
                          <div className={cn(
                            'text-xs',
                            message.senderId === 'user' ? 'text-white/70' : 'text-text-secondary'
                          )}>
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Input */}
                  <div className="p-4 border-t border-border-gray">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:border-rose-gold"
                      />
                      <button className="px-6 py-2 bg-rose-gold text-white rounded-lg hover:bg-rose-gold-dark transition-colors">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">
                  Select a conversation to view messages
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}