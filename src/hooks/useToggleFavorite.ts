import Toast from 'react-native-toast-message'
import { useAppDispatch } from '../store/hooks'
import { addFavorite, removeFavorite } from '../store/favoritesSlice'

export function useToggleFavorite() {
  const dispatch = useAppDispatch()

  return async (flightId: string, isFavorite: boolean) => {
    const action = isFavorite ? await dispatch(removeFavorite(flightId)) : await dispatch(addFavorite(flightId))

    if (action.meta.requestStatus === 'rejected' && !action.meta.condition) {
      Toast.show({
        type: 'error',
        text1: isFavorite ? 'Could not remove from favorites' : 'Could not add to favorites',
      })
    }
  }
}
