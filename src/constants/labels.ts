import type { Flight } from '../types/flight'
import type { ThemePreference } from '../types/theme'

export const navigationLabels = {
  home: 'Home',
  favoriteFlights: 'Favorite Flights',
  profile: 'Profile',
  more: 'More',
  searchResults: 'Search Results',
  flightDetails: 'Flight Details',
  settings: 'Settings',
  help: 'Help',
  about: 'About',
  contact: 'Contact',
} as const

export const flightStatusLabels: Record<Flight['status'], string> = {
  'on-time': 'On time',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
}

export const commonLabels = {
  retry: 'Retry',
  cancel: 'Cancel',
  confirm: 'Confirm',
  notAvailable: 'Not available',
  oneWay: 'One way',
  tryAgain: 'Please try again.',
} as const

export const validationLabels = {
  emailRequired: 'Email is required',
  emailInvalid: 'Enter a valid email address',
  passwordRequired: 'Password is required',
  originRequired: 'Choose an origin airport.',
  destinationRequired: 'Choose a destination airport.',
  sameAirport: 'Origin and destination must be different.',
  departureRequired: 'Choose a departure date.',
  departureInPast: 'Departure date cannot be in the past.',
  returnBeforeDeparture: 'Return date cannot be before departure.',
} as const

export const authLabels = {
  title: 'Welcome aboard',
  subtitle: 'Log in to manage your next journey.',
  email: 'Email address',
  emailPlaceholder: 'you@example.com',
  password: 'Password',
  passwordPlaceholder: 'Enter your password',
  logIn: 'Log in',
  loggingIn: 'Logging in…',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  invalidCredentials: 'Incorrect email or password.',
  networkError: "Can't reach the server. Check your connection and try again.",
  unknownError: 'Something went wrong. Please try again.',
  sessionExpired: 'Please log in again',
  restoreFailed: 'Could not restore your session. Reopen the app to retry.',
} as const

export const homeLabels = {
  origin: 'Origin',
  destination: 'Destination',
  departureDate: 'Departure Date',
  returnDate: 'Return Date',
  chooseAirport: 'Choose airport',
  chooseDate: 'Choose date',
  returnPlaceholder: 'One way (optional)',
  chooseOrigin: 'Choose origin',
  chooseDestination: 'Choose destination',
  chooseDepartureDate: 'Choose departure date',
  chooseReturnDate: 'Choose return date',
  clearReturnDate: 'Clear return date',
  searchFlights: 'Search flights',
  savingSearch: 'Saving search…',
  airportsError: 'Could not load airports. Please try again.',
  restoreSearchError: 'Could not restore this search',
  restoreSearchErrorDetail: 'Check your connection and airport availability, then try again.',
  loadingRecentSearches: 'Loading recent searches',
  reloadHistory: 'Reload history',
  restoringSearch: 'Restoring search',
} as const

export const recentSearchLabels = {
  title: 'Recent searches',
  empty: 'Your recent searches will appear here.',
  lastSearches: (count: number) => `Last ${count} searches`,
  useSearch: 'Use search',
  useSearchHint: 'Fills the flight search form with these airports and dates.',
  useSearchA11y: (origin: string, destination: string, dates: string) =>
    `Use search from ${origin} to ${destination}, ${dates}`,
} as const

export const airportPickerLabels = {
  loading: 'Loading airports',
  close: 'Close airport picker',
  searchPlaceholder: 'Search airports or cities',
  search: 'Search airports',
  clearSearch: 'Clear search',
  noAirports: 'No airports are available.',
  noMatches: 'No matches. Try another city or airport code.',
} as const

export const searchResultsLabels = {
  loading: 'Loading flights',
  refreshError: 'Could not refresh flights',
  refreshErrorDetail: 'Check your connection and try again.',
  loadError: 'Could not load flights. Check your connection and try again.',
  noFlights: 'No flights on this date. Try a different date.',
  outbound: 'Outbound',
  return: 'Return',
} as const

export const flightLabels = {
  loadingDetails: 'Loading flight details',
  notFound: 'This flight is no longer available.',
  detailsError: 'Could not load flight details. Check your connection and try again.',
  aircraft: 'Aircraft',
  departureGate: 'Departure gate',
  arrivalGate: 'Arrival gate',
  saveFavorite: 'Save to favorites',
  removeFavorite: 'Remove from favorites',
  viewDetailsA11y: (airline: string, flightNumber: string) => `View details for ${airline} ${flightNumber}`,
  addFavoriteA11y: (flightNumber: string) => `Add ${flightNumber} to favorites`,
  removeFavoriteA11y: (flightNumber: string) => `Remove ${flightNumber} from favorites`,
} as const

export const favoritesLabels = {
  loading: 'Loading favorite flights',
  loadError: 'Could not load favorite flights. Please retry.',
  emptyTitle: 'No favorite flights yet',
  emptyDescription: 'Tap the heart on a flight to save it here.',
} as const

export const profileLabels = {
  name: 'Name',
  email: 'Email',
  appearance: 'Appearance',
  logOut: 'Log out',
  logOutConfirm: 'Log out?',
  loggingOut: 'Logging out…',
  logOutError: 'Could not log out',
  themeSaveError: 'Could not save your theme choice',
  themeSaveErrorDetail: 'It applies now, but will reset when the app restarts.',
} as const

export const themeLabels: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}
