import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { radii, sizes, spacing, typography } from '../theme/tokens'
import { Airport } from '../types/airport'
import { useAppTheme } from '../hooks/useAppTheme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'

type AirportPickerProps = {
  visible: boolean
  title: string
  airports: Airport[]
  selectedAirportId?: string
  onSelect: (airport: Airport) => void
  onClose: () => void
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export default function AirportPicker({
  visible,
  title,
  airports,
  selectedAirportId,
  onSelect,
  onClose,
  isLoading,
  error,
  onRetry,
}: AirportPickerProps) {
  const theme = useAppTheme()
  const insets = useSafeAreaInsets()

  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()

  const filteredAirports = airports.filter(airport =>
    [airport.name, airport.code, airport.city, airport.country].some(value => value.toLowerCase().includes(query)),
  )

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={() => setSearch('')}>
      <View style={styles.container}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
          onPress={onClose}
          accessible={false}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.container, { paddingTop: insets.top }]}
          pointerEvents="box-none"
        >
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            <View style={styles.header}>
              <Text
                accessibilityRole="header"
                style={[typography.subtitle, styles.title, { color: theme.colors.text }]}
              >
                {title}
              </Text>

              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close airport picker"
                style={styles.closeButton}
              >
                <Ionicons name="close" size={sizes.icon} color={theme.colors.text} />
              </Pressable>
            </View>
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={sizes.iconSmall}
                color={theme.colors.textMuted}
                accessible={false}
              />

              <TextInput
                keyboardAppearance={theme.dark ? 'dark' : 'light'}
                value={search}
                onChangeText={setSearch}
                placeholder="Search airports or cities"
                placeholderTextColor={theme.colors.placeholder}
                accessibilityLabel="Search airports"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading && !error}
                style={[typography.body, styles.searchInput, { color: theme.colors.text }]}
              />

              {search.length > 0 && (
                <Pressable
                  onPress={() => setSearch('')}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  style={styles.closeButton}
                >
                  <Ionicons name="close-circle" size={sizes.iconSmall} color={theme.colors.textMuted} />
                </Pressable>
              )}
            </View>
            <FlatList
              style={{ flex: 1 }}
              data={filteredAirports}
              contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
              keyExtractor={airport => airport.id}
              extraData={selectedAirportId}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}

              ListEmptyComponent={
                <View style={styles.feedback}>
                  {isLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.text} accessibilityLabel="Loading airports" />
                  ) : error ? (
                    <>
                      <Text style={[typography.body, { color: theme.colors.error }]}>{error}</Text>

                      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
                        <Text style={[typography.label, { color: theme.colors.text }]}>Retry</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Text style={[typography.body, { color: theme.colors.textMuted }]}>
                      {airports.length === 0
                        ? 'No airports are available.'
                        : 'No matches. Try another city or airport code.'}
                    </Text>
                  )}
                </View>
              }
              renderItem={({ item }) => {
                const selected = item.id === selectedAirportId

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${item.name}, ${item.code}, ${item.country}`}
                    onPress={() => {
                      Keyboard.dismiss()
                      onSelect(item)
                      onClose()
                    }}
                    style={({ pressed }) => [
                      styles.airportRow,
                      pressed && { backgroundColor: theme.colors.surfaceMuted },
                    ]}
                  >
                    <View style={[styles.airportCode, { backgroundColor: theme.colors.surfaceMuted }]}>
                      <Text style={[typography.label, { color: theme.colors.text }]}>{item.code}</Text>
                    </View>

                    <View style={styles.airportInfo}>
                      <Text style={[typography.label, { color: theme.colors.text }]}>{item.name}</Text>
                      <Text style={[typography.caption, { color: theme.colors.textMuted }]}>{item.country}</Text>
                    </View>

                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={sizes.icon}
                      color={selected ? theme.colors.primary : theme.colors.inputBorder}
                      accessible={false}
                    />
                  </Pressable>
                )
              }}
            />
          </View>
        </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    minHeight: sizes.inputMinHeight,
    paddingVertical: spacing.md,
  },
  airportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
  },
  airportCode: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: radii.sm,
  },
  airportInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  feedback: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  retryButton: {
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
})
