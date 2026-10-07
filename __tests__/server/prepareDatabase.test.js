const { spawnSync } = require('node:child_process')
const { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { dirname, join, resolve } = require('node:path')

let directory
const seed = JSON.stringify({ users: [], airports: [], flights: [], recentSearches: [], favorites: [] })

const prepareDatabase = (...args) =>
  spawnSync(process.execPath, [join(directory, 'prepare-db.cjs'), ...args], { encoding: 'utf8' })

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'flight-database-test-'))
  copyFileSync(resolve(dirname(module.filename), '../../src/server/prepare-db.cjs'), join(directory, 'prepare-db.cjs'))
  writeFileSync(join(directory, 'seed.json'), seed)
})

afterEach(() => {
  rmSync(directory, { recursive: true, force: true })
})

it('creates a missing database from the seed', () => {
  expect(prepareDatabase().status).toBe(0)
  expect(readFileSync(join(directory, 'db.json'), 'utf8')).toBe(seed)
})

it('preserves local data across repeated startups', () => {
  const localData = JSON.stringify({ favorites: [{ id: 1, userId: 2, flightId: 'flight-1' }] })
  writeFileSync(join(directory, 'db.json'), localData)

  expect(prepareDatabase().status).toBe(0)
  expect(prepareDatabase().status).toBe(0)
  expect(readFileSync(join(directory, 'db.json'), 'utf8')).toBe(localData)
  expect(readFileSync(join(directory, 'seed.json'), 'utf8')).toBe(seed)
})

it('replaces local data only when reset is explicitly requested', () => {
  writeFileSync(join(directory, 'db.json'), JSON.stringify({ favorites: [{ id: 1 }] }))

  expect(prepareDatabase('--reset').status).toBe(0)
  expect(readFileSync(join(directory, 'db.json'), 'utf8')).toBe(seed)
  expect(readFileSync(join(directory, 'seed.json'), 'utf8')).toBe(seed)
})

it('fails without erasing the database if the seed is missing', () => {
  const localData = JSON.stringify({ favorites: [{ id: 1 }] })
  writeFileSync(join(directory, 'db.json'), localData)
  rmSync(join(directory, 'seed.json'))

  expect(prepareDatabase('--reset').status).not.toBe(0)
  expect(readFileSync(join(directory, 'db.json'), 'utf8')).toBe(localData)
})
