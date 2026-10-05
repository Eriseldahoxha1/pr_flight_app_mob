import { useEffect, type ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useAppSelector } from '../store/hooks'
import type { RootStackParamList } from '../types/navigation'

type PublicGuardProps = {
  children: ReactNode
}

export function PublicGuard({ children }: PublicGuardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const { isAuthenticated, isInitialized } = useAppSelector(state => state.auth)

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
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
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
