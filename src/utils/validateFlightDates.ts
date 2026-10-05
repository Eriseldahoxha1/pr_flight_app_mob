export const validateFlightDates = (departureDate: string | null, arrivalDate: string | null) => {
  // Calendar values use YYYY-MM-DD, so string comparison preserves date order.
  const invalidOrder = Boolean(departureDate && arrivalDate && arrivalDate < departureDate)

  return {
    departure: !departureDate ? 'Choose a departure date.' : null,
    arrival: !arrivalDate ? 'Choose an arrival date.' : null,
    range: invalidOrder ? 'Arrival date cannot be before departure.' : null,
  }
}
