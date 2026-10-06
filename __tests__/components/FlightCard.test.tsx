import { fireEvent, screen } from '@testing-library/react-native'
import FlightCard from '../../src/components/FlightCard'
import { makeFlight } from '../helpers/fixtures'
import { renderWithStore } from '../helpers/renderWithStore'

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons')

const flight = makeFlight()

const renderCard = (isFavorite = false, isFavoriteDisabled = false) => {
  const onPress = jest.fn()
  const onToggleFavorite = jest.fn()

  renderWithStore(
    <FlightCard
      flight={flight}
      isFavorite={isFavorite}
      isFavoriteDisabled={isFavoriteDisabled}
      onPress={onPress}
      onToggleFavorite={onToggleFavorite}
    />,
  )

  return { onPress, onToggleFavorite }
}

describe('FlightCard', () => {
  it('disables favorite changes while keeping details available', () => {
    const { onPress, onToggleFavorite } = renderCard(false, true)

    fireEvent.press(screen.getByLabelText('Add LH1455 to favorites'))
    fireEvent.press(screen.getByLabelText('View details for Lufthansa LH1455'))

    expect(onToggleFavorite).not.toHaveBeenCalled()
    expect(onPress).toHaveBeenCalledTimes(1)
  })
  it('shows the flight number, airline, times, route and duration', () => {
    renderCard()

    expect(screen.getByText('LH1455')).toBeTruthy()
    expect(screen.getByText('Lufthansa')).toBeTruthy()
    expect(screen.getByText('09:10')).toBeTruthy()
    expect(screen.getByText('11:00')).toBeTruthy()
    expect(screen.getByText('TIA')).toBeTruthy()
    expect(screen.getByText('FCO')).toBeTruthy()
    expect(screen.getByText('1h 50m')).toBeTruthy()
    expect(screen.getByText('On time')).toBeTruthy()
  })

  it('opens the details when the card is tapped', () => {
    const { onPress, onToggleFavorite } = renderCard()

    fireEvent.press(screen.getByLabelText('View details for Lufthansa LH1455'))

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onToggleFavorite).not.toHaveBeenCalled()
  })

  it('toggles the favorite without opening the details', () => {
    const { onPress, onToggleFavorite } = renderCard()

    fireEvent.press(screen.getByLabelText('Add LH1455 to favorites'))

    expect(onToggleFavorite).toHaveBeenCalledTimes(1)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('offers to remove a flight that is already a favorite', () => {
    renderCard(true)

    expect(screen.getByLabelText('Remove LH1455 from favorites')).toBeTruthy()
    expect(screen.queryByLabelText('Add LH1455 to favorites')).toBeNull()
  })
})
