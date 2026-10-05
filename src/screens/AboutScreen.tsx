import { StyleSheet, View } from 'react-native'
import { useAppTheme } from '../hooks/useAppTheme'
import { spacing } from '../theme/tokens'

export default function AboutScreen() {
  const theme = useAppTheme()

  return <View style={[styles.container, { backgroundColor: theme.colors.background }]} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
})
