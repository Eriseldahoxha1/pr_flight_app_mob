import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
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

type HistoryResult = {
  searches: RecentSearch[] | null
  warning: string | null
}

const cleanupWarning = 'History is up to date, but older entries could not be removed. Reload history to retry.'

export const loadRecentSearches = createAsyncThunk<HistoryResult, void, { state: RootState }>(
  'recentSearches/load',
  async (_, { getState }) => {
    const result = await RecentSearchService.refreshSearches(requireUserId(getState()))
    return { searches: result.searches, warning: result.cleanupFailed ? cleanupWarning : null }
  },
  { condition: (_, { getState }) => !getState().recentSearches.saveRequestId },
)

export const saveRecentSearch = createAsyncThunk<HistoryResult, FlightSearchCriteria, { state: RootState }>(
  'recentSearches/save',
  async (criteria, { getState, dispatch, requestId }) => {
    const userId = requireUserId(getState())
    const savedSearch = await RecentSearchService.saveSearch(userId, criteria)
    // A logout or session change may have invalidated this request.
    if (getState().recentSearches.saveRequestId !== requestId) {
      return { searches: null, warning: null }
    }
    dispatch(searchSaved({ search: savedSearch, requestId }))

    try {
      const result = await RecentSearchService.refreshSearches(userId)
      return { searches: result.searches, warning: result.cleanupFailed ? cleanupWarning : null }
    } catch {
      return { searches: null, warning: 'Search saved, but history could not be refreshed. Reload history to retry.' }
    }
  },
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
  reducers: {
    searchSaved(state, { payload }: PayloadAction<{ search: RecentSearch; requestId: string }>) {
      if (state.saveRequestId !== payload.requestId) return
      state.items = [payload.search, ...state.items.filter(search => search.id !== payload.search.id)].slice(
        0,
        MAX_RECENT_SEARCHES,
      )
    },
  },
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
        if (payload.searches) state.items = payload.searches
        state.error = payload.warning
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
        if (payload.searches) state.items = payload.searches
        state.error = payload.warning
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
const { searchSaved } = recentSearchesSlice.actions
export const selectIsSavingRecentSearch = (state: RootState) => state.recentSearches.saveRequestId !== null

export default recentSearchesSlice.reducer
