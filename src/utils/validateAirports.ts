export const validateAirports = (originCode?: string, destinationCode?: string) => {
  const sameAirport = Boolean(originCode && destinationCode && originCode === destinationCode)

  return {
    origin: !originCode ? 'Choose an origin airport.' : null,
    destination: !destinationCode ? 'Choose a destination airport.' : null,
    route: sameAirport ? 'Origin and destination must be different.' : null,
  }
}
