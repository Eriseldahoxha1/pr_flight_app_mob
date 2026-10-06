import type { Airport } from './airport'

export type FlightSearchCriteria = {
  originCode: string
  destinationCode: string
  departureDate: string
  returnDate: string | null
}

export type RecentSearch = FlightSearchCriteria & {
  id: number
  userId: number
  createdAt: string
}

export type Flight = {
  id: string
  airline: string
  flightNumber: string
  departureAirport: Airport
  arrivalAirport: Airport
  departureAt: string
  arrivalAt: string
  aircraft: string
  departureGate: string
  arrivalGate: string
  status: 'on-time' | 'delayed' | 'cancelled'
}

export type FlightSearchResults = {
  outboundFlights: Flight[]
  returnFlights: Flight[]
}

export type Favorite = {
  id: number
  userId: number
  flightId: string
  createdAt: string
}
