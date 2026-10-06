import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import themeReducer from './themeSlice'
import recentSearchesReducer from './recentSearchesSlice'
import { connectHttpClient } from '../libs/http/http-client'
import favoritesReducer from './favoritesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    recentSearches: recentSearchesReducer,
    favorites: favoritesReducer,
  },
})

connectHttpClient(store)

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
