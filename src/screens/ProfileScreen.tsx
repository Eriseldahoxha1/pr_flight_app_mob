import { ScrollView, StyleSheet, Text, View, Switch, Pressable } from 'react-native'
import { useAppTheme } from '../hooks/useAppTheme'
import { radii, spacing, typography, sizes } from '../theme/tokens'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import Ionicons from '@expo/vector-icons/Ionicons'
import { setThemeMode } from '../store/themeSlice'
import { useState } from 'react'
import { deleteItemAsync } from 'expo-secure-store'
import { logout } from '../store/authSlice'
import Toast from 'react-native-toast-message'

export default function ProfileScreen() {
  const theme = useAppTheme()
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!user) return null

  const nameParts = user.name.trim().split(/\s+/).filter(Boolean)
  const initials = (
    (nameParts[0]?.[0] ?? '') + (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '')
  ).toUpperCase()

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await deleteItemAsync('session')
      dispatch(logout())
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Could not log out',
        text2: 'Please try again.',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.userInfo}>
        <View>
          <View accessible={false} style={[styles.avatar, { backgroundColor: theme.colors.surfaceMuted }]}>
            <Text style={[typography.heading, { color: theme.colors.text }]}>{initials}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />
          <Text style={[typography.body, { color: theme.colors.text }]}>Name</Text>
          <Text style={[typography.body, styles.value, { color: theme.colors.textMuted }]}>{user.name}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />
          <Text style={[typography.body, { color: theme.colors.text }]}>Email</Text>
          <Text selectable style={[typography.body, styles.value, { color: theme.colors.textMuted }]}>
            {user.email}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.row}>
          <Ionicons name="moon-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />
          <Text style={[typography.body, { flex: 1, color: theme.colors.text }]}>Dark mode</Text>

          <Switch
            accessibilityLabel="Dark mode"
            value={theme.dark}
            onValueChange={enabled => {
              dispatch(setThemeMode(enabled ? 'dark' : 'light'))
            }}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleLogout}
        disabled={isLoggingOut}
        accessibilityState={{ disabled: isLoggingOut, busy: isLoggingOut }}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            borderColor: theme.colors.text,
            backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.background,
            opacity: isLoggingOut ? 0.6 : 1,
          },
        ]}
      >
        <Ionicons name="log-out-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />
        <Text style={[typography.body, { color: theme.colors.text }]}>{isLoggingOut ? 'Logging out…' : 'Log out'}</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  userInfo: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  centeredText: {
    textAlign: 'center',
  },
  card: {
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: sizes.borderWidth,
  },
  logoutButton: {
    minHeight: sizes.buttonMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
})
