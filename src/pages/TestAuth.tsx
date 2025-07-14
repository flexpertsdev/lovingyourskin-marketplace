import React, { useState } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { Button } from '../components/ui'

export const TestAuth: React.FC = () => {
  const { user, login, logout, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('retailer@example.com')
  const [password, setPassword] = useState('password123')
  
  const handleLogin = async () => {
    try {
      await login(email, password)
    } catch (err) {
      console.error('Login failed:', err)
    }
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-6">Auth Test Page</h1>
      
      {user ? (
        <div>
          <h2 className="text-xl mb-4">Logged in as:</h2>
          <pre className="bg-gray-100 p-4 rounded mb-4">
            {JSON.stringify(user, null, 2)}
          </pre>
          <Button onClick={logout}>Logout</Button>
          <div className="mt-4">
            <a href="/dashboard" className="text-blue-500 underline">Go to Dashboard</a>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-4">Login Form</h2>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Email:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full max-w-md"
              />
            </div>
            <div>
              <label className="block mb-1">Password:</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-full max-w-md"
              />
            </div>
            <Button onClick={handleLogin} disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium mb-2">Test Accounts:</h3>
            <ul className="space-y-2 text-sm">
              <li>Retailer: retailer@example.com / password123</li>
              <li>Admin Rosie: rosie@lovingyourskin.net / Rtiylysp07!</li>
              <li>Admin Julie: julie@lovingyourskin.net / Jtiylysp07!</li>
              <li>Brand WISMIN: sinsungcos@sinsungitn.com / Wismin@2024!Secure</li>
              <li>Brand THE CELL LAB: thecell7979@naver.com / CellLab@2024!Secure</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <p className="text-sm text-gray-600">
          Current location: {window.location.pathname}
        </p>
      </div>
    </div>
  )
}