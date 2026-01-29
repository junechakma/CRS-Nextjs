import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import type { RootState, AppDispatch } from '../../../store/store'
import { signIn, signOut, signUp, getCurrentUser, clearError } from '../../../store/slices/authSlice'
import type { User } from '../../../types/auth'

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth)

  const login = useCallback(async (email: string, password: string) => {
    try {
      await dispatch(signIn({ email, password })).unwrap()
      return { success: true }
    } catch (error) {
      return { success: false, error: error as string }
    }
  }, [dispatch])

  const register = useCallback(async (email: string, password: string, userData: Partial<User>) => {
    try {
      await dispatch(signUp({ email, password, userData })).unwrap()
      return { success: true }
    } catch (error) {
      return { success: false, error: error as string }
    }
  }, [dispatch])

  const logout = useCallback(async () => {
    try {
      await dispatch(signOut()).unwrap()
      return { success: true }
    } catch (error) {
      return { success: false, error: error as string }
    }
  }, [dispatch])

  const refreshUser = useCallback(async () => {
    try {
      await dispatch(getCurrentUser()).unwrap()
      return { success: true }
    } catch (error) {
      return { success: false, error: error as string }
    }
  }, [dispatch])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const hasRole = useCallback((role: string) => {
    return user?.role === role
  }, [user])

  const hasAnyRole = useCallback((roles: string[]) => {
    return user ? roles.includes(user.role) : false
  }, [user])

  const isRole = useCallback((role: string) => {
    return user?.role === role
  }, [user])

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout,
    refreshUser,
    clearAuthError,
    
    // Utilities
    hasRole,
    hasAnyRole,
    isRole,
  }
}