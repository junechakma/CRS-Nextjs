import { useSelector } from 'react-redux'
import { PermissionService, type Permission } from '../services/permissionService'
import type { RootState } from '../../store/store'
import type { UserRole } from '../../types/auth'

export function usePermissions() {
  const { user } = useSelector((state: RootState) => state.auth)

  const hasPermission = (
    resource: string,
    action: Permission['action'],
    scope: Permission['scope'] = 'own'
  ): boolean => {
    if (!user?.role) return false
    return PermissionService.hasPermission(user.role, resource, action, scope)
  }

  const canAccessResource = (resource: string): boolean => {
    if (!user?.role) return false
    return PermissionService.canAccessResource(user.role, resource)
  }

  const canManageUser = (targetRole: UserRole): boolean => {
    if (!user?.role) return false
    return PermissionService.canManageUser(user.role, targetRole)
  }

  const getNavigationItems = () => {
    if (!user?.role) return []
    return PermissionService.getNavigationItems(user.role)
  }

  const isRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user?.role ? roles.includes(user.role) : false
  }

  const isHigherThanRole = (role: UserRole): boolean => {
    if (!user?.role) return false
    return PermissionService.isHigherRole(user.role, role)
  }

  return {
    user,
    hasPermission,
    canAccessResource,
    canManageUser,
    getNavigationItems,
    isRole,
    hasAnyRole,
    isHigherThanRole
  }
}