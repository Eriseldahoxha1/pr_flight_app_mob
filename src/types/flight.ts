import { Airport } from "./airport";

export type Flight = {
  id: string;
  airline: string;
  gate: string;
  status: string;
  flightNumber: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureAt: Date;
  arrivalAt: Date;
};