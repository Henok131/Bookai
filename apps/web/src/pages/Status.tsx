import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

const apiBase = import.meta.env.VITE_API_BASE || '/api'

interface ServiceStatus {
  ok?: boolean
  error?: string
  checkedAt?: string
}

export default function Status() {
  const [webStatus, setWebStatus] = useState<ServiceStatus>({})
  const [apiStatus, setApiStatus] = useState<ServiceStatus>({})
  const [ocrStatus, setOcrStatus] = useState<ServiceStatus>({})
  const [dbStatus, setDbStatus] = useState<ServiceStatus>({})

  const checkHealth = useCallback(async () => {
    const now = new Date().toLocaleString()

    // Check Web (always running if page loads)
    setWebStatus({ ok: true, checkedAt: now })

    // Check API
    try {
      const res = await fetch(`${apiBase}/health`)
      const data = await res.json()
      setApiStatus({ ok: data.ok, checkedAt: now })

      // Check DB (via API health response)
      if (data.database === 'connected') {
        setDbStatus({ ok: true, checkedAt: now })
      } else {
        setDbStatus({ error: 'Database disconnected', checkedAt: now })
      }
    } catch (err: unknown) {
      setApiStatus({ error: err instanceof Error ? err.message : 'Unknown error', checkedAt: now })
      setDbStatus({ error: 'Database check unavailable', checkedAt: now })
    }

    // Check OCR
    try {
      const res = await fetch('/ocr/health')
      const data = await res.json()
      setOcrStatus({ ok: data.ok, checkedAt: now })
    } catch (err: unknown) {
      setOcrStatus({ error: err instanceof Error ? err.message : 'Unknown error', checkedAt: now })
    }
  }, [apiBase])

  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  const ServiceCard = ({ 
    name, 
    status 
  }: { 
    name: string
    status: ServiceStatus 
  }) => {
    const getStatusColor = () => {
      if (status.ok) return 'bg-green-50 border-green-200'
      if (status.error) return 'bg-red-50 border-red-200'
      return 'bg-gray-50 border-gray-200'
    }

    const getStatusText = () => {
      if (status.ok) return 'Healthy'
      if (status.error) return 'Error'
      return 'Checking...'
    }

    const getStatusDot = () => {
      if (status.ok) return 'bg-green-500'
      if (status.error) return 'bg-red-500'
      return 'bg-gray-400 animate-pulse'
    }

    return (
      <div className={`p-6 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getStatusDot()}`}></div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          </div>
          <span className={`text-sm font-medium ${
            status.ok ? 'text-green-800' : status.error ? 'text-red-800' : 'text-gray-600'
          }`}>
            {getStatusText()}
          </span>
        </div>
        {status.error && (
          <p className="text-sm text-red-600 mt-2">{status.error}</p>
        )}
        {status.checkedAt && (
          <p className="text-xs text-gray-500 mt-2">Last checked: {status.checkedAt}</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Status</h1>
              <p className="text-gray-600 mt-1">Real-time health monitoring</p>
            </div>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              ← Home
            </Link>
          </div>

          <div className="space-y-4 mb-6">
            <ServiceCard name="Web Service" status={webStatus} />
            <ServiceCard name="API Service" status={apiStatus} />
            <ServiceCard name="OCR Service" status={ocrStatus} />
            <ServiceCard name="Database" status={dbStatus} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={checkHealth}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Recheck All Services
            </button>
            <Link
              to="/"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium inline-flex items-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

