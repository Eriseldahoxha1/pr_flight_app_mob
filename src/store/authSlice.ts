import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { User } from '../types/user'
import { AuthResponse } from '../types/auth'

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
