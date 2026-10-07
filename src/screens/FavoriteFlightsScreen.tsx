import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { FavoritesStackParamList } from '../types/navigation'
import type { Flight } from '../types/flight'
import FlightService from '../services/FlightService'
import FlightCard from '../components/FlightCard'
import { useAppTheme } from '../hooks/useAppTheme'
import { useToggleFavorite } from '../hooks/useToggleFavorite'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadFavorites, selectAreFavoritesReady, selectIsLoadingFavorites } from '../store/favoritesSlice'
import { sizes, spacing, typography } from '../theme/tokens'
import { commonLabels, favoritesLabels } from '../constants/labels'

type Props = NativeStackScreenProps<FavoritesStackParamList, 'FavoriteFlightsList'>

export default function FavoriteFlightsScreen({ navigation }: Props) {
  const theme = useAppTheme()
  const dispatch = useAppDispatch()
  const toggleFavorite = useToggleFavorite()

  const favorites = useAppSelector(state => state.favorites.items)
  const areFavoritesReady = useAppSelector(selectAreFavoritesReady)
  const pendingFavorites = useAppSelector(state => state.favorites.pendingRequests)
  const isLoadingFavorites = useAppSelector(selectIsLoadingFavorites)
  const favoritesError = useAppSelector(state => state.favorites.error)

  const [flights, setFlights] = useState<Flight[]>([])
  const [isLoadingFlights, setIsLoadingFlights] = useState(true)
  const [flightsError, setFlightsError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const loadFlights = async () => {
      setIsLoadingFlights(true)
      setFlightsError(null)

      try {
        const result = await FlightService.getFlightsByIds(favorites.map(favorite => favorite.flightId))
        if (!cancelled) setFlights(result)
      } catch {
        if (!cancelled) setFlightsError(favoritesLabels.loadError)
      } finally {
        if (!cancelled) setIsLoadingFlights(false)
      }
    }

    void loadFlights()

    return () => {
      cancelled = true
    }
  }, [favorites, retryCount])

  const favoriteFlights = favorites.flatMap(favorite => flights.filter(flight => flight.id === favorite.flightId))
  const error = favoritesError ?? flightsError

  const onRetry = () => {
    if (favoritesError) void dispatch(loadFavorites())
    else setRetryCount(count => count + 1)
  }

  if ((isLoadingFavorites || isLoadingFlights) && favoriteFlights.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.text} accessibilityLabel={favoritesLabels.loading} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, styles.feedback, { backgroundColor: theme.colors.background }]}>
        <Text style={[typography.body, { color: theme.colors.error }]}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
          <Text style={[typography.label, { color: theme.colors.text }]}>{commonLabels.retry}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <FlatList
      data={favoriteFlights}
      keyExtractor={flight => flight.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <FlightCard
          flight={item}
          isFavorite
          isFavoriteDisabled={!areFavoritesReady || pendingFavorites[item.id] !== undefined}
          onPress={() => navigation.navigate('FlightDetails', { flightId: item.id })}
          onToggleFavorite={() => toggleFavorite(item.id, true)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.feedback}>
          <Text style={[typography.subtitle, { color: theme.colors.text }]}>{favoritesLabels.emptyTitle}</Text>
          <Text style={[typography.body, { color: theme.colors.textMuted }]}>{favoritesLabels.emptyDescription}</Text>
        </View>
      }
    />
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
  list: {
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.xl,
  },
})
