import { validationLabels } from '../constants/labels'

export const validateAirports = (originCode?: string, destinationCode?: string) => {
  const sameAirport = Boolean(originCode && destinationCode && originCode === destinationCode)

  return {
    origin: !originCode ? validationLabels.originRequired : null,
    destination: !destinationCode ? validationLabels.destinationRequired : null,
    route: sameAirport ? validationLabels.sameAirport : null,
  }
}
