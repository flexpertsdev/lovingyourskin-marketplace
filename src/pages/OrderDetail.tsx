import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent, Badge, Input } from '../components/ui'
import { orderService } from '../services'
import { Order, Message, MessageThread, OrderStatus } from '../types'

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

export const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [order, setOrder] = useState<Order | null>(null)
  const [thread, setThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'messages'>('messages')
  
  useEffect(() => {
    if (orderId) {
      loadOrderData()
    }
  }, [orderId])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const loadOrderData = async () => {
    if (!orderId) return
    
    setLoading(true)
    try {
      const [orderData, threadData] = await Promise.all([
        orderService.getOrder(orderId),
        orderService.getOrder(orderId).then(o => o ? orderService.getMessageThread(o.id) : null)
      ])
      
      if (orderData && threadData) {
        setOrder(orderData)
        setThread(threadData)
        
        const messagesData = await orderService.getMessages(threadData.id)
        setMessages(messagesData)
        
        // Mark messages as read
        await orderService.markMessagesAsRead(threadData.id, 'user-1')
      }
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !thread) return
    
    setSendingMessage(true)
    try {
      const message = await orderService.sendMessage(thread.id, newMessage.trim())
      setMessages([...messages, message])
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSendingMessage(false)
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
    const now = new Date()
    const messageDate = new Date(date)
    const diffMs = now.getTime() - messageDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      return messageDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
  
  if (loading || !order || !thread) {
    return (
      <Layout>
        <Section>
          <Container>
            <div className="text-center py-20">Loading order details...</div>
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" size="small" onClick={() => navigate('/orders')}>
                  ← Back
                </Button>
                <h1 className="text-2xl font-light">{order.orderNumber} - {order.brandName}</h1>
                <Badge className={`${statusColors[order.status]} text-white`}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant={activeTab === 'details' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('details')}
              >
                Order Details
              </Button>
              <Button
                variant={activeTab === 'messages' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('messages')}
              >
                Messages
              </Button>
            </div>
          </div>
          
          {/* Content */}
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Summary */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-medium mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between py-3 border-b border-border-gray last:border-0">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-text-secondary">
                              {item.quantity} cartons × £{item.pricePerCarton.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium">£{item.totalPrice.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border-gray">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>£{order.totalAmount.items.toFixed(2)}</span>
                      </div>
                      {order.totalAmount.shipping > 0 && (
                        <div className="flex justify-between mb-2">
                          <span>Shipping</span>
                          <span>£{order.totalAmount.shipping.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total</span>
                        <span className="text-rose-gold">£{order.totalAmount.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-medium mb-4">Order Timeline</h3>
                    <div className="space-y-4">
                      {order.timeline.map((event, index) => (
                        <div key={index} className="flex gap-4">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-white
                            ${statusColors[event.status]}
                          `}>
                            ✓
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{statusLabels[event.status]}</p>
                            <p className="text-sm text-text-secondary">{event.description}</p>
                            <p className="text-xs text-text-secondary mt-1">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Side Info */}
              <div className="space-y-6">
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                    <div className="text-sm space-y-1">
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </CardContent>
                </Card>
                
                {order.documents.length > 0 && (
                  <Card>
                    <CardContent>
                      <h3 className="text-lg font-medium mb-4">Documents</h3>
                      <div className="space-y-2">
                        {order.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 hover:bg-soft-pink-hover rounded transition-colors"
                          >
                            <span>📎</span>
                            <span className="text-sm">{doc.name}</span>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            /* Messages Tab */
            <Card className="h-[calc(100vh-250px)]">
              <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`max-w-[70%] ${
                          message.senderRole === 'buyer' ? 'ml-auto' : ''
                        }`}
                      >
                        <div
                          className={`rounded-xl p-4 ${
                            message.senderRole === 'buyer'
                              ? 'bg-rose-gold text-white'
                              : message.senderRole === 'lys_team' && message.senderId === 'system'
                              ? 'bg-success-green text-white w-full max-w-full text-center'
                              : 'bg-white border border-border-gray'
                          }`}
                        >
                          <p className="font-medium text-sm mb-1">{message.senderName}</p>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm underline"
                                >
                                  📎 {attachment.name}
                                </a>
                              ))}
                            </div>
                          )}
                          <p className={`text-xs mt-2 ${
                            message.senderRole === 'buyer' 
                              ? 'text-white/70' 
                              : 'text-text-secondary'
                          }`}>
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
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
                    <Button type="button" variant="secondary" size="small">
                      📎
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}
        </Container>
      </Section>
    </Layout>
  )
}