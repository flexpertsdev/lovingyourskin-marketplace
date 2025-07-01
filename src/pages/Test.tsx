import React from 'react'

export const Test: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Test Page</h1>
      <p className="text-gray-600 mb-4">If you can see this, the app is working!</p>
      <div className="space-y-2">
        <div className="p-4 bg-white border rounded">White background</div>
        <div className="p-4 bg-gray-100 border rounded">Gray background</div>
        <div className="p-4 bg-pink-100 border rounded">Pink background</div>
        <div className="p-4 bg-rose-300 border rounded">Rose background</div>
      </div>
    </div>
  )
}