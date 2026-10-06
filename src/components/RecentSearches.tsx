import { Pressable, StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppTheme } from '../hooks/useAppTheme'
import { radii, sizes, spacing, typography } from '../theme/tokens'
import type { RecentSearch } from '../types/flight'
import { formatDate } from '../utils/formatDate'

type RecentSearchesProps = {
  searches: RecentSearch[]
  onSelect: (search: RecentSearch) => void
}

export default function RecentSearches({ searches, onSelect }: RecentSearchesProps) {
  const theme = useAppTheme()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[typography.subtitle, { color: theme.colors.text }]}>
          Recent searches
        </Text>
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>Last 10 searches</Text>
      </View>

      {searches.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Ionicons name="document-text-outline" size={sizes.icon} color={theme.colors.textMuted} accessible={false} />
          <Text style={[typography.body, styles.emptyText, { color: theme.colors.textMuted }]}>
            Your recent searches will appear here.
          </Text>
        </View>
      ) : (
        searches.slice(0, 10).map(search => {
          const dates = search.returnDate
            ? `${formatDate(search.departureDate)} – ${formatDate(search.returnDate)}`
            : `${formatDate(search.departureDate)} · One way`

          return (
            <Pressable
              key={search.id}
              accessibilityRole="button"
              accessibilityLabel={`Use search from ${search.originCode} to ${search.destinationCode}, ${dates}`}
              accessibilityHint="Fills the flight search form with these airports and dates."
              onPress={() => onSelect(search)}
              style={({ pressed }) => [
                styles.row,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
                },
              ]}
            >
              <Ionicons name="time-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />
              <View style={styles.details}>
                <Text style={[typography.label, { color: theme.colors.text }]}>
                  {search.originCode} → {search.destinationCode}
                </Text>
                <Text style={[typography.caption, { color: theme.colors.textMuted }]}>{dates}</Text>
              </View>
              <View style={[styles.action, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text style={[typography.caption, { color: theme.colors.text }]}>Use search</Text>
              </View>
            </Pressable>
          )
        })
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radii.md,
  },
  emptyText: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  action: {
    padding: spacing.sm,
    borderRadius: radii.sm,
    flexShrink: 1,
  },
})
