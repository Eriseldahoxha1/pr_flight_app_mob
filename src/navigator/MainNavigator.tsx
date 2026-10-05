import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { PrivateGuard } from '../guards/PrivateGuard'
import HomeScreen from '../screens/HomeScreen'

type MainStackParamList = {
  Home: undefined
}

const Stack = createNativeStackNavigator<MainStackParamList>()

export default function MainNavigator() {
  return (
    <PrivateGuard>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </PrivateGuard>
  )
}
