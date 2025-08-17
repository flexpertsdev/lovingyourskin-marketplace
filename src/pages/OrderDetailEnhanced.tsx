import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent, Badge, Input } from '../components/ui'
import { orderService, invoiceService } from '../services'
import { Order, Message, MessageThread, OrderStatus } from '../types'
import { useAuthStore } from '../stores/auth.store'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '../lib/utils/cn'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-gray-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-yellow-500',
  invoiced: 'bg-purple-500',
  paid: 'bg-green-500',
  preparing: 'bg-orange-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-success-green',
  completed: 'bg-success-green'
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  invoiced: 'Invoiced',
  paid: 'Paid',
  preparing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed'
}

export const OrderDetailEnhanced: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [thread, setThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'messages' | 'documents' | 'timeline'>('overview')
  const [processingAction, setProcessingAction] = useState(false)
  
  useEffect(() => {
    if (orderId) {
      loadOrderData()
    }
  }, [orderId])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const loadOrderData = async () => {
    if (!orderId || !user) return
    
    setLoading(true)
    try {
      const orderData = await orderService.getOrder(orderId)
      
      if (orderData) {
        // Check access permissions
        if (user.role === 'retailer' && orderData.retailerId !== user.id && orderData.userId !== user.id) {
          toast.error('Access denied')
          navigate('/orders')
          return
        }
        
        if (user.role === 'brand' && orderData.items.every(item => item.product?.brandId !== user.brandId)) {
          toast.error('Access denied')
          navigate('/orders')
          return
        }
        
        setOrder(orderData)
        
        // Get message thread
        const threadData = await orderService.getMessageThread(orderData.id)
        if (threadData) {
          setThread(threadData)
          
          // Get messages
          const allMessages = await orderService.getMessages(threadData.id)
          setMessages(allMessages)
          
          // Mark messages as read
          await orderService.markMessagesAsRead(threadData.id, user.id)
        }
      }
    } catch (error) {
      console.error('Failed to load order:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !thread || sendingMessage || !user) return
    
    setSendingMessage(true)
    try {
      const messageData = {
        threadId: thread.id,
        content: newMessage.trim(),
        senderId: user.id,
        senderName: user.name || user.email,
        senderRole: user.role === 'retailer' ? 'buyer' as const : 
                    user.role === 'brand' ? 'brand' as const : 
                    'lys_team' as const
      }
      
      const message = await orderService.sendMessage(thread.id, messageData)
      setMessages([...messages, message])
      setNewMessage('')
      
      toast.success('Message sent')
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }
  
  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || processingAction) return
    
    setProcessingAction(true)
    try {
      await orderService.updateOrderStatus(order.id, newStatus)
      toast.success(`Order status updated to ${statusLabels[newStatus]}`)
      loadOrderData()
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setProcessingAction(false)
    }
  }
  
  const handleDownloadInvoice = async () => {
    if (!order) return
    
    try {
      const invoice = await invoiceService.generateInvoice(order.id)
      if (invoice.pdfUrl) {
        window.open(invoice.pdfUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to download invoice:', error)
      toast.error('Failed to download invoice')
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
  
  const formatMessageTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }
  
  const getNextStatusOptions = (): OrderStatus[] => {
    if (!order || user?.role !== 'admin') return []
    
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['invoiced', 'cancelled'],
      'invoiced': ['paid'],
      'paid': ['preparing'],
      'preparing': ['shipped'],
      'shipped': ['delivered'],
      'delivered': ['completed'],
      'completed': []
    }
    
    return statusFlow[order.status] || []
  }
  
  if (loading || !order) {
    return (
      <Layout>
        <Section>
          <Container>
            <div className="text-center py-20">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4 mx-auto"></div>
              </div>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <Section>
        <Container>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Button variant="ghost" size="small" onClick={() => navigate(-1)}>
                    ← Back
                  </Button>
                  <h1 className="text-2xl font-light">Order {order.orderNumber}</h1>
                  <Badge className={`${statusColors[order.status]} text-white`}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <div className="text-text-secondary">
                  <span className="font-medium">{order.brandName}</span> • 
                  Placed {formatDate(order.createdAt)}
                </div>
              </div>
              
              <div className="flex gap-3">
                {order.invoice && (
                  <Button variant="secondary" onClick={handleDownloadInvoice}>
                    📄 Invoice
                  </Button>
                )}
                {user?.role === 'admin' && getNextStatusOptions().length > 0 && (
                  <div className="flex gap-2">
                    {getNextStatusOptions().map(status => (
                      <Button
                        key={status}
                        variant="primary"
                        size="small"
                        onClick={() => handleStatusUpdate(status)}
                        disabled={processingAction}
                      >
                        Mark as {statusLabels[status]}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-border-gray">
              <div className="flex gap-8 px-6">
                {(['overview', 'items', 'messages', 'documents', 'timeline'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'py-4 px-2 border-b-2 transition-colors capitalize',
                      activeTab === tab
                        ? 'border-rose-gold text-rose-gold'
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {tab}
                    {tab === 'messages' && thread?.unreadCount > 0 && (
                      <span className="ml-2 bg-rose-gold text-white text-xs px-2 py-1 rounded-full">
                        {thread.unreadCount}
                      </span>
                    )}
                    {tab === 'documents' && order.documents.length > 0 && (
                      <span className="ml-2 text-xs text-text-secondary">
                        ({order.documents.length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === 'overview' && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Summary */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardContent>
                        <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-text-secondary">Total Amount</p>
                            <p className="text-2xl font-medium text-rose-gold">
                              £{order.totalAmount.total.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-secondary">Payment Status</p>
                            <p className="font-medium">
                              {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ ' + order.paymentStatus}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-secondary">Items</p>
                            <p className="font-medium">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-secondary">Order Type</p>
                            <p className="font-medium capitalize">{order.userType}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent>
                        <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                        <div className="space-y-2">
                          <p className="font-medium">{order.shippingAddress.name}</p>
                          {order.shippingAddress.company && (
                            <p className="text-text-secondary">{order.shippingAddress.company}</p>
                          )}
                          <p className="text-text-secondary">{order.shippingAddress.street}</p>
                          <p className="text-text-secondary">
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                          </p>
                          <p className="text-text-secondary">{order.shippingAddress.country}</p>
                          {order.shippingAddress.phone && (
                            <p className="text-text-secondary">📞 {order.shippingAddress.phone}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="space-y-6">
                    <Card>
                      <CardContent>
                        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                          <Button fullWidth variant="secondary" onClick={() => setActiveTab('messages')}>
                            💬 View Messages
                          </Button>
                          {order.invoice && (
                            <Button fullWidth variant="secondary" onClick={handleDownloadInvoice}>
                              📄 Download Invoice
                            </Button>
                          )}
                          <Button fullWidth variant="secondary" onClick={() => window.print()}>
                            🖨️ Print Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {order.affiliateCode && (
                      <Card>
                        <CardContent>
                          <h3 className="text-lg font-medium mb-4">Affiliate Information</h3>
                          <p className="text-sm text-text-secondary mb-1">Affiliate Code</p>
                          <p className="font-medium">{order.affiliateCode}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'items' && (
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-4 border-b border-border-gray last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-lg">{item.productName}</p>
                        <p className="text-text-secondary">
                          Quantity: {item.quantity} {order.userType === 'retailer' ? 'cartons' : 'units'}
                        </p>
                        {order.userType === 'retailer' && (
                          <p className="text-sm text-text-secondary">
                            Price per carton: £{item.pricePerCarton.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-medium">£{item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-border-gray">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>£{order.totalAmount.items.toFixed(2)}</span>
                      </div>
                      {order.totalAmount.shipping > 0 && (
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>£{order.totalAmount.shipping.toFixed(2)}</span>
                        </div>
                      )}
                      {order.totalAmount.tax > 0 && (
                        <div className="flex justify-between text-text-secondary">
                          <span>VAT included</span>
                          <span>£{order.totalAmount.tax.toFixed(2)}</span>
                        </div>
                      )}
                      {order.totalAmount.discount && order.totalAmount.discount > 0 && (
                        <div className="flex justify-between text-success-green">
                          <span>Discount</span>
                          <span>-£{order.totalAmount.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-medium pt-2 border-t">
                        <span>Total</span>
                        <span className="text-rose-gold">£{order.totalAmount.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'messages' && (
              <div className="flex flex-col h-[600px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                      <div className="text-5xl mb-4">💬</div>
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isCurrentUser = message.senderId === user?.id
                        const isSystem = message.senderId === 'system'
                        
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              'flex',
                              isSystem ? 'justify-center' : isCurrentUser ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <div className={cn(
                              'max-w-[70%]',
                              isSystem && 'w-full max-w-full'
                            )}>
                              {!isCurrentUser && !isSystem && (
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                                    {message.senderName?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm text-text-secondary">
                                    {message.senderName}
                                    {message.senderRole && ` (${message.senderRole})`}
                                  </span>
                                </div>
                              )}
                              <div
                                className={cn(
                                  'rounded-lg px-4 py-3',
                                  isSystem 
                                    ? 'bg-info-blue text-white text-center'
                                    : isCurrentUser
                                    ? 'bg-rose-gold text-white ml-10'
                                    : 'bg-white border border-border-gray'
                                )}
                              >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <p className={cn(
                                  'text-xs mt-2',
                                  isCurrentUser ? 'text-white/70' : 'text-text-secondary'
                                )}>
                                  {formatMessageTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border-gray bg-white">
                  <div className="flex gap-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'documents' && (
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Documents</h3>
                {order.documents.length === 0 ? (
                  <div className="text-center py-12 text-text-secondary">
                    <div className="text-5xl mb-4">📎</div>
                    <p>No documents attached to this order</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 border border-border-gray rounded-lg hover:bg-soft-pink-hover transition-colors"
                      >
                        <span className="text-2xl">
                          {doc.type === 'invoice' ? '📄' : 
                           doc.type === 'shipping_label' ? '📦' :
                           doc.type === 'customs_form' ? '🛃' : '📎'}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-text-secondary">
                            {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <span className="text-rose-gold">→</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'timeline' && (
              <div className="p-6">
                <h3 className="text-lg font-medium mb-6">Order Timeline</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border-gray"></div>
                  
                  <div className="space-y-6">
                    {order.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4 relative">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white z-10',
                          statusColors[event.status]
                        )}>
                          ✓
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="font-medium text-lg">{statusLabels[event.status]}</p>
                          <p className="text-text-secondary mt-1">{event.description}</p>
                          <p className="text-sm text-text-secondary mt-2">
                            {formatDate(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </Layout>
  )
}