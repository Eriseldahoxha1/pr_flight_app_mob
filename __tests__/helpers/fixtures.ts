import type { Airport } from '../../src/types/airport'
import type { Favorite, Flight } from '../../src/types/flight'

export const tirana: Airport = {
  id: 'TIA',
  name: 'Tirana International Airport',
  code: 'TIA',
  city: 'Tirana',
  country: 'Albania',
}

export const rome: Airport = {
  id: 'FCO',
  name: 'Rome Fiumicino',
  code: 'FCO',
  city: 'Rome',
  country: 'Italy',
}

export const frankfurt: Airport = {
  id: 'FRA',
  name: 'Frankfurt Airport',
  code: 'FRA',
  city: 'Frankfurt',
  country: 'Germany',
}

export const makeFlight = (overrides: Partial<Flight> = {}): Flight => ({
  id: 'flight-1',
  airline: 'Lufthansa',
  flightNumber: 'LH1455',
  departureAirport: tirana,
  arrivalAirport: rome,
  departureAt: '2026-10-12T09:10:00+02:00',
  arrivalAt: '2026-10-12T11:00:00+02:00',
  aircraft: 'Airbus A320',
  departureGate: 'B12',
  arrivalGate: 'A04',
  status: 'on-time',
  ...overrides,
})

export const makeFavorite = (overrides: Partial<Favorite> = {}): Favorite => ({
  id: 1,
  userId: 1,
  flightId: 'flight-1',
  createdAt: '2026-10-06T10:00:00.000Z',
  ...overrides,
})
