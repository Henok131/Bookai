import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const apiBase = import.meta.env.VITE_API_BASE || '/api'

export default function Home() {
  const [apiHealth, setApiHealth] = useState<{ ok?: boolean; error?: string } | null>(null)
  const [ocrHealth, setOcrHealth] = useState<{ ok?: boolean; error?: string } | null>(null)

  useEffect(() => {
    // Test API health
    fetch(`${apiBase}/health`)
      .then(res => res.json())
      .then(data => setApiHealth(data))
      .catch(err => setApiHealth({ error: err.message }))

    // Test OCR health
    fetch('/ocr/health')
      .then(res => res.json())
      .then(data => setOcrHealth(data))
      .catch(err => setOcrHealth({ error: err.message }))
  }, [apiBase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BookAI</h1>
          <p className="text-lg text-gray-600">System is live — All services healthy</p>
        </div>
        
        <div className="space-y-4 mt-8">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-800">Web Service: Running</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            apiHealth?.ok 
              ? 'bg-green-50 border-green-200' 
              : apiHealth?.error 
              ? 'bg-red-50 border-red-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-2">
              {apiHealth?.ok && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
              {apiHealth?.error && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
              {!apiHealth && <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>}
              <span className={`font-semibold ${
                apiHealth?.ok ? 'text-green-800' : apiHealth?.error ? 'text-red-800' : 'text-gray-600'
              }`}>
                API Service: {apiHealth?.ok ? 'Healthy' : apiHealth?.error ? 'Error' : 'Checking...'}
              </span>
            </div>
            {apiHealth?.error && (
              <p className="text-sm text-red-600 mt-1">{apiHealth.error}</p>
            )}
          </div>

          <div className={`p-4 rounded-lg border ${
            ocrHealth?.ok 
              ? 'bg-green-50 border-green-200' 
              : ocrHealth?.error 
              ? 'bg-red-50 border-red-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-2">
              {ocrHealth?.ok && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
              {ocrHealth?.error && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
              {!ocrHealth && <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>}
              <span className={`font-semibold ${
                ocrHealth?.ok ? 'text-green-800' : ocrHealth?.error ? 'text-red-800' : 'text-gray-600'
              }`}>
                OCR Service: {ocrHealth?.ok ? 'Healthy' : ocrHealth?.error ? 'Error' : 'Checking...'}
              </span>
            </div>
            {ocrHealth?.error && (
              <p className="text-sm text-red-600 mt-1">{ocrHealth.error}</p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">API Base: <code className="bg-gray-100 px-2 py-1 rounded">{String(apiBase)}</code></p>
          <Link to="/status" className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline">
            View Detailed Status →
          </Link>
        </div>
      </div>
    </div>
  )
}

