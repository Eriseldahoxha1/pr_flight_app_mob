import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from './index'
import type { FlightSearchCriteria, RecentSearch } from '../types/flight'
import { logout, setSession } from './authSlice'
import RecentSearchService from '../services/RecentSearchService'

const MAX_RECENT_SEARCHES = 10

const requireUserId = (state: RootState) => {
  const userId = state.auth.user?.id
  if (!userId) throw new Error('Not logged in')
  return userId
}

export const loadRecentSearches = createAsyncThunk<RecentSearch[], void, { state: RootState }>(
  'recentSearches/load',
  async (_, { getState }) => {
    const searches = await RecentSearchService.getSearches(requireUserId(getState()))
    return searches.slice(0, MAX_RECENT_SEARCHES)
  },
)

export const saveRecentSearch = createAsyncThunk<RecentSearch[], FlightSearchCriteria, { state: RootState }>(
  'recentSearches/save',
  async (criteria, { getState }) => RecentSearchService.saveSearch(requireUserId(getState()), criteria),
  { condition: (_, { getState }) => !getState().recentSearches.saveRequestId },
)

type RecentSearchesState = {
  items: RecentSearch[]
  loadRequestId: string | null
  saveRequestId: string | null
  error: string | null
}

const initialState: RecentSearchesState = { items: [], loadRequestId: null, saveRequestId: null, error: null }

const recentSearchesSlice = createSlice({
  name: 'recentSearches',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(logout, () => initialState)
      .addCase(setSession, () => initialState)

      .addCase(loadRecentSearches.pending, (state, { meta }) => {
        state.loadRequestId = meta.requestId
        state.error = null
      })
      .addCase(loadRecentSearches.fulfilled, (state, { meta, payload }) => {
        if (state.loadRequestId !== meta.requestId) return
        state.items = payload
        state.loadRequestId = null
      })
      .addCase(loadRecentSearches.rejected, (state, { meta }) => {
        if (state.loadRequestId !== meta.requestId) return
        state.loadRequestId = null
        state.error = 'Could not load recent searches. Please retry.'
      })

      .addCase(saveRecentSearch.pending, (state, { meta }) => {
        state.saveRequestId = meta.requestId
        state.loadRequestId = null
        state.error = null
      })
      .addCase(saveRecentSearch.fulfilled, (state, { meta, payload }) => {
        if (state.saveRequestId !== meta.requestId) return
        state.items = payload
        state.saveRequestId = null
      })
      .addCase(saveRecentSearch.rejected, (state, { meta }) => {
        if (state.saveRequestId !== meta.requestId) return
        state.saveRequestId = null
        state.error = 'Could not update recent searches. Reload history to check what was saved.'
      })
  },
})

export const selectIsLoadingRecentSearches = (state: RootState) => state.recentSearches.loadRequestId !== null
export const selectIsSavingRecentSearch = (state: RootState) => state.recentSearches.saveRequestId !== null

export default recentSearchesSlice.reducer
