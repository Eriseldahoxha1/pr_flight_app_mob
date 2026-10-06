import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../types/user'
import type { AuthResponse } from '../types/auth'
import type { RootState } from './index'

type AuthState = {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitialized: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      state.isInitialized = true
    },
    logout(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.isInitialized = true
    },
    setAuthInitialized(state) {
      state.isInitialized = true
    },
  },
})

export const { setSession, logout, setAuthInitialized } = authSlice.actions
export default authSlice.reducer

export const selectUser = (state: RootState) => state.auth.user
export const selectUserId = (state: RootState) => state.auth.user?.id ?? null
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectIsAuthInitialized = (state: RootState) => state.auth.isInitialized

export const requireUserId = (state: RootState) => {
  const userId = selectUserId(state)
  if (!userId) throw new Error('Not logged in')
  return userId
}
