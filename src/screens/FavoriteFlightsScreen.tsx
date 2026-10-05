import { StyleSheet, Text, View } from 'react-native'
import { useAppTheme } from '../hooks/useAppTheme'
import { spacing, typography } from '../theme/tokens'

export default function FavoriteFlightsScreen() {
  const theme = useAppTheme()
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[typography.title, { color: theme.colors.text }]}>Favorite Flights Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
})
