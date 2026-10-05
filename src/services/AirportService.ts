import { HttpClient } from '../libs/http/http-client'
import { Airport } from '../types/airport'

class AirportService {
  getAirports = async () => await HttpClient.get<Airport[]>('airports')
}

export default new AirportService()
