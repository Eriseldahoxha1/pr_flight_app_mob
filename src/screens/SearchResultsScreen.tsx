import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from 'react-native'
import type { HomeStackParamList } from '../types/navigation'
import { useAppTheme } from '../hooks/useAppTheme'
import { spacing, typography } from '../theme/tokens'
import { useCallback, useEffect, useRef, useState } from 'react'
import Toast from 'react-native-toast-message'
import FlightService from '../services/FlightService'
import type { FlightSearchResults } from '../types/flight'
import { formatDate } from '../utils/formatDate'
import FlightCard from '../components/FlightCard'
import { useAppSelector } from '../store/hooks'
import { useToggleFavorite } from '../hooks/useToggleFavorite'

type Props = NativeStackScreenProps<HomeStackParamList, 'SearchResults'>

export default function SearchResultsScreen({ route, navigation }: Props) {
  const theme = useAppTheme()
  const favorites = useAppSelector(state => state.favorites.items)
  const toggleFavorite = useToggleFavorite()

  const { originCode, destinationCode, departureDate, returnDate } = route.params

  const [results, setResults] = useState<FlightSearchResults | null>(null)
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

      if (!refresh) setResults(null)

      try {
        const searchResults = await FlightService.searchFlights({
          originCode,
          destinationCode,
          departureDate,
          returnDate,
        })

        if (currentRequest !== requestId.current) return
        setResults(searchResults)
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
    [originCode, destinationCode, departureDate, returnDate],
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

  const sections = results
    ? [
        {
          title: `Outbound · ${originCode} → ${destinationCode} · ${formatDate(departureDate)}`,
          data: results.outboundFlights,
        },
        ...(returnDate
          ? [
              {
                title: `Return · ${destinationCode} → ${originCode} · ${formatDate(returnDate)}`,
                data: results.returnFlights,
              },
            ]
          : []),
      ]
    : []

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
        <SectionList
          style={{ flex: 1 }}
          sections={sections}
          refreshing={isRefreshing}
          onRefresh={() => {
            if (!isRefreshing) loadFlights(true)
          }}
          alwaysBounceVertical
          stickySectionHeadersEnabled={false}
          keyExtractor={flight => flight.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[typography.body, { color: theme.colors.textMuted }]}>
              {returnDate
                ? `${formatDate(departureDate)} – ${formatDate(returnDate)}`
                : `${formatDate(departureDate)} · One way`}
            </Text>
          }
          renderSectionHeader={({ section }) => (
            <Text style={[typography.subtitle, { color: theme.colors.text }]}>
              {section.title} ({section.data.length})
            </Text>
          )}
          renderSectionFooter={({ section }) =>
            section.data.length === 0 ? (
              <Text style={[typography.body, { color: theme.colors.textMuted }]}>
                No flights on this date. Try a different date.
              </Text>
            ) : null
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
})
