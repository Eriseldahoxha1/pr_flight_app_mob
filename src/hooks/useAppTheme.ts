import { useColorScheme } from 'react-native'
import { useAppSelector } from '../store/hooks'
import { darkTheme, lightTheme, type AppTheme } from '../theme/themes'

export const useAppTheme = (): AppTheme => {
  const systemScheme = useColorScheme()
  const preference = useAppSelector(state => state.theme.preference)
  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark'

  return isDark ? darkTheme : lightTheme
}
