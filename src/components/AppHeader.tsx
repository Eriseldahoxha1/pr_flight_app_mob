import { getHeaderTitle, Header } from '@react-navigation/elements'
import type { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { useAppTheme } from '../hooks/useAppTheme'
import { typography } from '../theme/tokens'

export default function AppHeader({ options, route, back }: NativeStackHeaderProps) {
  const theme = useAppTheme()

  return (
    <Header
      title={getHeaderTitle(options, route.name)}
      back={back}
      headerTitleAlign="center"
      headerTitleStyle={typography.subtitle}
      headerStyle={{ backgroundColor: theme.colors.header }}
      headerTintColor={theme.colors.onHeader}
      headerShadowVisible={false}
      headerBackButtonDisplayMode="minimal"
    />
  )
}
