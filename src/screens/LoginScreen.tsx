import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native'
import AuthService from '../services/AuthService'
import Toast from 'react-native-toast-message'
import { validateEmail, validatePassword } from '../utils/validation'
import { useAppDispatch } from '../store/hooks'
import { setSession } from '../store/authSlice'
import { setItemAsync } from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppTheme } from '../hooks/useAppTheme'
import { AppTheme } from '../theme/themes'
import { radii, sizes, spacing, typography } from '../theme/tokens'

const LoginScreen = () => {
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const theme = useAppTheme()
  const styles = createStyles(theme)

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleLogin = async () => {
    setIsLoading(true)
    const trimmedEmail: string = email.trim()
    const error = validateEmail(trimmedEmail) || validatePassword(password)
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Validation error',
        text2: error,
      })
      setIsLoading(false)
      return
    }

    Keyboard.dismiss()
    try {
      const { accessToken, user } = await AuthService.login({ email: trimmedEmail, password })
      await setItemAsync('session', JSON.stringify({ accessToken, userId: user.id }))
      dispatch(setSession({ accessToken, user }))
      //TODO: SHOULD NAVIGATE TO HOME SCREEN
    } catch (error) {
      console.log('Failed login:' + error)
      Toast.show({
        type: 'error',
        text1: 'Error logging in',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="height" style={styles.keyboardContainer} enabled={Platform.OS === 'android'}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          keyboardDismissMode="on-drag"
        >
          <View style={[styles.hero, { paddingTop: insets.top }]}>
            <Image
              source={require('../../assets/login-background.png')}
              style={styles.airplane}
              resizeMode="contain"
              accessible={false}
            />
          </View>
          <View style={[styles.form, { paddingBottom: insets.bottom + spacing.xxl }]}>
            <Text style={styles.title}>Welcome aboard</Text>
            <Text style={styles.subtitle}>Log in to manage your next journey.</Text>

            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              accessibilityLabel="Email address"
              editable={!isLoading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              accessibilityLabel="Password"
              editable={!isLoading}
            />

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading, busy: isLoading }}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
            >
              {isLoading && <ActivityIndicator size="small" color={theme.colors.onPrimary} />}
              <Text style={styles.buttonText}>{isLoading ? 'Logging in…' : 'Log in'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default LoginScreen

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    keyboardContainer: {
      flex: 1,
    },
    hero: {
      backgroundColor: theme.colors.header,
    },

    airplane: {
      width: '100%',
      height: undefined,
      aspectRatio: 1619 / 971,
    },
    scrollContent: {
      flexGrow: 1,
    },
    form: {
      flexGrow: 1,
      marginTop: -20,
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: radii.panel,
      borderTopRightRadius: radii.panel,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
    },

    title: {
      ...typography.heading,
      color: theme.colors.text,
      marginBottom: spacing.sm,
    },

    subtitle: {
      ...typography.body,
      color: theme.colors.textMuted,
      marginBottom: spacing.xxl,
    },

    label: {
      ...typography.label,
      color: theme.colors.text,
      marginBottom: spacing.sm,
    },

    input: {
      ...typography.body,
      minHeight: sizes.inputMinHeight,
      borderWidth: sizes.borderWidth,
      borderColor: theme.colors.inputBorder,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      color: theme.colors.text,
      marginBottom: spacing.xl,
    },
    button: {
      minHeight: sizes.buttonMinHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: radii.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      marginTop: spacing.sm,
    },

    buttonPressed: {
      backgroundColor: theme.colors.primaryPressed,
    },

    buttonDisabled: {
      opacity: 0.65,
    },

    buttonText: {
      ...typography.button,
      color: theme.colors.onPrimary,
    },
  })
