import type { UserRole } from '../../types/auth'

export interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
  scope?: 'own' | 'department' | 'faculty' | 'university' | 'all'
}

export class PermissionService {
  private static roleHierarchy: Record<UserRole, number> = {
    student: 1,
    teacher: 2,
    department_moderator: 3,
    faculty_admin: 4,
    university_admin: 5,
    super_admin: 6
  }

  private static permissions: Record<UserRole, Permission[]> = {
    super_admin: [
      { resource: '*', action: 'create', scope: 'all' },
      { resource: '*', action: 'read', scope: 'all' },
      { resource: '*', action: 'update', scope: 'all' },
      { resource: '*', action: 'delete', scope: 'all' }
    ],
    university_admin: [
      { resource: 'universities', action: 'read', scope: 'own' },
      { resource: 'universities', action: 'update', scope: 'own' },
      { resource: 'faculties', action: 'create', scope: 'university' },
      { resource: 'faculties', action: 'read', scope: 'university' },
      { resource: 'faculties', action: 'update', scope: 'university' },
      { resource: 'faculties', action: 'delete', scope: 'university' },
      { resource: 'users', action: 'read', scope: 'university' },
      { resource: 'users', action: 'update', scope: 'university' }
    ],
    faculty_admin: [
      { resource: 'faculties', action: 'read', scope: 'own' },
      { resource: 'faculties', action: 'update', scope: 'own' },
      { resource: 'departments', action: 'create', scope: 'faculty' },
      { resource: 'departments', action: 'read', scope: 'faculty' },
      { resource: 'departments', action: 'update', scope: 'faculty' },
      { resource: 'departments', action: 'delete', scope: 'faculty' },
      { resource: 'users', action: 'read', scope: 'faculty' },
      { resource: 'users', action: 'update', scope: 'faculty' }
    ],
    department_moderator: [
      { resource: 'departments', action: 'read', scope: 'own' },
      { resource: 'departments', action: 'update', scope: 'own' },
      { resource: 'courses', action: 'create', scope: 'department' },
      { resource: 'courses', action: 'read', scope: 'department' },
      { resource: 'courses', action: 'update', scope: 'department' },
      { resource: 'courses', action: 'delete', scope: 'department' },
      { resource: 'users', action: 'read', scope: 'department' },
      { resource: 'users', action: 'update', scope: 'department' },
      { resource: 'response_sessions', action: 'read', scope: 'department' },
      { resource: 'responses', action: 'read', scope: 'department' }
    ],
    teacher: [
      { resource: 'courses', action: 'create', scope: 'own' },
      { resource: 'courses', action: 'read', scope: 'own' },
      { resource: 'courses', action: 'update', scope: 'own' },
      { resource: 'response_sessions', action: 'create', scope: 'own' },
      { resource: 'response_sessions', action: 'read', scope: 'own' },
      { resource: 'response_sessions', action: 'update', scope: 'own' },
      { resource: 'response_sessions', action: 'delete', scope: 'own' },
      { resource: 'responses', action: 'read', scope: 'own' }
    ],
    student: [
      { resource: 'response_sessions', action: 'read', scope: 'all' },
      { resource: 'responses', action: 'create', scope: 'own' },
      { resource: 'responses', action: 'read', scope: 'own' },
      { resource: 'responses', action: 'update', scope: 'own' }
    ]
  }

  static hasPermission(
    userRole: UserRole,
    resource: string,
    action: Permission['action'],
    scope: Permission['scope'] = 'own'
  ): boolean {
    const rolePermissions = this.permissions[userRole] || []
    
    // Check for exact match
    const exactMatch = rolePermissions.some(permission => 
      (permission.resource === resource || permission.resource === '*') &&
      permission.action === action &&
      (permission.scope === scope || permission.scope === 'all')
    )

    if (exactMatch) return true

    // Check for wildcard resource with any scope
    const wildcardMatch = rolePermissions.some(permission =>
      permission.resource === '*' &&
      permission.action === action
    )

    return wildcardMatch
  }

  static canAccessResource(userRole: UserRole, resource: string): boolean {
    const rolePermissions = this.permissions[userRole] || []
    
    return rolePermissions.some(permission =>
      permission.resource === resource || permission.resource === '*'
    )
  }

  static getHigherRoles(userRole: UserRole): UserRole[] {
    const currentLevel = this.roleHierarchy[userRole]
    return Object.entries(this.roleHierarchy)
      .filter(([, level]) => level > currentLevel)
      .map(([role]) => role as UserRole)
  }

  static getLowerRoles(userRole: UserRole): UserRole[] {
    const currentLevel = this.roleHierarchy[userRole]
    return Object.entries(this.roleHierarchy)
      .filter(([, level]) => level < currentLevel)
      .map(([role]) => role as UserRole)
  }

  static isHigherRole(role1: UserRole, role2: UserRole): boolean {
    return this.roleHierarchy[role1] > this.roleHierarchy[role2]
  }

  static canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    return this.isHigherRole(managerRole, targetRole)
  }

  static getNavigationItems(userRole: UserRole) {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', roles: ['super_admin', 'university_admin', 'faculty_admin', 'department_moderator', 'teacher'] }
    ]

    const allItems = [
      ...baseItems,
      { name: 'Universities', href: '/universities', roles: ['super_admin'] },
      { name: 'Faculties', href: '/faculties', roles: ['super_admin', 'university_admin'] },
      { name: 'Departments', href: '/departments', roles: ['super_admin', 'university_admin', 'faculty_admin'] },
      { name: 'Teachers', href: '/teachers', roles: ['super_admin', 'university_admin', 'faculty_admin', 'department_moderator'] },
      { name: 'Courses', href: '/courses', roles: ['department_moderator', 'teacher'] },
      { name: 'Sessions', href: '/sessions', roles: ['department_moderator', 'teacher'] },
      { name: 'Responses', href: '/responses', roles: ['super_admin', 'university_admin', 'faculty_admin', 'department_moderator', 'teacher'] },
      { name: 'Settings', href: '/settings', roles: ['super_admin', 'university_admin', 'faculty_admin', 'department_moderator'] }
    ]

    return allItems.filter(item => item.roles.includes(userRole))
  }
}