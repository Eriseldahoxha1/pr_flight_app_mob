const { readFileSync, writeFileSync } = require('node:fs')
const { dirname, join } = require('node:path')

const directory = dirname(module.filename)
const seedPath = join(directory, 'seed.json')
const databasePath = join(directory, 'db.json')
const reset = process.argv.includes('--reset')
const todayArgument = process.argv.find(argument => argument.startsWith('--today='))
const DAY_MS = 24 * 60 * 60 * 1000

const getToday = () => {
  if (todayArgument) return todayArgument.slice('--today='.length)

  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

const toUtcTime = date => Date.parse(`${date}T00:00:00Z`)

const addDays = (date, days) => new Date(toUtcTime(date) + days * DAY_MS).toISOString().slice(0, 10)

const shiftTimestamp = (timestamp, days) => addDays(timestamp.slice(0, 10), days) + timestamp.slice(10)

const moveFlightsToUpcomingDates = database => {
  const flights = database.flights ?? []
  if (flights.length === 0) return database

  const firstDate = flights.map(flight => flight.departureAt.slice(0, 10)).sort()[0]
  const offset = Math.round((toUtcTime(addDays(getToday(), 1)) - toUtcTime(firstDate)) / DAY_MS)

  return {
    ...database,
    flights: flights.map(flight => ({
      ...flight,
      departureAt: shiftTimestamp(flight.departureAt, offset),
      arrivalAt: shiftTimestamp(flight.arrivalAt, offset),
    })),
  }
}

const database = moveFlightsToUpcomingDates(JSON.parse(readFileSync(seedPath, 'utf8')))

try {
  writeFileSync(databasePath, `${JSON.stringify(database, null, 2)}\n`, { flag: reset ? 'w' : 'wx' })
  console.log(reset ? 'Reset local database from seed.' : 'Created local database from seed.')
} catch (error) {
  if (!reset && error.code === 'EEXIST') {
    console.log('Using existing local database.')
  } else {
    throw error
  }
}
