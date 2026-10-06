import { HttpClient } from '../libs/http/http-client'
import type { Flight, FlightSearchCriteria } from '../types/flight'

class FlightService {
  searchFlights = async (criteria: FlightSearchCriteria): Promise<Flight[]> => {
    const flights = await HttpClient.get<Flight[]>('flights')
    return flights
      .filter(
        flight =>
          flight.departureAirport.code === criteria.originCode &&
          flight.arrivalAirport.code === criteria.destinationCode &&
          flight.departureAt.slice(0, 10) === criteria.departureDate &&
          flight.arrivalAt.slice(0, 10) === criteria.arrivalDate,
      )
      .sort((first, second) => Date.parse(first.departureAt) - Date.parse(second.departureAt))
  }

  getFlight = (id: string) => HttpClient.get<Flight>(`flights/${encodeURIComponent(id)}`)
}

export default new FlightService()
