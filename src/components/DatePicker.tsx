import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { useAppTheme } from '../hooks/useAppTheme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { radii, sizes, spacing, typography } from '../theme/tokens'

type DatePickerProps = {
  visible: boolean
  title: string
  value: string | null
  minDate?: string
  onConfirm: (date: string) => void
  onClose: () => void
}

export default function DatePicker({ visible, title, value, minDate, onClose, onConfirm }: DatePickerProps) {
  const theme = useAppTheme()
  const insets = useSafeAreaInsets()
  const initialDate = value && (!minDate || value >= minDate) ? value : null
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate)
  const canConfirm = selectedDate !== null && (!minDate || selectedDate >= minDate)

  const handleConfirm = () => {
    if (!selectedDate || !canConfirm) return

    onConfirm(selectedDate)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
          onPress={onClose}
          accessible={false}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          <Text accessibilityRole="header" style={[typography.subtitle, styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <ScrollView style={styles.calendar}>
            {visible && (
              <Calendar
                key={theme.dark ? 'dark' : 'light'}
                initialDate={initialDate ?? minDate}
                minDate={minDate}
                firstDay={1}
                disableAllTouchEventsForDisabledDays
                onDayPress={day => setSelectedDate(day.dateString)}
                markedDates={
                  selectedDate
                    ? {
                        [selectedDate]: {
                          selected: true,
                          selectedColor: theme.colors.primary,
                          selectedTextColor: theme.colors.onPrimary,
                        },
                      }
                    : {}
                }
                theme={{
                  calendarBackground: theme.colors.background,
                  dayTextColor: theme.colors.text,
                  monthTextColor: theme.colors.text,
                  textSectionTitleColor: theme.colors.textMuted,
                  textDisabledColor: theme.colors.onDisabled,
                  todayTextColor: theme.colors.tabActive,
                  arrowColor: theme.colors.text,
                  textDayFontSize: typography.body.fontSize,
                  textMonthFontSize: typography.subtitle.fontSize,
                  textDayHeaderFontSize: typography.caption.fontSize,
                }}
              />
            )}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.button,
                {
                  borderWidth: sizes.borderWidth,
                  borderColor: theme.colors.text,
                  backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.background,
                },
              ]}
            >
              <Text style={[typography.button, { color: theme.colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canConfirm }}
              disabled={!canConfirm}
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: !canConfirm
                    ? theme.colors.disabled
                    : pressed
                      ? theme.colors.primaryPressed
                      : theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[typography.button, { color: canConfirm ? theme.colors.onPrimary : theme.colors.onDisabled }]}
              >
                Confirm
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '65%',
    borderTopLeftRadius: radii.panel,
    borderTopRightRadius: radii.panel,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
  },
  calendar: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    minHeight: sizes.buttonMinHeight,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
