import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { getHeaderTitle, Header } from '@react-navigation/elements'
import type { FavoritesStackParamList } from '../types/navigation'
import { useAppTheme } from '../hooks/useAppTheme'
import { typography } from '../theme/tokens'
import FavoriteFlightsScreen from '../screens/FavoriteFlightsScreen'
import FlightDetailsScreen from '../screens/FlightDetailsScreen'

const Stack = createNativeStackNavigator<FavoritesStackParamList>()

export default function FavoritesNavigator() {
  const theme = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ options, route, back }) => (
          <Header
            title={getHeaderTitle(options, route.name)}
            back={back}
            headerTitleAlign="center"
            headerTitleStyle={typography.subtitle}
            headerStyle={{
              backgroundColor: theme.colors.header,
            }}
            headerTintColor={theme.colors.onHeader}
            headerShadowVisible={false}
            headerBackButtonDisplayMode="minimal"
          />
        ),
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="FavoriteFlightsList"
        component={FavoriteFlightsScreen}
        options={{ title: 'Favorite Flights' }}
      />
      <Stack.Screen name="FlightDetails" component={FlightDetailsScreen} options={{ title: 'Flight Details' }} />
    </Stack.Navigator>
  )
}
