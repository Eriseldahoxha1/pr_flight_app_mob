import type { FlightSearchCriteria } from '../types/flight'

export const getSearchKey = ({ originCode, destinationCode, departureDate, returnDate }: FlightSearchCriteria) =>
  [originCode, destinationCode, departureDate, returnDate ?? ''].join('|')
