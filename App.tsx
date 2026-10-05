import { StatusBar } from 'expo-status-bar'
import RootNavigator from './src/navigator/RootNavigator'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import RootLayout from './src/components/layouts/RootLayout'
import { Provider } from 'react-redux'
import { store } from './src/store'

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootLayout>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>

          <StatusBar style="auto" />
        </RootLayout>
      </SafeAreaProvider>
    </Provider>
  )
}
