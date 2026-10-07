import AppHeader from '../components/AppHeader'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MoreStackParamList } from '../types/navigation'
import { useAppTheme } from '../hooks/useAppTheme'
import SettingsScreen from '../screens/SettingsScreen'
import MoreScreen from '../screens/MoreScreen'
import AboutScreen from '../screens/AboutScreen'
import ContactScreen from '../screens/ContactScreen'
import HelpScreen from '../screens/HelpScreen'
import { navigationLabels } from '../constants/labels'

const Stack = createNativeStackNavigator<MoreStackParamList>()

export default function MoreNavigator() {
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
      <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ title: navigationLabels.more }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: navigationLabels.settings }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: navigationLabels.help }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: navigationLabels.about }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: navigationLabels.contact }} />
    </Stack.Navigator>
  )
}
