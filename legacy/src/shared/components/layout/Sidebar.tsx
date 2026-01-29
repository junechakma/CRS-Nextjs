import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Building2, 
  BookOpen, 
  Clipboard, 
  Settings,
  BarChart3,
  User
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import type { UserRole } from '../../../types/auth'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

// Role-specific navigation configurations
const getRoleBasedNavigation = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'super_admin':
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['super_admin'] },
        { name: 'Universities', href: '/universities', icon: Building2, roles: ['super_admin'] },
        { name: 'Users', href: '/users', icon: Users, roles: ['super_admin'] },
        { name: 'Approvals', href: '/approvals', icon: Clipboard, roles: ['super_admin'] },
        { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['super_admin'] },
        { name: 'Settings', href: '/settings', icon: Settings, roles: ['super_admin'] },
      ]
    case 'university_admin':
      return [
        { name: 'Dashboard', href: '/university-admin/dashboard', icon: Home, roles: ['university_admin'] },
        { name: 'Faculties', href: '/university-admin/faculties', icon: Building2, roles: ['university_admin'] },
        { name: 'Departments', href: '/university-admin/departments', icon: Users, roles: ['university_admin'] },
        { name: 'Teachers', href: '/university-admin/teachers', icon: User, roles: ['university_admin'] },
        { name: 'Questions', href: '/university-admin/questions', icon: Clipboard, roles: ['university_admin'] },
        { name: 'Semesters', href: '/university-admin/semesters', icon: BookOpen, roles: ['university_admin'] },
        { name: 'Analytics', href: '/university-admin/analytics', icon: BarChart3, roles: ['university_admin'] },
        { name: 'Settings', href: '/university-admin/settings', icon: Settings, roles: ['university_admin'] },
      ]
    case 'faculty_admin':
      return [
        { name: 'Dashboard', href: '/faculty-admin/dashboard', icon: Home, roles: ['faculty_admin'] },
        { name: 'Department Management', href: '/faculty-admin/department-management', icon: Building2, roles: ['faculty_admin'] },
        { name: 'Teacher Management', href: '/faculty-admin/teacher-management', icon: Users, roles: ['faculty_admin'] },
        { name: 'Courses', href: '/faculty-admin/courses', icon: BookOpen, roles: ['faculty_admin'] },
        { name: 'Analytics', href: '/faculty-admin/analytics', icon: BarChart3, roles: ['faculty_admin'] },
      ]
    case 'department_moderator':
      return [
        { name: 'Dashboard', href: '/department-moderator/dashboard', icon: Home, roles: ['department_moderator'] },
        { name: 'Teachers', href: '/department-moderator/teachers', icon: Users, roles: ['department_moderator'] },
        { name: 'Students', href: '/department-moderator/students', icon: User, roles: ['department_moderator'] },
        { name: 'Courses', href: '/department-moderator/courses', icon: BookOpen, roles: ['department_moderator'] },
        { name: 'Sessions', href: '/department-moderator/sessions', icon: Clipboard, roles: ['department_moderator'] },
        { name: 'Analytics', href: '/department-moderator/analytics', icon: BarChart3, roles: ['department_moderator'] },
      ]
    case 'teacher':
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['teacher'] },
        { name: 'Courses', href: '/teacher/courses', icon: BookOpen, roles: ['teacher'] },
        { name: 'Sessions', href: '/teacher/sessions', icon: Clipboard, roles: ['teacher'] },
        { name: 'Analytics', href: '/teacher/analytics', icon: BarChart3, roles: ['teacher'] },
      ]
    default:
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['super_admin', 'university_admin', 'faculty_admin', 'department_moderator', 'teacher'] },
      ]
  }
}

export default function Sidebar() {
  const { user, loading } = useSelector((state: RootState) => state.auth)

  // Debug logging
  console.log('Sidebar Debug:', { user, loading, role: user?.role })

  if (loading) {
    return (
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const allowedNavigation = getRoleBasedNavigation(user.role)
  console.log('Navigation items:', allowedNavigation)

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--primary-color)' }}>
          CRS System
        </h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">
          {user.role.replace('_', ' ')}
        </p>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {allowedNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'var(--primary-color)' : undefined,
              })}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}