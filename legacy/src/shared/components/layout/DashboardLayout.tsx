import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  University, 
  Settings,
  BarChart3,
  UserCheck,
  Building2,
  BookOpen,
  GraduationCap,
  FileText,
  Calendar,
  Layers,
  PlayCircle,
  KeyRound,
  Clock,
  LogOut
} from 'lucide-react'
import type { RootState, AppDispatch } from '../../../store/store'
import { signOut } from '../../../store/slices/authSlice'
import UserProfileDropdown from '../../../components/profile/UserProfileDropdown'
import ConfirmModal from '../ui/ConfirmModal'
import { supabase } from '../../../lib/supabase'

interface DashboardLayoutProps {
  children: ReactNode
}

interface NavItem {
  name: string
  href: string
  icon: ReactNode
  current?: boolean
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [universityLogo, setUniversityLogo] = useState<string | null>(null)
  const [universityName, setUniversityName] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const handleSignOutClick = () => {
    setShowLogoutModal(true)
  }

  const handleConfirmSignOut = async () => {
    try {
      await dispatch(signOut())
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Fetch university logo and name for university-related roles
  useEffect(() => {
    const fetchUniversityData = async () => {
      if (user?.university_id && ['university_admin', 'faculty_admin', 'teacher'].includes(user.role)) {
        try {
          const { data, error } = await supabase
            .from('universities')
            .select('name, logo_path')
            .eq('id', user.university_id)
            .single()

          if (error) throw error

          if (data) {
            setUniversityName(data.name)
            setUniversityLogo(data.logo_path)
          }
        } catch (error) {
          console.error('Error fetching university data:', error)
        }
      }
    }

    fetchUniversityData()
  }, [user?.university_id, user?.role])

  // Navigation items based on user role
  const getNavigationItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> }
    ]

