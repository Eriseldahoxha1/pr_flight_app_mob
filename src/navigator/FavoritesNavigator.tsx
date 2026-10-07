import AppHeader from '../components/AppHeader'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { FavoritesStackParamList } from '../types/navigation'
import { useAppTheme } from '../hooks/useAppTheme'
import FavoriteFlightsScreen from '../screens/FavoriteFlightsScreen'
import FlightDetailsScreen from '../screens/FlightDetailsScreen'
import { navigationLabels } from '../constants/labels'

const Stack = createNativeStackNavigator<FavoritesStackParamList>()

export default function FavoritesNavigator() {
  const theme = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        header: props => <AppHeader {...props} />,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="FavoriteFlightsList"
        component={FavoriteFlightsScreen}
        options={{ title: navigationLabels.favoriteFlights }}
      />
      <Stack.Screen
        name="FlightDetails"
        component={FlightDetailsScreen}
        options={{ title: navigationLabels.flightDetails }}
      />
    </Stack.Navigator>
  )
}
