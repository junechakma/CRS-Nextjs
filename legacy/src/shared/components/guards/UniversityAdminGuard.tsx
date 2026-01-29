import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import type { RootState } from '../../../store/store'

interface UniversityAdminGuardProps {
  children: React.ReactNode
}

/**
 * Guard component that redirects university admins with pending applications
 * away from restricted pages to the dashboard
 */
export default function UniversityAdminGuard({ children }: UniversityAdminGuardProps) {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only apply guard to university admins
    if (user?.role !== 'university_admin') {
      return
    }

    // If university admin doesn't have university_id, their application is pending
    const isPendingApproval = !user?.university_id

    if (isPendingApproval) {
      // Allow access only to pending page
      const allowedPaths = ['/university-admin/pending']
      const currentPath = location.pathname

      // If not on an allowed path, redirect to pending page
      if (!allowedPaths.includes(currentPath)) {
        navigate('/university-admin/pending', { replace: true })
      }
    }
  }, [user, location.pathname, navigate])

  return <>{children}</>
}