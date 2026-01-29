import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export interface MaintenanceSettings {
  maintenance_mode: boolean
  maintenance_message?: string
  estimated_completion?: string
}

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [maintenanceSettings, setMaintenanceSettings] = useState<MaintenanceSettings>({
    maintenance_mode: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkMaintenanceMode = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the public function to check maintenance mode
      const { data, error: fetchError } = await supabase.rpc('is_maintenance_mode')

      if (fetchError) {
        console.error('Error fetching maintenance mode:', fetchError)
        // Set default values if we can't fetch maintenance status
        setMaintenanceSettings({
          maintenance_mode: false,
          maintenance_message: 'System is currently under maintenance. Please check back soon.'
        })
        setIsMaintenanceMode(false)
        setError(null) // Don't show error to user, just use defaults
        return
      }

      const maintenanceData: MaintenanceSettings = {
        maintenance_mode: data || false,
        maintenance_message: 'System is currently under maintenance. Please check back soon.'
      }

      setMaintenanceSettings(maintenanceData)
      setIsMaintenanceMode(data || false)
    } catch (err) {
      console.error('Error checking maintenance mode:', err)
      // Set default values on error
      setMaintenanceSettings({
        maintenance_mode: false,
        maintenance_message: 'System is currently under maintenance. Please check back soon.'
      })
      setIsMaintenanceMode(false)
      setError(null) // Don't show error to user
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkMaintenanceMode()

    // Set up real-time subscription to listen for maintenance mode changes
    const subscription = supabase
      .channel('maintenance-mode')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_config',
          filter: 'key=eq.global_settings'
        },
        (payload) => {
          console.log('Maintenance mode changed:', payload)
          checkMaintenanceMode()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    isMaintenanceMode,
    maintenanceSettings,
    loading,
    error,
    refresh: checkMaintenanceMode
  }
}