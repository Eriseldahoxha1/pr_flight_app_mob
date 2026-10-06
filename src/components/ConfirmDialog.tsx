import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAppTheme } from '../hooks/useAppTheme'
import { radii, sizes, spacing, typography } from '../theme/tokens'

type ConfirmDialogProps = {
  visible: boolean
  title: string
  confirmLabel: string
  confirmingLabel?: string
  isConfirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  visible,
  title,
  confirmLabel,
  confirmingLabel = confirmLabel,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useAppTheme()

  const cancel = () => {
    if (!isConfirming) onCancel()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancel}>
      <View style={styles.container}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
          onPress={cancel}
          accessible={false}
        />
        <View
          accessibilityViewIsModal
          style={[styles.dialog, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text accessibilityRole="header" style={[typography.subtitle, styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>

          <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={cancel}
              disabled={isConfirming}
              accessibilityState={{ disabled: isConfirming }}
              style={({ pressed }) => [
                styles.action,
                { borderRightColor: theme.colors.border },
                styles.cancelAction,
                pressed && { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <Text style={[typography.label, { color: theme.colors.text }]}>Cancel</Text>
            </Pressable>

            <View style={styles.action}>
              <Pressable
                accessibilityRole="button"
                onPress={onConfirm}
                disabled={isConfirming}
                accessibilityState={{ disabled: isConfirming, busy: isConfirming }}
                style={({ pressed }) => [
                  styles.confirmButton,
                  { backgroundColor: pressed ? theme.colors.primaryPressed : theme.colors.primary },
                  isConfirming && styles.confirming,
                ]}
              >
                <Text style={[typography.label, { color: theme.colors.onPrimary }]}>
                  {isConfirming ? confirmingLabel : confirmLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  title: {
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: sizes.borderWidth,
  },
  action: {
    flex: 1,
    minHeight: sizes.buttonMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  cancelAction: {
    borderRightWidth: sizes.borderWidth,
  },
  confirmButton: {
    alignSelf: 'stretch',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    borderRadius: radii.sm,
  },
  confirming: {
    opacity: 0.6,
  },
})
