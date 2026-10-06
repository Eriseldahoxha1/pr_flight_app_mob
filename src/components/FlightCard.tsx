import type { Flight } from '../types/flight'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppTheme } from '../hooks/useAppTheme'
import { radii, sizes, spacing, typography } from '../theme/tokens'
import { formatDate } from '../utils/formatDate'

const statusLabels = {
  'on-time': 'On time',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
}

type FlightCardProps = {
  flight: Flight
  isFavorite: boolean
  onPress: () => void
  onToggleFavorite: () => void
}

export default function FlightCard({ flight, isFavorite, onPress, onToggleFavorite }: FlightCardProps) {
  const theme = useAppTheme()

  const durationMinutes = Math.round((Date.parse(flight.arrivalAt) - Date.parse(flight.departureAt)) / 60000)
  const duration = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${flight.airline} ${flight.flightNumber}`}
          style={styles.airline}
        >
          <Ionicons name="airplane-outline" size={sizes.icon} color={theme.colors.tabActive} accessible={false} />

          <View style={styles.airlineInfo}>
            <Text style={[typography.label, { color: theme.colors.text }]}>{flight.airline}</Text>
            <Text style={[typography.caption, { color: theme.colors.textMuted }]}>{flight.flightNumber}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? `Remove ${flight.flightNumber} from favorites` : `Add ${flight.flightNumber} to favorites`
          }
          style={({ pressed }) => [styles.favoriteButton, pressed && { backgroundColor: theme.colors.surfaceMuted }]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={sizes.icon}
            color={isFavorite ? theme.colors.primary : theme.colors.textMuted}
            accessible={false}
          />
        </Pressable>
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityHint="Opens flight details."
        style={({ pressed }) => [styles.details, pressed && { backgroundColor: theme.colors.surfaceMuted }]}
      >
        <View style={styles.route}>
          <View style={styles.airport}>
            <Text style={[typography.title, { color: theme.colors.text }]}>{flight.departureAt.slice(11, 16)}</Text>
            <Text style={[typography.label, { color: theme.colors.text }]}>{flight.departureAirport.code}</Text>
            <Text style={[typography.caption, { color: theme.colors.textMuted }]}>
              {formatDate(flight.departureAt.slice(0, 10))}
            </Text>
          </View>

          <View style={styles.connection}>
            <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
            <Ionicons name="airplane" size={sizes.iconSmall} color={theme.colors.text} accessible={false} />
            <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
          </View>

          <View style={[styles.airport, styles.arrival]}>
            <Text style={[typography.title, { color: theme.colors.text }]}>{flight.arrivalAt.slice(11, 16)}</Text>
            <Text style={[typography.label, { color: theme.colors.text }]}>{flight.arrivalAirport.code}</Text>
            <Text style={[typography.caption, { color: theme.colors.textMuted }]}>
              {formatDate(flight.arrivalAt.slice(0, 10))}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.status, { backgroundColor: theme.colors.surfaceMuted }]}>
            <Text
              style={[
                typography.caption,
                {
                  color: flight.status === 'cancelled' ? theme.colors.error : theme.colors.text,
                },
              ]}
            >
              {statusLabels[flight.status]}
            </Text>
          </View>

          <Text style={[typography.caption, { color: theme.colors.textMuted }]}>{duration}</Text>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  airline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
  },
  airlineInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  favoriteButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  details: {
    gap: spacing.md,
    borderRadius: radii.sm,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  airport: {
    flex: 1,
    gap: spacing.xs,
  },
  arrival: {
    alignItems: 'flex-end',
  },
  connection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: sizes.borderWidth,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  status: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
})
