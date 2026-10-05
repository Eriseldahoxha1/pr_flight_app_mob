import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MoreStackParamList } from '../types/navigation'
import { useAppTheme } from '../hooks/useAppTheme'
import SettingsScreen from '../screens/SettingsScreen'
import MoreScreen from '../screens/MoreScreen'
import AboutScreen from '../screens/AboutScreen'
import ContactScreen from '../screens/ContactScreen'
import { typography } from '../theme/tokens'
import { Header, getHeaderTitle } from '@react-navigation/elements'
import HelpScreen from '../screens/HelpScreen'

const Stack = createNativeStackNavigator<MoreStackParamList>()

export default function MoreNavigator() {
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
      <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
    </Stack.Navigator>
  )
}
