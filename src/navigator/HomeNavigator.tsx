import AppHeader from '../components/AppHeader'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HomeStackParamList } from '../types/navigation'
import HomeScreen from '../screens/HomeScreen'
import { useAppTheme } from '../hooks/useAppTheme'
import SearchResultsScreen from '../screens/SearchResultsScreen'
import FlightDetailsScreen from '../screens/FlightDetailsScreen'
import { navigationLabels } from '../constants/labels'

const Stack = createNativeStackNavigator<HomeStackParamList>()

export default function HomeNavigator() {
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
      <Stack.Screen name="Dashboard" component={HomeScreen} options={{ title: navigationLabels.home }} />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: navigationLabels.searchResults }}
      />
      <Stack.Screen
        name="FlightDetails"
        component={FlightDetailsScreen}
        options={{ title: navigationLabels.flightDetails }}
      />
    </Stack.Navigator>
  )
}
