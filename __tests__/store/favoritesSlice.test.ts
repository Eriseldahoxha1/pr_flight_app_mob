import FavoriteService from '../../src/services/FavoriteService'
import { logout, setSession } from '../../src/store/authSlice'
import favoritesReducer, {
  addFavorite,
  loadFavorites,
  removeFavorite,
  selectIsFavorite,
  selectIsFavoritePending,
  selectIsLoadingFavorites,
} from '../../src/store/favoritesSlice'
import { makeFavorite } from '../helpers/fixtures'
import { createTestStore } from '../helpers/renderWithStore'

jest.mock('../../src/services/FavoriteService', () => ({
  __esModule: true,
  default: {
    getFavorites: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  },
}))

const mockedService = jest.mocked(FavoriteService)

const initialState = favoritesReducer(undefined, { type: 'init' })
const savedFavorite = makeFavorite({ id: 1, flightId: 'flight-1' })
const newFavorite = makeFavorite({ id: 2, flightId: 'flight-2' })

const loadedState = () =>
  favoritesReducer(
    favoritesReducer(initialState, loadFavorites.pending('load-1')),
    loadFavorites.fulfilled([savedFavorite], 'load-1'),
  )

const loggedInStore = () => {
  const store = createTestStore()
  store.dispatch(setSession({ accessToken: 'token', user: { id: 1, name: 'Demo User', email: 'demo@example.com' } }))
  return store
}

describe('favoritesSlice reducer', () => {
  it('starts empty', () => {
    expect(initialState).toEqual({ items: [], loadRequestId: null, pendingRequests: {}, hasLoaded: false, error: null })
  })

  it('stores the loaded favorites', () => {
    const state = loadedState()

    expect(state.items).toEqual([savedFavorite])
    expect(state.loadRequestId).toBeNull()
  })

  it('ignores a load response from an older request', () => {
    const loading = favoritesReducer(initialState, loadFavorites.pending('load-2'))
    const state = favoritesReducer(loading, loadFavorites.fulfilled([savedFavorite], 'load-1'))

    expect(state.items).toEqual([])
    expect(state.loadRequestId).toBe('load-2')
  })

  it('sets an error when loading fails', () => {
    const loading = favoritesReducer(initialState, loadFavorites.pending('load-1'))
    const state = favoritesReducer(loading, loadFavorites.rejected(new Error('Network'), 'load-1'))

    expect(state.error).toBe('Could not load favorites. Please retry.')
  })

  it('adds a saved favorite to the top of the list', () => {
    const adding = favoritesReducer(loadedState(), addFavorite.pending('add-1', 'flight-2'))
    expect(adding.pendingRequests).toEqual({ 'flight-2': 'add-1' })

    const state = favoritesReducer(adding, addFavorite.fulfilled(newFavorite, 'add-1', 'flight-2'))

    expect(state.items).toEqual([newFavorite, savedFavorite])
    expect(state.pendingRequests).toEqual({})
  })

  it('keeps the list unchanged when adding fails', () => {
    const adding = favoritesReducer(loadedState(), addFavorite.pending('add-1', 'flight-2'))
    const state = favoritesReducer(adding, addFavorite.rejected(new Error('Network'), 'add-1', 'flight-2'))

    expect(state.items).toEqual([savedFavorite])
    expect(state.pendingRequests).toEqual({})
    expect(state.error).toBeNull()
  })

  it('removes a favorite by flight id', () => {
    const removing = favoritesReducer(loadedState(), removeFavorite.pending('remove-1', 'flight-1'))
    const state = favoritesReducer(removing, removeFavorite.fulfilled(undefined, 'remove-1', 'flight-1'))

    expect(state.items).toEqual([])
    expect(state.pendingRequests).toEqual({})
  })

  it('resets on logout', () => {
    expect(favoritesReducer(loadedState(), logout())).toEqual(initialState)
  })

  it('ignores a save that finishes after logout', () => {
    const adding = favoritesReducer(loadedState(), addFavorite.pending('add-1', 'flight-2'))
    const loggedOut = favoritesReducer(adding, logout())
    const state = favoritesReducer(loggedOut, addFavorite.fulfilled(newFavorite, 'add-1', 'flight-2'))

    expect(state.items).toEqual([])
  })

  it('does not duplicate a favorite already received from loading', () => {
    const adding = favoritesReducer(loadedState(), addFavorite.pending('add-1', 'flight-1'))
    const state = favoritesReducer(adding, addFavorite.fulfilled(savedFavorite, 'add-1', 'flight-1'))

    expect(state.items).toEqual([savedFavorite])
  })

  it('ignores old successes and failures while the new account saves the same flight', () => {
    const adding = favoritesReducer(loadedState(), addFavorite.pending('old-request', 'flight-2'))
    const switched = favoritesReducer(
      favoritesReducer(adding, logout()),
      setSession({ accessToken: 'new-token', user: { id: 2, name: 'Second User', email: 'second@example.com' } }),
    )
    const pending = favoritesReducer(switched, addFavorite.pending('new-request', 'flight-2'))

    for (const action of [
      addFavorite.fulfilled(newFavorite, 'old-request', 'flight-2'),
      addFavorite.rejected(new Error('Network'), 'old-request', 'flight-2'),
      removeFavorite.fulfilled(undefined, 'old-request', 'flight-2'),
      removeFavorite.rejected(new Error('Network'), 'old-request', 'flight-2'),
    ]) {
      expect(favoritesReducer(pending, action)).toEqual(pending)
    }

    const secondUsersFavorite = makeFavorite({ id: 3, userId: 2, flightId: 'flight-2' })
    const state = favoritesReducer(pending, addFavorite.fulfilled(secondUsersFavorite, 'new-request', 'flight-2'))
    expect(state.items).toEqual([secondUsersFavorite])
    expect(state.pendingRequests).toEqual({})
  })
})

