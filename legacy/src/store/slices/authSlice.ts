import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { AuthState, User } from '../../types/auth'
import { AuthService } from '../../features/auth/services/authService'

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const authData = await AuthService.signIn(email, password)

    // Session is automatically handled by Supabase Auth
    // No need for manual localStorage management

    return authData.user
  }
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, userData }: { 
    email: string; 
    password: string; 
    userData: Partial<User> & { university_name?: string; university_code?: string }
  }) => {
    await AuthService.signUp(email, password, userData)
    const user = await AuthService.getCurrentUser()
    return user
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    await AuthService.signOut()
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const user = await AuthService.getCurrentUser()
    return user
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = !!action.payload
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Sign in failed'
        state.isAuthenticated = false
        state.user = null
      })
      
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = !!action.payload
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Sign up failed'
      })
      
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = !!action.payload
        state.loading = false
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer