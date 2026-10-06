import { PrivateGuard } from '../guards/PrivateGuard'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAppTheme } from '../hooks/useAppTheme'
import { typography } from '../theme/tokens'
import ProfileScreen from '../screens/ProfileScreen'
import Ionicons from '@expo/vector-icons/Ionicons'
import MoreNavigator from './MoreNavigator'
import HomeNavigator from './HomeNavigator'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectUserId } from '../store/authSlice'
import { loadFavorites } from '../store/favoritesSlice'
import FavoritesNavigator from './FavoritesNavigator'

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
  const dispatch = useAppDispatch()
  const userId = useAppSelector(selectUserId)

  useEffect(() => {
    const request = userId ? dispatch(loadFavorites()) : null
    return () => request?.abort()
  }, [dispatch, userId])

  return (
    <PrivateGuard>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitleStyle: typography.subtitle,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.header },
          headerTintColor: theme.colors.onHeader,
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
        <Tab.Screen name="Home" component={HomeNavigator} options={{ headerShown: false }} />
        <Tab.Screen
          name="FavoriteFlights"
          component={FavoritesNavigator}
          options={{ title: 'Favorite Flights', headerShown: false }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="More" component={MoreNavigator} options={{ headerShown: false }} />
      </Tab.Navigator>
    </PrivateGuard>
  )
}
