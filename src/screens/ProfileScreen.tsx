import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { useAppTheme } from '../hooks/useAppTheme'
import { radii, spacing, typography, sizes } from '../theme/tokens'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import Ionicons from '@expo/vector-icons/Ionicons'
import { setThemePreference } from '../store/themeSlice'
import { useState } from 'react'
import { selectUser } from '../store/authSlice'
import { logoutUser } from '../store/authThunks'
import Toast from 'react-native-toast-message'
import ThemeService from '../services/ThemeService'
import type { ThemePreference } from '../types/theme'
import ConfirmDialog from '../components/ConfirmDialog'
import { commonLabels, profileLabels, themeLabels } from '../constants/labels'

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: themeLabels.system },
  { value: 'light', label: themeLabels.light },
  { value: 'dark', label: themeLabels.dark },
]

export default function ProfileScreen() {
  const theme = useAppTheme()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const themePreference = useAppSelector(state => state.theme.preference)

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false)

  if (!user) return null

  const nameParts = user.name.trim().split(/\s+/).filter(Boolean)
  const initials = (
    (nameParts[0]?.[0] ?? '') + (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '')
  ).toUpperCase()

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await dispatch(logoutUser()).unwrap()
    } catch {
      setIsLogoutDialogVisible(false)
      Toast.show({
        type: 'error',
        text1: profileLabels.logOutError,
        text2: commonLabels.tryAgain,
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const onSelectTheme = (preference: ThemePreference) => {
    dispatch(setThemePreference(preference))
    ThemeService.savePreference(preference).catch(() => {
      Toast.show({
        type: 'error',
        text1: profileLabels.themeSaveError,
        text2: profileLabels.themeSaveErrorDetail,
      })
    })
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
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />
          <Text style={[typography.body, { color: theme.colors.text }]}>{profileLabels.name}</Text>
          <Text style={[typography.body, styles.value, { color: theme.colors.textMuted }]}>{user.name}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />
          <Text style={[typography.body, { color: theme.colors.text }]}>{profileLabels.email}</Text>
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
        <View style={styles.themeSetting}>
          <View style={styles.themeHeader}>
            <Ionicons name="moon-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />
            <Text style={[typography.body, { color: theme.colors.text }]}>{profileLabels.appearance}</Text>
          </View>

          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={profileLabels.appearance}
            style={[styles.segmented, { backgroundColor: theme.colors.surfaceMuted }]}
          >
            {themeOptions.map(option => {
              const isSelected = option.value === themePreference

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => onSelectTheme(option.value)}
                  style={[styles.segment, isSelected && { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={[typography.label, { color: isSelected ? theme.colors.onPrimary : theme.colors.text }]}>
                    {option.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsLogoutDialogVisible(true)}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            borderColor: theme.colors.text,
            backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.background,
          },
        ]}
      >
        <Ionicons name="log-out-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />
        <Text style={[typography.body, { color: theme.colors.text }]}>{profileLabels.logOut}</Text>
      </Pressable>

      <ConfirmDialog
        visible={isLogoutDialogVisible}
        title={profileLabels.logOutConfirm}
        confirmLabel={profileLabels.logOut}
        confirmingLabel={profileLabels.loggingOut}
        isConfirming={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogVisible(false)}
      />
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
  themeSetting: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radii.md,
  },
  segment: {
    flex: 1,
    minHeight: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
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
