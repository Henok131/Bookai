import React from 'react'

const apiBase = import.meta.env.VITE_API_BASE || '/api'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold">BookAI is live — Health OK.</h1>
        <p className="mt-2 text-gray-600">API Base: {String(apiBase)}</p>
      </div>
    </div>
  )
}
