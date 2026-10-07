import { useRef, useState } from 'react'
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
import { validateEmail, validatePassword } from '../utils/validateLogin'
import { useAppDispatch } from '../store/hooks'
import { loginUser } from '../store/authThunks'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppTheme } from '../hooks/useAppTheme'
import { AppTheme } from '../theme/themes'
import { radii, sizes, spacing, typography } from '../theme/tokens'
import { authLabels } from '../constants/labels'

const getLoginErrorMessage = (error: unknown) => {
  if (error === 'network') return authLabels.networkError
  if (error === 'invalid-credentials') return authLabels.invalidCredentials

  return authLabels.unknownError
}

const LoginScreen = () => {
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const theme = useAppTheme()
  const styles = createStyles(theme)

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const passwordInput = useRef<TextInput>(null)

  const normalizedEmail = email.trim().toLowerCase()
  const emailError = hasSubmitted ? validateEmail(normalizedEmail) : ''
  const passwordError = hasSubmitted ? validatePassword(password) : ''

  const changeEmail = (value: string) => {
    setEmail(value)
    setLoginError(null)
  }

  const changePassword = (value: string) => {
    setPassword(value)
    setLoginError(null)
  }

  const handleLogin = async () => {
    setHasSubmitted(true)
    setLoginError(null)

    if (validateEmail(normalizedEmail) || validatePassword(password)) return

    Keyboard.dismiss()
    setIsLoading(true)

    try {
      await dispatch(loginUser({ email: normalizedEmail, password })).unwrap()
    } catch (error) {
      setLoginError(getLoginErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
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
            <Text style={styles.title}>{authLabels.title}</Text>
            <Text style={styles.subtitle}>{authLabels.subtitle}</Text>

            <View style={styles.field}>
              <Text style={styles.label}>{authLabels.email}</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputInvalid : null]}
                value={email}
                onChangeText={changeEmail}
                placeholder={authLabels.emailPlaceholder}
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="email-address"
                textContentType="username"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordInput.current?.focus()}
                accessibilityLabel={authLabels.email}
                accessibilityHint={emailError || undefined}
                editable={!isLoading}
              />
              <Text style={styles.fieldError}>{emailError}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{authLabels.password}</Text>
              <View>
                <TextInput
                  ref={passwordInput}
                  style={[styles.input, styles.passwordInput, passwordError ? styles.inputInvalid : null]}
                  value={password}
                  onChangeText={changePassword}
                  placeholder={authLabels.passwordPlaceholder}
                  placeholderTextColor={theme.colors.placeholder}
                  secureTextEntry={!isPasswordVisible}
                  textContentType="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  returnKeyType="go"
                  onSubmitEditing={() => void handleLogin()}
                  accessibilityLabel={authLabels.password}
                  accessibilityHint={passwordError || undefined}
                  editable={!isLoading}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isPasswordVisible ? authLabels.hidePassword : authLabels.showPassword}
                  onPress={() => setIsPasswordVisible(visible => !visible)}
                  hitSlop={spacing.sm}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={sizes.icon}
                    color={theme.colors.textMuted}
                    accessible={false}
                  />
                </Pressable>
              </View>
              <Text style={styles.fieldError}>{passwordError}</Text>
            </View>

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
              <Text style={styles.buttonText}>{isLoading ? authLabels.loggingIn : authLabels.logIn}</Text>
            </Pressable>

            {loginError && (
              <Text accessibilityRole="alert" style={styles.loginError}>
                {loginError}
              </Text>
            )}
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
      backgroundColor: theme.colors.brand,
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

    field: {
      gap: spacing.sm,
    },

    label: {
      ...typography.label,
      color: theme.colors.text,
    },

    input: {
      ...typography.input,
      minHeight: sizes.inputMinHeight,
      borderWidth: sizes.borderWidth,
      borderColor: theme.colors.inputBorder,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      color: theme.colors.text,
    },
    inputInvalid: {
      borderColor: theme.colors.error,
    },
    fieldError: {
      ...typography.caption,
      minHeight: typography.caption.lineHeight,
      color: theme.colors.error,
    },
    loginError: {
      ...typography.body,
      color: theme.colors.error,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    passwordInput: {
      paddingRight: spacing.lg + sizes.icon + spacing.md,
    },
    passwordToggle: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: spacing.lg,
      justifyContent: 'center',
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
