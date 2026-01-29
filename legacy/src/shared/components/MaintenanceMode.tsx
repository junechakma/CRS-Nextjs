import { useEffect, useState } from 'react'
import { Wrench, Clock, AlertTriangle, Shield, RefreshCw } from 'lucide-react'
import type { MaintenanceSettings } from '../hooks/useMaintenanceMode'

interface MaintenanceModeProps {
  settings: MaintenanceSettings
  onRefresh?: () => void
}

export default function MaintenanceMode({ settings, onRefresh }: MaintenanceModeProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatEstimatedTime = (estimatedCompletion?: string) => {
    if (!estimatedCompletion) return null
    
    try {
      const completionTime = new Date(estimatedCompletion)
      const now = new Date()
      const diff = completionTime.getTime() - now.getTime()
      
      if (diff <= 0) return 'Expected to be back soon'
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        return `Expected back in ${hours}h ${minutes}m`
      } else {
        return `Expected back in ${minutes}m`
      }
    } catch {
      return null
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full">
        {/* Main Maintenance Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              System Under Maintenance
            </h1>
            <p className="text-blue-100 text-lg">
              We're making improvements to serve you better
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="space-y-6">
              {/* Maintenance Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">
                      Maintenance Notice
                    </h3>
                    <p className="text-sm text-blue-700">
                      {settings.maintenance_message || 'System is currently under maintenance. Please check back soon.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimated Completion Time */}
              {settings.estimated_completion && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800 mb-1">
                        Estimated Completion
                      </h3>
                      <p className="text-sm text-green-700">
                        {formatEstimatedTime(settings.estimated_completion)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Target: {new Date(settings.estimated_completion).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Time */}
              <div className="text-center py-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Current Time</div>
                <div className="text-lg font-mono text-gray-800">
                  {currentTime.toLocaleString()}
                </div>
              </div>

              {/* Refresh Button */}
              <div className="text-center">
                <button
                  onClick={onRefresh}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Status
                </button>
              </div>

              {/* Footer Info */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>
                    Your data is safe and secure during maintenance
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            For urgent matters, please contact your system administrator
          </p>
        </div>
      </div>
    </div>
  )
}