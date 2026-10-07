import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectIsAuthenticated, selectIsAuthInitialized, setAuthInitialized } from '../store/authSlice'
import { restoreSession } from '../store/authThunks'
import { useAppTheme } from '../hooks/useAppTheme'
import ThemeService from '../services/ThemeService'
import { setThemePreference } from '../store/themeSlice'
import Toast from 'react-native-toast-message'
import { RootStackParamList } from '../types/navigation'
import { authLabels } from '../constants/labels'
import AuthNavigator from './AuthNavigator'
import MainNavigator from './MainNavigator'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const dispatch = useAppDispatch()
  const theme = useAppTheme()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isInitialized = useAppSelector(selectIsAuthInitialized)

  useEffect(() => {
    let cancelled = false

    const sessionRequest = dispatch(restoreSession())
    const sessionRestoration = sessionRequest.then(result => {
      if (cancelled || !restoreSession.rejected.match(result) || result.meta.aborted) return

      Toast.show({
        type: 'error',
        text1: result.payload === 'invalid-session' ? authLabels.sessionExpired : authLabels.restoreFailed,
      })
    })

    async function restoreThemePreference() {
      const preference = await ThemeService.getPreference()
      if (!cancelled) dispatch(setThemePreference(preference))
    }

    void Promise.all([sessionRestoration, restoreThemePreference()]).finally(() => {
      if (!cancelled) dispatch(setAuthInitialized())
    })

    return () => {
      cancelled = true
      sessionRequest.abort()
    }
  }, [dispatch])

  if (!isInitialized) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.text} />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
