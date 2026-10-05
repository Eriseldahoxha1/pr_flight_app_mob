import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { useAppDispatch } from '../store/hooks'
import { deleteItemAsync, getItemAsync } from 'expo-secure-store'
import { logout, setAuthInitialized, setSession } from '../store/authSlice'
import UserService from '../services/UserService'
import { isAxiosError } from 'axios'
import Toast from 'react-native-toast-message'
import { RootStackParamList } from '../types/navigation'
import AuthNavigator from './AuthNavigator'
import MainNavigator from './MainNavigator'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const savedSession = await getItemAsync('session')

        if (cancelled) return

        if (!savedSession) {
          // Discard sessions saved using the previous two-key format.
          await Promise.all([deleteItemAsync('accessToken'), deleteItemAsync('userId')])
          return
        }

        const session: unknown = JSON.parse(savedSession)

        if (
          typeof session !== 'object' ||
          session === null ||
          !('accessToken' in session) ||
          typeof session.accessToken !== 'string' ||
          !session.accessToken.trim() ||
          !('userId' in session) ||
          typeof session.userId !== 'number' ||
          !Number.isInteger(session.userId)
        ) {
          throw new SyntaxError('Invalid saved session')
        }

        const { accessToken, userId } = session
        const user = await UserService.getUser(userId, accessToken)

        if (!cancelled) dispatch(setSession({ accessToken, user }))
      } catch (error) {
        if (cancelled) return

        const status = isAxiosError(error) ? error.response?.status : undefined
        const invalidSession = error instanceof SyntaxError || status === 401 || status === 403 || status === 404

        if (invalidSession) {
          try {
            await deleteItemAsync('session')
          } catch {
            console.warn('Could not remove the saved session')
          }
        }

        if (cancelled) return

        dispatch(logout())
        Toast.show({
          type: 'error',
          text1: invalidSession ? 'Please log in again' : 'Could not restore your session. Reopen the app to retry.',
        })
      } finally {
        if (!cancelled) dispatch(setAuthInitialized())
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [dispatch])

  return (
    <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  )
}
