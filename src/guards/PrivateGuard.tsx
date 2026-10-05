import { useEffect, type ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useAppSelector } from '../store/hooks'
import type { RootStackParamList } from '../types/navigation'
import { useAppTheme } from '../hooks/useAppTheme'

type PrivateGuardProps = {
  children: ReactNode
}

export function PrivateGuard({ children }: PrivateGuardProps) {
  const theme = useAppTheme()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const { isAuthenticated, isInitialized } = useAppSelector(state => state.auth)

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
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

  if (!isAuthenticated) return null

  return children
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
