const { constants, copyFileSync } = require('node:fs')
const { dirname, join } = require('node:path')

const directory = dirname(module.filename)
const seedPath = join(directory, 'seed.json')
const databasePath = join(directory, 'db.json')
const reset = process.argv.includes('--reset')

try {
  copyFileSync(seedPath, databasePath, reset ? 0 : constants.COPYFILE_EXCL)
  console.log(reset ? 'Reset local database from seed.' : 'Created local database from seed.')
} catch (error) {
  if (!reset && error.code === 'EEXIST') {
    console.log('Using existing local database.')
  } else {
    throw error
  }
}
