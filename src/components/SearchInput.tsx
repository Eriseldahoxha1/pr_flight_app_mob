import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppTheme } from '../hooks/useAppTheme'
import { radii, sizes, spacing, typography } from '../theme/tokens'

type SearchInputProps = {
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  accessibilityLabel: string
  clearLabel: string
  editable?: boolean
  style?: StyleProp<ViewStyle>
}

export default function SearchInput({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  clearLabel,
  editable = true,
  style,
}: SearchInputProps) {
  const theme = useAppTheme()

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.inputBorder },
        style,
      ]}
    >
      <Ionicons name="search-outline" size={sizes.iconSmall} color={theme.colors.textMuted} accessible={false} />

      <TextInput
        keyboardAppearance={theme.dark ? 'dark' : 'light'}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
        style={[typography.input, styles.input, { color: theme.colors.text }]}
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={sizes.iconSmall} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: sizes.inputMinHeight,
    paddingVertical: spacing.md,
  },
  clearButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
