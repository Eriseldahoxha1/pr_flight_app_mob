export const validateFlightDates = (departureDate: string | null, returnDate: string | null) => {
  const invalidOrder = Boolean(departureDate && returnDate && returnDate < departureDate)

  return {
    departure: !departureDate ? 'Choose a departure date.' : null,
    range: invalidOrder ? 'Return date cannot be before departure.' : null,
  }
}
