import { createSlice } from '@reduxjs/toolkit'
import type { Favorite } from '../types/flight'
import { logout, requireUserId, setSession } from './authSlice'
import { createAppAsyncThunk } from './hooks'
import type { RootState } from './index'
import FavoriteService from '../services/FavoriteService'

const findFavorite = (state: RootState, flightId: string) =>
  state.favorites.items.find(favorite => favorite.flightId === flightId)

export const loadFavorites = createAppAsyncThunk(
  'favorites/load',
  (_: void, { getState }) => FavoriteService.getFavorites(requireUserId(getState())),
  {
    condition: (_, { getState }) => Object.keys(getState().favorites.pendingRequests).length === 0,
  },
)

export const addFavorite = createAppAsyncThunk(
  'favorites/add',
  (flightId: string, { getState }) => FavoriteService.addFavorite(requireUserId(getState()), flightId),
  {
    condition: (flightId, { getState }) =>
      selectAreFavoritesReady(getState()) &&
      !selectIsFavoritePending(getState(), flightId) &&
      !findFavorite(getState(), flightId),
  },
)

export const removeFavorite = createAppAsyncThunk(
  'favorites/remove',
  async (flightId: string, { getState }) => {
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
