import { PrivateGuard } from '../guards/PrivateGuard'
import HomeScreen from '../screens/HomeScreen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAppTheme } from '../hooks/useAppTheme'
import { typography } from '../theme/tokens'
import FavoriteFlightsScreen from '../screens/FavoriteFlightsScreen'
import ProfileScreen from '../screens/ProfileScreen'
import MoreScreen from '../screens/MoreScreen'
import Ionicons from '@expo/vector-icons/Ionicons'

const tabIcons = {
  Home: { active: 'home', inactive: 'home-outline' },
  FavoriteFlights: { active: 'heart', inactive: 'heart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
  More: { active: 'ellipsis-horizontal', inactive: 'ellipsis-horizontal' },
} as const

type MainTabParamList = {
  Home: undefined
  FavoriteFlights: undefined
  Profile: undefined
  More: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export default function MainNavigator() {
  const theme = useAppTheme()

  return (
    <PrivateGuard>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          tabBarActiveTintColor: theme.colors.tabActive,
          tabBarInactiveTintColor: theme.colors.tabInactive,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
          tabBarLabelStyle: typography.caption,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={tabIcons[route.name][focused ? 'active' : 'inactive']} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="FavoriteFlights" component={FavoriteFlightsScreen} options={{ title: 'Favorite Flights' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="More" component={MoreScreen} />
      </Tab.Navigator>
    </PrivateGuard>
  )
}
