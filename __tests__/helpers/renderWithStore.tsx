import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react-native'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import authReducer from '../../src/store/authSlice'
import themeReducer from '../../src/store/themeSlice'
import recentSearchesReducer from '../../src/store/recentSearchesSlice'
import favoritesReducer from '../../src/store/favoritesSlice'

export const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
      recentSearches: recentSearchesReducer,
      favorites: favoritesReducer,
    },
  })

export const renderWithStore = (ui: ReactElement, store = createTestStore()) => ({
  store,
  ...render(<Provider store={store}>{ui}</Provider>),
})
