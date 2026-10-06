import { validateFlightDates } from '../../src/utils/validateFlightDates'

describe('validateFlightDates', () => {
  it('requires a departure date', () => {
    expect(validateFlightDates(null, null).departure).toBe('Choose a departure date.')
  })

  it('accepts a one-way trip without a return date', () => {
    expect(validateFlightDates('2026-10-12', null)).toEqual({ departure: null, range: null })
  })

  it('accepts a return date after the departure date', () => {
    expect(validateFlightDates('2026-10-12', '2026-10-15')).toEqual({ departure: null, range: null })
  })

  it('accepts returning on the same day', () => {
    expect(validateFlightDates('2026-10-12', '2026-10-12').range).toBeNull()
  })

  it('rejects a return date before the departure date', () => {
    expect(validateFlightDates('2026-10-12', '2026-10-11').range).toBe('Return date cannot be before departure.')
  })
})
