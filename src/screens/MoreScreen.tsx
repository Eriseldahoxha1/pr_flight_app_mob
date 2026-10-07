import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { useAppTheme } from '../hooks/useAppTheme'
import { sizes, spacing, typography } from '../theme/tokens'
import Ionicons from '@expo/vector-icons/Ionicons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MoreStackParamList } from '../types/navigation'
import { navigationLabels } from '../constants/labels'

type MoreScreenProps = NativeStackScreenProps<MoreStackParamList, 'MoreMenu'>

const menuItems = [
  { route: 'Settings', label: navigationLabels.settings, icon: 'settings-outline' },
  { route: 'Help', label: navigationLabels.help, icon: 'help-circle-outline' },
  { route: 'About', label: navigationLabels.about, icon: 'information-circle-outline' },
  { route: 'Contact', label: navigationLabels.contact, icon: 'mail-outline' },
] as const

export default function MoreScreen({ navigation }: MoreScreenProps) {
  const theme = useAppTheme()

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      {menuItems.map((item, index) => (
        <Pressable
          key={item.route}
          accessibilityRole="button"
          onPress={() => navigation.navigate(item.route)}
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.background,
              borderBottomColor: theme.colors.border,
              borderBottomWidth: index < menuItems.length - 1 ? sizes.borderWidth : 0,
            },
          ]}
        >
          <Ionicons name={item.icon} size={sizes.icon} color={theme.colors.text} accessible={false} />
          <Text style={[styles.label, typography.body, { color: theme.colors.text }]}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={sizes.iconSmall} color={theme.colors.textMuted} accessible={false} />
        </Pressable>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  row: {
    minHeight: sizes.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xl,
  },
  label: {
    flex: 1,
  },
})
