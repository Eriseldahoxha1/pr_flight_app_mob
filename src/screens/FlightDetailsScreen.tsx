import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { isAxiosError } from 'axios'
import type { HomeStackParamList } from '../types/navigation'
import type { Flight } from '../types/flight'
import FlightService from '../services/FlightService'
import { useAppTheme } from '../hooks/useAppTheme'
import { radii, sizes, spacing, typography } from '../theme/tokens'
import Ionicons from '@expo/vector-icons/Ionicons'
import { formatDate } from '../utils/formatDate'

type Props = NativeStackScreenProps<HomeStackParamList, 'FlightDetails'>

const statusLabels = {
  'on-time': 'On time',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
}

export default function FlightDetailsScreen({ route }: Props) {
  const theme = useAppTheme()
  const { flightId } = route.params

  const [flight, setFlight] = useState<Flight | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const loadFlight = async () => {
      setIsLoading(true)
      setError(null)
      setFlight(null)

      try {
        const result = await FlightService.getFlight(flightId)

        if (cancelled) return

        setFlight(result)
      } catch (error) {
        if (cancelled) return

        const notFound = isAxiosError(error) && error.response?.status === 404

        setError(
          notFound
            ? 'This flight is no longer available.'
            : 'Could not load flight details. Check your connection and try again.',
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadFlight()

    return () => {
      cancelled = true
    }
  }, [flightId, retryCount])

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.text} accessibilityLabel="Loading flight details" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, styles.feedback, { backgroundColor: theme.colors.background }]}>
        <Text style={[typography.body, { color: theme.colors.error }]}>{error}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setRetryCount(count => count + 1)}
          style={styles.retryButton}
        >
          <Text style={[typography.label, { color: theme.colors.text }]}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  if (!flight) return null

  const infoRows: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Aircraft', value: flight.aircraft, icon: 'airplane-outline' },
    {
      label: 'Departure gate',
      value: flight.departureGate,
      icon: 'exit-outline',
    },
    {
      label: 'Arrival gate',
      value: flight.arrivalGate,
      icon: 'enter-outline',
    },
  ]

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.airlineRow}>
        <Ionicons name="airplane-outline" size={sizes.icon} color={theme.colors.tabActive} accessible={false} />

        <View style={styles.airlineInfo}>
          <Text style={[typography.subtitle, { color: theme.colors.text }]}>{flight.airline}</Text>
          <Text style={[typography.body, { color: theme.colors.textMuted }]}>{flight.flightNumber}</Text>
        </View>

        <View style={[styles.status, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Text
            style={[
              typography.label,
              {
                color: flight.status === 'cancelled' ? theme.colors.error : theme.colors.text,
              },
            ]}
          >
            {statusLabels[flight.status]}
          </Text>
        </View>
      </View>

      <View style={styles.route}>
        <View style={styles.airport}>
          <Text style={[typography.heading, { color: theme.colors.text }]}>{flight.departureAirport.code}</Text>
          <Text style={[typography.body, { color: theme.colors.textMuted }]}>{flight.departureAirport.city}</Text>
          <Text style={[typography.title, { color: theme.colors.text }]}>{flight.departureAt.slice(11, 16)}</Text>
          <Text style={[typography.caption, { color: theme.colors.textMuted }]}>
            {formatDate(flight.departureAt.slice(0, 10))}
          </Text>
        </View>

        <Ionicons name="airplane" size={sizes.icon} color={theme.colors.text} accessible={false} />

        <View style={[styles.airport, styles.arrival]}>
          <Text style={[typography.heading, { color: theme.colors.text }]}>{flight.arrivalAirport.code}</Text>
          <Text style={[typography.body, { color: theme.colors.textMuted }]}>{flight.arrivalAirport.city}</Text>
          <Text style={[typography.title, { color: theme.colors.text }]}>{flight.arrivalAt.slice(11, 16)}</Text>
          <Text style={[typography.caption, { color: theme.colors.textMuted }]}>
            {formatDate(flight.arrivalAt.slice(0, 10))}
          </Text>
        </View>
      </View>
      <View>
        {infoRows.map(({ label, value, icon }) => (
          <View key={label} style={[styles.infoRow, { borderTopColor: theme.colors.border }]}>
            <Ionicons name={icon} size={sizes.icon} color={theme.colors.text} accessible={false} />
            <Text style={[typography.body, styles.infoLabel, { color: theme.colors.text }]}>{label}</Text>
            <Text style={[typography.body, styles.infoValue, { color: theme.colors.text }]}>
              {value || 'Not available'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  feedback: {
    gap: spacing.md,
  },
  retryButton: {
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  airlineInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  status: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  airport: {
    flex: 1,
    gap: spacing.sm,
  },
  arrival: {
    alignItems: 'flex-end',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: sizes.borderWidth,
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
  },
})