describe('favorites selectors', () => {
  it('report favorites, pending saves and loading', () => {
    const store = createTestStore()

    store.dispatch(loadFavorites.pending('load-1'))
    expect(selectIsLoadingFavorites(store.getState())).toBe(true)

    store.dispatch(loadFavorites.fulfilled([savedFavorite], 'load-1'))
    store.dispatch(addFavorite.pending('add-1', 'flight-2'))

    const state = store.getState()
    expect(selectIsLoadingFavorites(state)).toBe(false)
    expect(selectIsFavorite(state, 'flight-1')).toBe(true)
    expect(selectIsFavorite(state, 'flight-2')).toBe(false)
    expect(selectIsFavoritePending(state, 'flight-2')).toBe(true)
    expect(selectIsFavoritePending(state, 'flight-1')).toBe(false)
  })
})

describe('favorite thunks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sends one request when the heart is tapped twice quickly', async () => {
    mockedService.addFavorite.mockResolvedValue(newFavorite)
    mockedService.getFavorites.mockResolvedValue([])
    const store = loggedInStore()
    await store.dispatch(loadFavorites())

    await Promise.all([store.dispatch(addFavorite('flight-2')), store.dispatch(addFavorite('flight-2'))])

    expect(mockedService.addFavorite).toHaveBeenCalledTimes(1)
    expect(mockedService.addFavorite).toHaveBeenCalledWith(1, 'flight-2')
    expect(store.getState().favorites.items).toEqual([newFavorite])
  })

  it('does not add a flight that is already a favorite', async () => {
    mockedService.getFavorites.mockResolvedValue([savedFavorite])
    const store = loggedInStore()
    await store.dispatch(loadFavorites())

    await store.dispatch(addFavorite('flight-1'))

    expect(mockedService.addFavorite).not.toHaveBeenCalled()
  })

  it('deletes the saved favorite by its database id', async () => {
    mockedService.getFavorites.mockResolvedValue([savedFavorite])
    mockedService.removeFavorite.mockResolvedValue({} as never)
    const store = loggedInStore()
    await store.dispatch(loadFavorites())

    await store.dispatch(removeFavorite('flight-1'))

    expect(mockedService.removeFavorite).toHaveBeenCalledWith(savedFavorite.id)
    expect(store.getState().favorites.items).toEqual([])
  })

  it('waits for the initial list before allowing saves, including after a failed load', async () => {
    const store = loggedInStore()
    await store.dispatch(addFavorite('flight-2'))
    mockedService.getFavorites.mockRejectedValueOnce(new Error('Network'))
    await store.dispatch(loadFavorites())
    await store.dispatch(addFavorite('flight-2'))

    expect(mockedService.addFavorite).not.toHaveBeenCalled()

    mockedService.getFavorites.mockResolvedValueOnce([savedFavorite])
    await store.dispatch(loadFavorites())
    mockedService.addFavorite.mockResolvedValueOnce(newFavorite)
    await store.dispatch(addFavorite('flight-2'))

    expect(store.getState().favorites.items).toEqual([newFavorite, savedFavorite])
  })

  it('blocks additions and removals while a refreshed list is in flight', async () => {
    const store = loggedInStore()
    mockedService.getFavorites.mockResolvedValueOnce([savedFavorite])
    await store.dispatch(loadFavorites())
    let finishLoad!: (favorites: (typeof savedFavorite)[]) => void
    mockedService.getFavorites.mockReturnValueOnce(
      new Promise(resolve => {
        finishLoad = resolve
      }),
    )
    const loading = store.dispatch(loadFavorites())

    await store.dispatch(addFavorite('flight-2'))
    await store.dispatch(removeFavorite('flight-1'))
    expect(mockedService.addFavorite).not.toHaveBeenCalled()
    expect(mockedService.removeFavorite).not.toHaveBeenCalled()

    finishLoad([savedFavorite])
    await loading
    mockedService.addFavorite.mockResolvedValueOnce(newFavorite)
    await store.dispatch(addFavorite('flight-2'))
    expect(store.getState().favorites.items).toEqual([newFavorite, savedFavorite])
  })

  it('does not start loading while a save is pending', async () => {
    const store = loggedInStore()
    mockedService.getFavorites.mockResolvedValueOnce([savedFavorite])
    await store.dispatch(loadFavorites())
    let finishSave!: (favorite: typeof newFavorite) => void
    mockedService.addFavorite.mockReturnValueOnce(
      new Promise(resolve => {
        finishSave = resolve
      }),
    )
    const saving = store.dispatch(addFavorite('flight-2'))

    await store.dispatch(loadFavorites())
    expect(mockedService.getFavorites).toHaveBeenCalledTimes(1)

    finishSave(newFavorite)
    await saving
    expect(store.getState().favorites.items).toEqual([newFavorite, savedFavorite])
  })

  it('does not start loading while a removal is pending', async () => {
    const store = loggedInStore()
    mockedService.getFavorites.mockResolvedValueOnce([savedFavorite])
    await store.dispatch(loadFavorites())
    let finishRemove!: () => void
    mockedService.removeFavorite.mockReturnValueOnce(
      new Promise(resolve => {
        finishRemove = () => resolve({} as never)
      }),
    )
    const removing = store.dispatch(removeFavorite('flight-1'))

    await store.dispatch(loadFavorites())
    expect(mockedService.getFavorites).toHaveBeenCalledTimes(1)

    finishRemove()
    await removing
    expect(store.getState().favorites.items).toEqual([])
  })
})
