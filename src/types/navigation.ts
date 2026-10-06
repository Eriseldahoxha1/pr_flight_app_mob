import { FlightSearchCriteria } from './flight'

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
}

export type MoreStackParamList = {
  MoreMenu: undefined
  Settings: undefined
  Help: undefined
  About: undefined
  Contact: undefined
}

export type HomeStackParamList = {
  Dashboard: undefined
  SearchResults: FlightSearchCriteria
}
