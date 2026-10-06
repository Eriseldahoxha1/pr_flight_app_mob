import { useEffect, type ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useAppSelector } from '../store/hooks'
import { selectIsAuthenticated, selectIsAuthInitialized } from '../store/authSlice'
import type { RootStackParamList } from '../types/navigation'
import { useAppTheme } from '../hooks/useAppTheme'

type PublicGuardProps = {
  children: ReactNode
}

export function PublicGuard({ children }: PublicGuardProps) {
  const theme = useAppTheme()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isInitialized = useAppSelector(selectIsAuthInitialized)

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    }
  }, [isInitialized, isAuthenticated, navigation])

  if (!isInitialized) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.text} />
      </View>
    )
  }

  if (isAuthenticated) return null

  return children
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
