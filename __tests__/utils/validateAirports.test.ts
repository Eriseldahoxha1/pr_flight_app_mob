import { validateAirports } from '../../src/utils/validateAirports'

describe('validateAirports', () => {
  it('requires both airports', () => {
    expect(validateAirports(undefined, undefined)).toEqual({
      origin: 'Choose an origin airport.',
      destination: 'Choose a destination airport.',
      route: null,
    })
  })

  it('accepts two different airports', () => {
    expect(validateAirports('TIA', 'FCO')).toEqual({ origin: null, destination: null, route: null })
  })

  it('rejects the same origin and destination', () => {
    expect(validateAirports('TIA', 'TIA').route).toBe('Origin and destination must be different.')
  })
})
