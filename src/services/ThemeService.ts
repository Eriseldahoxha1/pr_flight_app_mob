import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ThemePreference } from '../types/theme'

const STORAGE_KEY = 'themePreference'

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark'

class ThemeService {
  getPreference = async (): Promise<ThemePreference> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY)
      return isThemePreference(value) ? value : 'system'
    } catch {
      return 'system'
    }
  }

  savePreference = (preference: ThemePreference) => AsyncStorage.setItem(STORAGE_KEY, preference)
}

export default new ThemeService()
