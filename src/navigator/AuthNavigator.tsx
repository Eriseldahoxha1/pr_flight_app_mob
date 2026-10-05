import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { PublicGuard } from '../guards/PublicGuard'
import LoginScreen from '../screens/LoginScreen'

type AuthStackParamList = {
  Login: undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export default function AuthNavigator() {
  return (
    <PublicGuard>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </PublicGuard>
  )
}
