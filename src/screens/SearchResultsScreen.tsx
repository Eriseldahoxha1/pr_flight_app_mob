import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { HomeStackParamList } from '../types/navigation'
import { useAppTheme } from '../hooks/useAppTheme'
import { spacing, typography } from '../theme/tokens'
import { useCallback, useEffect, useRef, useState } from 'react'
import Toast from 'react-native-toast-message'
import FlightService from '../services/FlightService'
import type { Flight } from '../types/flight'
import { formatDate } from '../utils/formatDate'
import FlightCard from '../components/FlightCard'
import { useAppSelector } from '../store/hooks'
import { useToggleFavorite } from '../hooks/useToggleFavorite'

type Props = NativeStackScreenProps<HomeStackParamList, 'SearchResults'>

export default function SearchResultsScreen({ route, navigation }: Props) {
  const theme = useAppTheme()
  const favorites = useAppSelector(state => state.favorites.items)
  const toggleFavorite = useToggleFavorite()

  const { originCode, destinationCode, departureDate, arrivalDate } = route.params

  const [flights, setFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const requestId = useRef(0)

  const loadFlights = useCallback(
    async (refresh = false) => {
      const currentRequest = ++requestId.current
      setError(null)
      setIsRefreshing(refresh)
      setIsLoading(!refresh)

      if (!refresh) setFlights([])

      try {
        const results = await FlightService.searchFlights({
          originCode,
          destinationCode,
          departureDate,
          arrivalDate,
        })

        if (currentRequest !== requestId.current) return
        setFlights(results)
      } catch {
        if (currentRequest !== requestId.current) return

        if (refresh) {
          Toast.show({
            type: 'error',
            text1: 'Could not refresh flights',
            text2: 'Check your connection and try again.',
          })
        } else {
          setError('Could not load flights. Check your connection and try again.')
        }
      } finally {
        if (currentRequest === requestId.current) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    },
    [originCode, destinationCode, departureDate, arrivalDate],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFlights()

    return () => {
      requestId.current += 1
    }
  }, [loadFlights])

  const onFlightCardPress = (flightId: string) => {
    navigation.navigate('FlightDetails', { flightId })
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[typography.title, { color: theme.colors.text }]}>
        {originCode} → {destinationCode}
      </Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.text} accessibilityLabel="Loading flights" />
      ) : error ? (
        <View>
          <Text style={[typography.body, { color: theme.colors.error }]}>{error}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void loadFlights()
            }}
            style={{ padding: spacing.lg }}
          >
            <Text style={[typography.label, { color: theme.colors.text }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={flights}
          refreshing={isRefreshing}
          onRefresh={() => {
            if (!isRefreshing) loadFlights(true)
          }}
          alwaysBounceVertical
          keyExtractor={flight => flight.id}
          contentContainerStyle={styles.list}

          ListHeaderComponent={
            <View style={styles.summary}>
              <Text style={[typography.body, { color: theme.colors.textMuted }]}>
                {formatDate(departureDate)} – {formatDate(arrivalDate)}
              </Text>
              <Text style={[typography.caption, { color: theme.colors.textMuted }]}>
                {flights.length} matching flights
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isFavorite = favorites.some(favorite => favorite.flightId === item.id)
            return (
              <FlightCard
                flight={item}
                isFavorite={isFavorite}
                onPress={() => onFlightCardPress(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id, isFavorite)}
              />
            )
          }}
          ListEmptyComponent={
            <Text style={[typography.body, { color: theme.colors.textMuted }]}>
              No matching flights. Try different airports or dates
            </Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  list: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  summary: {
    gap: spacing.xs,
  },
})