    // Base items with Change Password for fallback roles (like student)
    const baseItemsWithPassword: NavItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
      { name: 'Change Password', href: '/change-password', icon: <KeyRound className="w-5 h-5" /> }
    ]

    if (user?.role === 'super_admin') {
      return [
        ...baseItems,
        { name: 'Universities', href: '/universities', icon: <University className="w-5 h-5" /> },
        { name: 'Applications', href: '/approvals', icon: <UserCheck className="w-5 h-5" /> },
        { name: 'All Users', href: '/users', icon: <Users className="w-5 h-5" /> },
        { name: 'Questions', href: '/questions', icon: <FileText className="w-5 h-5" /> },
        { name: 'System Analytics', href: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { name: 'System Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
        { name: 'Change Password', href: '/change-password', icon: <KeyRound className="w-5 h-5" /> }
      ]
    }

    if (user?.role === 'university_admin') {
      // If university admin doesn't have university_id, they're pending approval
      // Only show dashboard in this case
      if (!user?.university_id) {
        return [
          { name: 'Dashboard', href: '/university-admin/dashboard', icon: <Home className="w-5 h-5" /> },
          { name: 'Change Password', href: '/change-password', icon: <KeyRound className="w-5 h-5" /> }
        ]
      }

      // Full navigation for approved university admins
      return [
        { name: 'Dashboard', href: '/university-admin/dashboard', icon: <Home className="w-5 h-5" /> },
        { name: 'Faculties', href: '/university-admin/faculties', icon: <Building2 className="w-5 h-5" /> },
        { name: 'Departments', href: '/university-admin/departments', icon: <BookOpen className="w-5 h-5" /> },
        { name: 'Teachers', href: '/university-admin/teachers', icon: <GraduationCap className="w-5 h-5" /> },
        { name: 'Semesters', href: '/university-admin/semesters', icon: <Calendar className="w-5 h-5" /> },
        { name: 'Durations', href: '/university-admin/durations', icon: <Clock className="w-5 h-5" /> },
        { name: 'Questions', href: '/university-admin/questions', icon: <FileText className="w-5 h-5" /> },
        { name: 'Settings', href: '/university-admin/settings', icon: <Settings className="w-5 h-5" /> },
        { name: 'Change Password', href: '/change-password', icon: <KeyRound className="w-5 h-5" /> }
      ]
    }

    if (user?.role === 'faculty_admin') {
      return [
        ...baseItems,
        { name: 'Department Management', href: '/faculty-admin/department-management', icon: <Building2 className="w-5 h-5" /> },
        { name: 'Teacher Management', href: '/faculty-admin/teacher-management', icon: <Users className="w-5 h-5" /> },
        { name: 'Change Password', href: '/change-password', icon: <KeyRound className="w-5 h-5" /> }
      ]
    }
    if(user?.role === 'department_moderator' ){
      return [
        { name: 'Dashboard', href: '/department-moderator/dashboard', icon: <Home className="w-5 h-5" /> },
        { name: 'Teachers', href: '/department-moderator/teachers', icon: <Users className="w-5 h-5" /> },
        { name: 'Courses', href: '/department-moderator/courses', icon: <BookOpen className="w-5 h-5" /> },
        { name: 'Change Password', href: '/change-password', icon: <KeyRound className="w-5 h-5" /> }
      ]
    }

    if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { name: 'My Courses', href: '/teacher/courses', icon: <Layers className="w-5 h-5" /> },
        { name: 'Sessions', href: '/teacher/sessions', icon: <PlayCircle className="w-5 h-5" /> },
        { name: 'Analytics', href: '/teacher/analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { name: 'Change Password', href: '/change-password', icon: <KeyRound className="w-5 h-5" /> }
      ]
    }

    return baseItemsWithPassword
  }

  const navigation = getNavigationItems()

  // Helper component for logo and title
  const LogoAndTitle = ({ isMobile = false, forSidebar = false }: { isMobile?: boolean, forSidebar?: boolean }) => {
    const shouldShowUniversityInfo = user?.university_id && ['university_admin', 'faculty_admin', 'teacher'].includes(user?.role || '')
    
    // For desktop sidebar, always show CRS icon and "CRS" text
    if (forSidebar && !isMobile) {
      return (
        <div className="flex items-center space-x-3">
          <img
            src="/icon.png"
            alt="CRS Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="font-bold text-blue-600 text-2xl">
            CRS
          </h1>
        </div>
      )
    }
    
    // For header and mobile sidebar, show university info if available
    if (shouldShowUniversityInfo && universityLogo && universityName) {
      return (
        <div className="flex items-center space-x-4">
          <img
            src={universityLogo}
            alt={`${universityName} Logo`}
            className={`object-contain ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="flex flex-col">
            <h1 className={`font-bold text-blue-700 ${isMobile ? 'text-lg' : 'text-xl'} leading-tight break-words max-w-[200px]`}>
              {universityName}
            </h1>
          </div>
        </div>
      )
    }

    return (
      <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
        Class Response System
      </h1>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200">
            <LogoAndTitle isMobile={true} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-sm border-r border-gray-200">
          <div className="flex items-center h-20 px-4 border-b border-gray-200">
            <LogoAndTitle forSidebar={true} />
          </div>
          
          <nav className="mt-8 flex-1 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOutClick}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-10 lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <LogoAndTitle isMobile={true} />
            <UserProfileDropdown />
          </div>
        </div>

        {/* Top bar for desktop - always visible */}
        <div className="hidden lg:block sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-6">
              {user?.university_id && ['university_admin', 'faculty_admin', 'teacher'].includes(user?.role || '') && universityLogo && universityName ? (
                <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-lg border border-blue-100">
                  <img
                    src={universityLogo}
                    alt={`${universityName} Logo`}
                    className="w-12 h-12 object-contain rounded-lg shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-blue-800 leading-tight break-words max-w-md">
                      {universityName}
                    </h1>
                    <p className="text-sm text-blue-600 font-medium">
                      Course Response System
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 rounded-lg border border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Class Response System
                  </h1>
                </div>
              )}
            </div>
            <UserProfileDropdown />
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmSignOut}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will be redirected to the login page."
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}