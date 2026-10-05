import type { PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast, { ErrorToast, type ToastConfig } from 'react-native-toast-message'
import { useAppTheme } from '../../hooks/useAppTheme'
import { radii, sizes, spacing, typography } from '../../theme/tokens'

type RootLayoutProps = PropsWithChildren<{
  hasHeader?: boolean
}>

export default function RootLayout({ children, hasHeader = false }: RootLayoutProps) {
  const insets = useSafeAreaInsets()
  const theme = useAppTheme()

  const toastConfig: ToastConfig = {
    error: props => (
      <ErrorToast
        {...props}
        style={{
          backgroundColor: theme.colors.surface,
          borderLeftColor: theme.colors.error,
          borderRadius: radii.md,
          height: 'auto',
          minHeight: sizes.touchTarget,
        }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
        text1Style={{ ...typography.label, color: theme.colors.text }}
        text2Style={{ ...typography.body, color: theme.colors.textMuted }}
        text1NumberOfLines={0}
        text2NumberOfLines={0}
      />
    ),
  }

  return (
    <>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
          // {
          //   paddingTop: 24 + (hasHeader ? 0 : insets.top),
          //   paddingBottom: 24 + insets.bottom,
          //   paddingLeft: 24 + insets.left,
          //   paddingRight: 24 + insets.right,
          // },
        ]}
      >
        {children}
      </View>

      <Toast config={toastConfig} topOffset={insets.top + 16} />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
})
