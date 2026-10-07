import { isAxiosError } from 'axios'
import AuthService from '../services/AuthService'
import SessionService from '../services/SessionService'
import UserService from '../services/UserService'
import type { LoginUserInput } from '../types/auth'
import { logout, setSession } from './authSlice'
import { createAppAsyncThunk } from './hooks'

type LoginError = 'invalid-credentials' | 'network' | 'unknown'
type RestoreError = 'invalid-session' | 'restore-failed'

export const loginUser = createAppAsyncThunk<void, LoginUserInput, { rejectValue: LoginError }>(
  'auth/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const session = await AuthService.login(credentials)
      await SessionService.save({ accessToken: session.accessToken, userId: session.user.id })
      dispatch(setSession(session))
    } catch (error) {
      if (isAxiosError(error)) {
        if (!error.response) return rejectWithValue('network')
        if (error.response.status === 400 || error.response.status === 401) {
          return rejectWithValue('invalid-credentials')
        }
      }

      return rejectWithValue('unknown')
    }
  },
)

export const restoreSession = createAppAsyncThunk<void, void, { rejectValue: RestoreError }>(
  'auth/restoreSession',
  async (_, { dispatch, signal, rejectWithValue }) => {
    try {
      const session = await SessionService.read()
      if (signal.aborted || !session) return

      const user = await UserService.getUser(session.userId, session.accessToken)
      if (!signal.aborted) dispatch(setSession({ accessToken: session.accessToken, user }))
    } catch (error) {
      if (signal.aborted) return

      const status = isAxiosError(error) ? error.response?.status : undefined
      const invalidSession = error instanceof SyntaxError || status === 401 || status === 403 || status === 404

      if (invalidSession) {
        try {
          await SessionService.clear()
        } catch {
          console.warn('Could not remove the saved session')
        }
      }

      if (signal.aborted) return

      dispatch(logout())
      return rejectWithValue(invalidSession ? 'invalid-session' : 'restore-failed')
    }
  },
)

export const logoutUser = createAppAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  await SessionService.clear()
  dispatch(logout())
})
