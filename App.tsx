import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import RootNavigator from './src/navigator/RootNavigator'
import RootLayout from './src/components/layouts/RootLayout'
import { store } from './src/store'
import { useAppTheme } from './src/hooks/useAppTheme'
import { useAppSelector } from './src/store/hooks'

function AppContent() {
  const theme = useAppTheme()
  const { isInitialized } = useAppSelector(state => state.auth)
  const baseTheme = theme.dark ? DarkTheme : DefaultTheme
  const needsDarkStatusBar = !isInitialized && !theme.dark

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.colors.tabActive,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
  }

  return (
    <RootLayout>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style={needsDarkStatusBar ? 'dark' : 'light'} />
    </RootLayout>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  )
}
