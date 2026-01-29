import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Lock, Shield } from 'lucide-react'
import { Button } from '../../shared/components/ui'
import ChangePasswordForm from '../auth/ChangePasswordForm'

interface QuickSettingsButtonProps {
  variant?: 'button' | 'card'
  className?: string
}

export default function QuickSettingsButton({ 
  variant = 'button', 
  className = '' 
}: QuickSettingsButtonProps) {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const navigate = useNavigate()

  const handleChangePasswordModal = () => {
    setShowChangePassword(true)
  }

  const handleChangePasswordPage = () => {
    navigate('/change-password')
  }

  if (variant === 'card') {
    return (
      <>
        <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-600">Manage your account security</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleChangePasswordModal}
              variant="secondary"
              className="w-full justify-start"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password (Quick)
            </Button>
            
            <Button
              onClick={handleChangePasswordPage}
              variant="secondary"
              className="w-full justify-start"
            >
              <Settings className="w-4 h-4 mr-2" />
              Change Password (Full Page)
            </Button>
          </div>
        </div>

        <ChangePasswordForm
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => {
            setShowChangePassword(false)
            // Could show success toast here
          }}
        />
      </>
    )
  }

  // Default button variant
  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          onClick={handleChangePasswordModal}
          variant="secondary"
          size="sm"
        >
          <Lock className="w-4 h-4 mr-2" />
          Quick Change Password
        </Button>
        
        <Button
          onClick={handleChangePasswordPage}
          variant="secondary"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Security Settings
        </Button>
      </div>

      <ChangePasswordForm
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={() => {
          setShowChangePassword(false)
          // Could show success toast here
        }}
      />
    </>
  )
}