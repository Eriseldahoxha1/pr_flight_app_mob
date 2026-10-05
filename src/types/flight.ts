import type { Airport } from './airport'

export type FlightSearchCriteria = {
  originCode: string
  destinationCode: string
  departureDate: string
  arrivalDate: string
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
