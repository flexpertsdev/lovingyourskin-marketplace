// src/components/admin/InitializeFirebase.tsx
import React, { useState } from 'react'
import { initializeFirebaseData } from '@/services/firebase'
import { Button } from '@/components/ui'

export const InitializeFirebase: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleInitialize = async () => {
    setStatus('loading')
    setMessage('Initializing Firebase...')

    try {
      // Create default brands
      await initializeFirebaseData.createDefaultBrands()
      
      setStatus('success')
      setMessage('Firebase initialized successfully! Default brands have been created.')
    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Firebase initialization error:', error)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-medium mb-4">Initialize Firebase</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          This will create the default brands in Firebase. Only run this once!
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500">
          <li>The Cell Lab</li>
          <li>Wismin</li>
          <li>Baohlab</li>
          <li>Lalucell</li>
          <li>Sunnicorn</li>
        </ul>
      </div>

      <Button
        onClick={handleInitialize}
        disabled={status === 'loading' || status === 'success'}
        variant="primary"
      >
        {status === 'loading' ? 'Initializing...' : 'Initialize Firebase'}
      </Button>

      {message && (
        <div className={`mt-4 p-3 rounded ${
          status === 'success' ? 'bg-green-50 text-green-800' : 
          status === 'error' ? 'bg-red-50 text-red-800' : 
          'bg-blue-50 text-blue-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}