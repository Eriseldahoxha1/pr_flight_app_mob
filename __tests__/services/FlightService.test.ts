import { HttpClient } from '../../src/libs/http/http-client'
import FlightService from '../../src/services/FlightService'
import { frankfurt, makeFlight, rome, tirana } from '../helpers/fixtures'

jest.mock('../../src/libs/http/http-client', () => ({
  HttpClient: { get: jest.fn() },
}))

const mockedGet = HttpClient.get as jest.Mock

const lateOutbound = makeFlight({ id: 'late', departureAt: '2026-10-12T18:00:00+02:00' })
const earlyOutbound = makeFlight({ id: 'early', departureAt: '2026-10-12T09:10:00+02:00' })
const nextDayOutbound = makeFlight({ id: 'next-day', departureAt: '2026-10-13T09:10:00+02:00' })
const otherDestination = makeFlight({ id: 'frankfurt', arrivalAirport: frankfurt })
const returnFlight = makeFlight({
  id: 'return',
  departureAirport: rome,
  arrivalAirport: tirana,
  departureAt: '2026-10-14T18:30:00+02:00',
})

const flights = [lateOutbound, returnFlight, earlyOutbound, nextDayOutbound, otherDestination]

describe('FlightService.searchFlights', () => {
  beforeEach(() => {
    mockedGet.mockResolvedValue(flights)
  })

  it('finds one-way flights on the departure date, sorted by departure time', async () => {
    const results = await FlightService.searchFlights({
      originCode: 'TIA',
      destinationCode: 'FCO',
      departureDate: '2026-10-12',
      returnDate: null,
    })

    expect(results.outboundFlights.map(flight => flight.id)).toEqual(['early', 'late'])
    expect(results.returnFlights).toEqual([])
  })

  it('finds return flights with the airports swapped on the return date', async () => {
    const results = await FlightService.searchFlights({
      originCode: 'TIA',
      destinationCode: 'FCO',
      departureDate: '2026-10-12',
      returnDate: '2026-10-14',
    })

    expect(results.outboundFlights.map(flight => flight.id)).toEqual(['early', 'late'])
    expect(results.returnFlights.map(flight => flight.id)).toEqual(['return'])
  })

  it('returns an empty return list when nothing flies back on that date', async () => {
    const results = await FlightService.searchFlights({
      originCode: 'TIA',
      destinationCode: 'FCO',
      departureDate: '2026-10-12',
      returnDate: '2026-10-16',
    })

    expect(results.outboundFlights).toHaveLength(2)
    expect(results.returnFlights).toEqual([])
  })
})

describe('FlightService.getFlightsByIds', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('does not request every flight when there are no ids', async () => {
    await expect(FlightService.getFlightsByIds([])).resolves.toEqual([])
    expect(mockedGet).not.toHaveBeenCalled()
  })

  it('requests only the given ids', async () => {
    mockedGet.mockResolvedValue([earlyOutbound])

    await FlightService.getFlightsByIds(['early'])

    expect(mockedGet).toHaveBeenCalledWith('flights', { id: ['early'] })
  })
})
