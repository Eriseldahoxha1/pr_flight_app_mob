import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Favorite } from '../types/flight'
import { logout, setSession } from './authSlice'
import type { RootState } from './index'
import FavoriteService from '../services/FavoriteService'

const requireUserId = (state: RootState) => {
  const userId = state.auth.user?.id
  if (!userId) throw new Error('Not logged in')
  return userId
}
const findFavorite = (state: RootState, flightId: string) =>
  state.favorites.items.find(favorite => favorite.flightId === flightId)

export const loadFavorites = createAsyncThunk<Favorite[], void, { state: RootState }>(
  'favorites/load',
  (_, { getState }) => FavoriteService.getFavorites(requireUserId(getState())),
  {
    condition: (_, { getState }) => Object.keys(getState().favorites.pendingRequests).length === 0,
  },
)

export const addFavorite = createAsyncThunk<Favorite, string, { state: RootState }>(
  'favorites/add',
  (flightId, { getState }) => FavoriteService.addFavorite(requireUserId(getState()), flightId),
  {
    condition: (flightId, { getState }) =>
      selectAreFavoritesReady(getState()) &&
      !selectIsFavoritePending(getState(), flightId) &&
      !findFavorite(getState(), flightId),
  },
)

export const removeFavorite = createAsyncThunk<void, string, { state: RootState }>(
  'favorites/remove',
  async (flightId, { getState }) => {
    const favorite = findFavorite(getState(), flightId)
    if (favorite) await FavoriteService.removeFavorite(favorite.id)
  },
  {
    condition: (flightId, { getState }) =>
      selectAreFavoritesReady(getState()) &&
      !selectIsFavoritePending(getState(), flightId) &&
      !!findFavorite(getState(), flightId),
  },
)

type FavoritesState = {
  items: Favorite[]
  loadRequestId: string | null
  pendingRequests: Partial<Record<string, string>>
  hasLoaded: boolean
  error: string | null
}

const initialState: FavoritesState = {
  items: [],
  loadRequestId: null,
  pendingRequests: {},
  hasLoaded: false,
  error: null,
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(logout, () => initialState)
      .addCase(setSession, () => initialState)
      .addCase(loadFavorites.pending, (state, { meta }) => {
        state.loadRequestId = meta.requestId
        state.error = null
      })
      .addCase(loadFavorites.fulfilled, (state, { meta, payload }) => {
        if (state.loadRequestId !== meta.requestId) return
        state.items = payload
        state.hasLoaded = true
        state.loadRequestId = null
      })
      .addCase(loadFavorites.rejected, (state, { meta }) => {
        if (state.loadRequestId !== meta.requestId) return
        state.loadRequestId = null
        state.error = 'Could not load favorites. Please retry.'
      })
      .addCase(addFavorite.pending, (state, { meta }) => {
        state.pendingRequests[meta.arg] = meta.requestId
      })
      .addCase(addFavorite.fulfilled, (state, { meta, payload }) => {
        if (state.pendingRequests[meta.arg] !== meta.requestId) return
        delete state.pendingRequests[meta.arg]
        state.items = [payload, ...state.items.filter(favorite => favorite.flightId !== payload.flightId)]
      })
      .addCase(addFavorite.rejected, (state, { meta }) => {
        if (state.pendingRequests[meta.arg] !== meta.requestId) return
        delete state.pendingRequests[meta.arg]
      })
      .addCase(removeFavorite.pending, (state, { meta }) => {
        state.pendingRequests[meta.arg] = meta.requestId
      })
      .addCase(removeFavorite.fulfilled, (state, { meta }) => {
        if (state.pendingRequests[meta.arg] !== meta.requestId) return
        delete state.pendingRequests[meta.arg]
        state.items = state.items.filter(favorite => favorite.flightId !== meta.arg)
      })
      .addCase(removeFavorite.rejected, (state, { meta }) => {
        if (state.pendingRequests[meta.arg] !== meta.requestId) return
        delete state.pendingRequests[meta.arg]
      })
  },
})

export default favoritesSlice.reducer

export const selectIsFavorite = (state: RootState, flightId: string) => !!findFavorite(state, flightId)

export const selectIsFavoritePending = (state: RootState, flightId: string) =>
  state.favorites.pendingRequests[flightId] !== undefined

export const selectAreFavoritesReady = (state: RootState) =>
  state.favorites.hasLoaded && state.favorites.loadRequestId === null

export const selectIsLoadingFavorites = (state: RootState) => state.favorites.loadRequestId !== null
