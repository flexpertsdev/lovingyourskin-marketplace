import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children: React.ReactNode
  showFooter?: boolean
  mode?: 'b2b' | 'consumer'
}

export const Layout: React.FC<LayoutProps> = ({ children, showFooter = true, mode = 'b2b' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header mode={mode} />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}