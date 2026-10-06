import { HttpClient } from '../libs/http/http-client'
import type { Flight, FlightSearchCriteria, FlightSearchResults } from '../types/flight'

const findFlights = (flights: Flight[], from: string, to: string, date: string) =>
  flights
    .filter(
      flight =>
        flight.departureAirport.code === from &&
        flight.arrivalAirport.code === to &&
        flight.departureAt.slice(0, 10) === date,
    )
    .sort((first, second) => Date.parse(first.departureAt) - Date.parse(second.departureAt))

class FlightService {
  searchFlights = async ({
    originCode,
    destinationCode,
    departureDate,
    returnDate,
  }: FlightSearchCriteria): Promise<FlightSearchResults> => {
    const flights = await HttpClient.get<Flight[]>('flights')

    return {
      outboundFlights: findFlights(flights, originCode, destinationCode, departureDate),
      returnFlights: returnDate ? findFlights(flights, destinationCode, originCode, returnDate) : [],
    }
  }

  getFlight = (id: string) => HttpClient.get<Flight>(`flights/${encodeURIComponent(id)}`)

  getFlightsByIds = async (ids: string[]) => {
    if (ids.length === 0) return []
    return HttpClient.get<Flight[]>('flights', { id: ids })
  }
}

export default new FlightService()
