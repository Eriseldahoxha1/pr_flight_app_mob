import type { PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

type RootLayoutProps = PropsWithChildren<{
  hasHeader?: boolean
}>

export default function RootLayout({ children, hasHeader = false }: RootLayoutProps) {
  const insets = useSafeAreaInsets()

  return (
    <>
      <View
        style={[
          styles.container,
          // {
          //   paddingTop: 24 + (hasHeader ? 0 : insets.top),
          //   paddingBottom: 24 + insets.bottom,
          //   paddingLeft: 24 + insets.left,
          //   paddingRight: 24 + insets.right,
          // },
        ]}
      >
        {children}
      </View>

      <Toast topOffset={insets.top + 16} />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
})
