import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { useAppTheme } from '../hooks/useAppTheme'
import { radii, sizes, spacing, typography } from '../theme/tokens'
import { useEffect, useRef, useState } from 'react'
import AirportService from '../services/AirportService'
import type { Airport } from '../types/airport'
import Ionicons from '@expo/vector-icons/Ionicons'
import AirportPicker from '../components/AirportPicker'
import DatePicker from '../components/DatePicker'
import { validateAirports } from '../utils/validateAirports'
import { validateFlightDates } from '../utils/validateFlightDates'
import RecentSearches from '../components/RecentSearches'
import type { FlightSearchCriteria, RecentSearch } from '../types/flight'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { HomeStackParamList } from '../types/navigation'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadRecentSearches, saveRecentSearch } from '../store/recentSearchesSlice'
import Toast from 'react-native-toast-message'
import { formatDate } from '../utils/formatDate'

type Props = NativeStackScreenProps<HomeStackParamList, 'Dashboard'>

export default function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme()
  const dispatch = useAppDispatch()
  const userId = useAppSelector(state => state.auth.user?.id)
  const history = useAppSelector(state => state.recentSearches)
  const isSavingSearch = Boolean(history.saveRequestId)
  const [isRefilling, setIsRefilling] = useState(false)
  const isActive = useRef(false)

  useEffect(() => {
    isActive.current = true
    const request = userId ? dispatch(loadRecentSearches()) : null
    return () => {
      isActive.current = false
      request?.abort()
    }
  }, [dispatch, userId])

  const [airports, setAirports] = useState<Airport[]>([])
  const [isLoadingAirports, setIsLoadingAirports] = useState<boolean>(false)
  const [airportsError, setAirportsError] = useState<string | null>(null)
  const [activeAirportField, setActiveAirportField] = useState<'origin' | 'destination' | null>(null)
  const [origin, setOrigin] = useState<Airport | null>(null)
  const [destination, setDestination] = useState<Airport | null>(null)
  const [departureDate, setDepartureDate] = useState<string | null>(null)
  const [returnDate, setReturnDate] = useState<string | null>(null)
  const [activeDateField, setActiveDateField] = useState<'departure' | 'return' | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const loadAirports = async () => {
    if (isLoadingAirports || airports.length) return

    setIsLoadingAirports(true)
    setAirportsError(null)

    try {
      const airports = await AirportService.getAirports()
      setAirports(airports)
    } catch {
      setAirportsError('Could not load airports. Please try again.')
    } finally {
      setIsLoadingAirports(false)
    }
  }

  const openAirportPicker = (field: 'origin' | 'destination') => {
    setActiveAirportField(field)
    loadAirports()
  }

  const selectAirport = (airport: Airport) => {
    if (activeAirportField === 'origin') {
      setOrigin(airport)
    } else if (activeAirportField === 'destination') {
      setDestination(airport)
    }
  }

  const openDatePicker = (field: 'departure' | 'return') => {
    setActiveDateField(field)
  }

  const confirmDate = (date: string) => {
    if (activeDateField === 'departure') {
      setDepartureDate(date)
      if (returnDate && returnDate < date) {
        setReturnDate(null)
      }
    } else if (activeDateField === 'return') {
      setReturnDate(date)
    }
  }

  const airportFields = [
    { field: 'origin', label: 'Origin', airport: origin },
    { field: 'destination', label: 'Destination', airport: destination },
  ] as const

  const dateFields = [
    { field: 'departure', label: 'Departure Date', date: departureDate, placeholder: 'Choose date' },
    { field: 'return', label: 'Return Date', date: returnDate, placeholder: 'One way (optional)' },
  ] as const

  const airportErrors = validateAirports(origin?.code, destination?.code)
  const areAirportsValid = !airportErrors.origin && !airportErrors.destination && !airportErrors.route

  const dateErrors = validateFlightDates(departureDate, returnDate)
  const areDatesValid = !dateErrors.departure && !dateErrors.range
  const handleSearch = () => {
    setHasSubmitted(true)
    if (
      !areAirportsValid ||
      !areDatesValid ||
      !origin ||
      !destination ||
      !departureDate ||
      isSavingSearch
    )
      return

    const criteria: FlightSearchCriteria = {
      originCode: origin.code,
      destinationCode: destination.code,
      departureDate,
      returnDate,
    }

    dispatch(saveRecentSearch(criteria))
    navigation.navigate('SearchResults', criteria)
  }

  const handleRecentSearch = async (search: RecentSearch) => {
    if (isRefilling) return
    setIsRefilling(true)
    try {
      const availableAirports = airports.length ? airports : await AirportService.getAirports()
      if (!isActive.current) return
      const savedOrigin = availableAirports.find(airport => airport.code === search.originCode)
      const savedDestination = availableAirports.find(airport => airport.code === search.destinationCode)
      if (!savedOrigin || !savedDestination) {
        throw new Error('Airport unavailable')
      }
      setAirports(availableAirports)
      setOrigin(savedOrigin)
      setDestination(savedDestination)
      setDepartureDate(search.departureDate)
      setReturnDate(search.returnDate)
      setHasSubmitted(false)
      setAirportsError('')
    } catch {
      if (isActive.current) {
        Toast.show({
          type: 'error',
          text1: 'Could not restore this search',
          text2: 'Check your connection and airport availability, then try again.',
        })
      }
    } finally {
      if (isActive.current) setIsRefilling(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View pointerEvents={isRefilling ? 'none' : 'auto'}>
          {airportFields.map(({ field, label, airport }) => {
            const fieldError = hasSubmitted ? airportErrors[field] : null
            const isInvalid = Boolean(fieldError || airportErrors.route)
            const errorMessage = fieldError ?? (field === 'destination' ? airportErrors.route : null)

            return (
              <View key={field} style={styles.field}>
                <Text style={[typography.label, { color: theme.colors.text }]}>{label}</Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${label}: ${airport ? `${airport.code}, ${airport.city}` : 'Choose airport'}`}
                  onPress={() => openAirportPicker(field)}
                  style={({ pressed }) => [
                    styles.airportInput,
                    {
                      borderColor: isInvalid ? theme.colors.error : theme.colors.inputBorder,
                      backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
                    },
                  ]}
                >
                  <Ionicons name="airplane-outline" size={sizes.icon} color={theme.colors.text} accessible={false} />

                  <Text
                    style={[
                      typography.body,
                      styles.fieldValue,
                      {
                        color: airport ? theme.colors.text : theme.colors.placeholder,
                      },
                    ]}
                  >
                    {airport ? `${airport.code} · ${airport.city}` : 'Choose airport'}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={sizes.iconSmall}
                    color={theme.colors.textMuted}
                    accessible={false}
                  />
                </Pressable>
                {errorMessage && (
                  <Text style={[typography.caption, { color: theme.colors.error }]}>{errorMessage}</Text>
                )}
              </View>
            )
          })}

          {dateFields.map(({ field, label, date, placeholder }) => {
            const fieldError = hasSubmitted && field === 'departure' ? dateErrors.departure : null
            const isInvalid = Boolean(fieldError || dateErrors.range)
            const errorMessage = fieldError ?? (field === 'return' ? dateErrors.range : null)
            const canClear = field === 'return' && date !== null

            return (
              <View key={field} style={styles.field}>
                <Text style={[typography.label, { color: theme.colors.text }]}>{label}</Text>

                <View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${label}: ${date ? formatDate(date) : placeholder}`}
                    onPress={() => openDatePicker(field)}
                    style={({ pressed }) => [
                      styles.airportInput,
                      {
                        borderColor: isInvalid ? theme.colors.error : theme.colors.inputBorder,
                        backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
                      },
                    ]}
                  >
                    <Ionicons name="calendar" size={sizes.icon} color={theme.colors.text} accessible={false} />

                    <Text
                      style={[
                        typography.body,
                        styles.fieldValue,
                        {
                          color: date ? theme.colors.text : theme.colors.placeholder,
                        },
                      ]}
                    >
                      {date ? formatDate(date) : placeholder}
                    </Text>

                    {!canClear && (
                      <Ionicons
                        name="chevron-down"
                        size={sizes.iconSmall}
                        color={theme.colors.textMuted}
                        accessible={false}
                      />
                    )}
                  </Pressable>

                  {canClear && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Clear return date"
                      onPress={() => setReturnDate(null)}
                      hitSlop={spacing.sm}
                      style={styles.clearDate}
                    >
                      <Ionicons name="close-circle" size={sizes.icon} color={theme.colors.textMuted} accessible={false} />
                    </Pressable>
                  )}
                </View>
                {errorMessage && (
                  <Text style={[typography.caption, { color: theme.colors.error }]}>{errorMessage}</Text>
                )}
              </View>
            )
          })}
          <Pressable
            accessibilityRole="button"
            onPress={handleSearch}
            disabled={isSavingSearch || isRefilling}
            accessibilityState={{ disabled: isSavingSearch || isRefilling, busy: isSavingSearch }}
            style={({ pressed }) => [
              styles.searchButton,
              {
                backgroundColor: isSavingSearch
                  ? theme.colors.disabled
                  : pressed
                    ? theme.colors.primaryPressed
                    : theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[typography.button, { color: isSavingSearch ? theme.colors.onDisabled : theme.colors.onPrimary }]}
            >
              {isSavingSearch ? 'Saving search…' : 'Search flights'}
            </Text>
          </Pressable>
        </View>
        {history.loadRequestId ? (
          <ActivityIndicator
            style={styles.historyFeedback}
            color={theme.colors.text}
            accessibilityLabel="Loading recent searches"
          />
        ) : (
          <>
            {history.error && (
              <View style={styles.historyFeedback}>
                <Text style={[typography.body, { color: theme.colors.error }]}>{history.error}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void dispatch(loadRecentSearches())
                  }}
                  style={styles.retryButton}
                >
                  <Text style={[typography.label, { color: theme.colors.text }]}>Reload history</Text>
                </Pressable>
              </View>
            )}
            {(!history.error || history.items.length > 0) && (
              <View pointerEvents={isRefilling ? 'none' : 'auto'}>
                <RecentSearches
                  searches={history.items}
                  onSelect={search => {
                    void handleRecentSearch(search)
                  }}
                />
              </View>
            )}
            {isRefilling && <ActivityIndicator color={theme.colors.text} accessibilityLabel="Restoring search" />}
          </>
        )}
      </ScrollView>

      <AirportPicker
        visible={activeAirportField !== null}
        title={activeAirportField === 'origin' ? 'Choose origin' : 'Choose destination'}
        airports={airports}
        selectedAirportId={activeAirportField === 'origin' ? origin?.id : destination?.id}
        isLoading={isLoadingAirports}
        error={airportsError}
        onSelect={selectAirport}
        onClose={() => setActiveAirportField(null)}
        onRetry={() => {
          void loadAirports()
        }}
      />

      <DatePicker
        key={activeDateField ?? 'closed'}
        visible={activeDateField !== null}
        title={activeDateField === 'departure' ? 'Choose departure date' : 'Choose return date'}
        value={activeDateField === 'departure' ? departureDate : returnDate}
        minDate={activeDateField === 'return' ? (departureDate ?? undefined) : undefined}
        onConfirm={confirmDate}
        onClose={() => setActiveDateField(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    flexGrow: 1,
  },
  historyFeedback: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  retryButton: {
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
  },
  field: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  airportInput: {
    minHeight: sizes.inputMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  fieldValue: {
    flex: 1,
  },
  clearDate: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: spacing.lg,
    justifyContent: 'center',
  },
  searchButton: {
    minHeight: sizes.buttonMinHeight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
