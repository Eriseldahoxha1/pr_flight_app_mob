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
)

export const addFavorite = createAsyncThunk<Favorite, string, { state: RootState }>(
  'favorites/add',
  (flightId, { getState }) => FavoriteService.addFavorite(requireUserId(getState()), flightId),
  {
    condition: (flightId, { getState }) =>
      !getState().favorites.pendingFlightIds.includes(flightId) && !findFavorite(getState(), flightId),
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
      !getState().favorites.pendingFlightIds.includes(flightId) && !!findFavorite(getState(), flightId),
  },
)

type FavoritesState = {
  items: Favorite[]
  loadRequestId: string | null
  pendingFlightIds: string[]
  error: string | null
}

const initialState: FavoritesState = {
  items: [],
  loadRequestId: null,
  pendingFlightIds: [],
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
        state.loadRequestId = null
      })
      .addCase(loadFavorites.rejected, (state, { meta }) => {
        if (state.loadRequestId !== meta.requestId) return
        state.loadRequestId = null
        state.error = 'Could not load favorites. Please retry.'
      })
      .addCase(addFavorite.pending, (state, { meta }) => {
        state.pendingFlightIds.push(meta.arg)
      })
      .addCase(addFavorite.fulfilled, (state, { meta, payload }) => {
        if (!state.pendingFlightIds.includes(meta.arg)) return
        state.pendingFlightIds = state.pendingFlightIds.filter(id => id !== meta.arg)
        state.items.unshift(payload)
      })
      .addCase(addFavorite.rejected, (state, { meta }) => {
        if (!state.pendingFlightIds.includes(meta.arg)) return
        state.pendingFlightIds = state.pendingFlightIds.filter(id => id !== meta.arg)
      })
      .addCase(removeFavorite.pending, (state, { meta }) => {
        state.pendingFlightIds.push(meta.arg)
      })
      .addCase(removeFavorite.fulfilled, (state, { meta }) => {
        if (!state.pendingFlightIds.includes(meta.arg)) return
        state.pendingFlightIds = state.pendingFlightIds.filter(id => id !== meta.arg)
        state.items = state.items.filter(favorite => favorite.flightId !== meta.arg)
      })
      .addCase(removeFavorite.rejected, (state, { meta }) => {
        if (!state.pendingFlightIds.includes(meta.arg)) return
        state.pendingFlightIds = state.pendingFlightIds.filter(id => id !== meta.arg)
      })
  },
})

export default favoritesSlice.reducer

export const selectIsFavorite = (state: RootState, flightId: string) => !!findFavorite(state, flightId)

export const selectIsFavoritePending = (state: RootState, flightId: string) =>
  state.favorites.pendingFlightIds.includes(flightId)

export const selectIsLoadingFavorites = (state: RootState) => state.favorites.loadRequestId !== null
