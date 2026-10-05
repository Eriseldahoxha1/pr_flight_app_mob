import { useAppSelector } from '../store/hooks'
import { darkTheme, lightTheme, type AppTheme } from '../theme/themes'

export const useAppTheme = (): AppTheme => {
  const mode = useAppSelector(state => state.theme.mode)
  return mode === 'dark' ? darkTheme : lightTheme
}
