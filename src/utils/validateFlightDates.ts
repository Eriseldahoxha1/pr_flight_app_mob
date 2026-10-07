import { validationLabels } from '../constants/labels'
import { getToday } from './getToday'

const getDepartureError = (departureDate: string | null, today: string) => {
  if (!departureDate) return validationLabels.departureRequired
  if (departureDate < today) return validationLabels.departureInPast

  return null
}

export const validateFlightDates = (departureDate: string | null, returnDate: string | null, today = getToday()) => {
  const invalidOrder = Boolean(departureDate && returnDate && returnDate < departureDate)

  return {
    departure: getDepartureError(departureDate, today),
    range: invalidOrder ? validationLabels.returnBeforeDeparture : null,
  }
}
