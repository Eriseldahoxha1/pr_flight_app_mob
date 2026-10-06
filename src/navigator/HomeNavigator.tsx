import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HomeStackParamList } from '../types/navigation'
import HomeScreen from '../screens/HomeScreen'
import { useAppTheme } from '../hooks/useAppTheme'
import { typography } from '../theme/tokens'
import { getHeaderTitle, Header } from '@react-navigation/elements'
import SearchResultsScreen from '../screens/SearchResultsScreen'
import FlightDetailsScreen from '../screens/FlightDetailsScreen'

const Stack = createNativeStackNavigator<HomeStackParamList>()

export default function HomeNavigator() {
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
      <Stack.Screen name="Dashboard" component={HomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ title: 'Search Results' }} />
      <Stack.Screen name="FlightDetails" component={FlightDetailsScreen} options={{ title: 'Flight Details' }} />
    </Stack.Navigator>
  )
}
