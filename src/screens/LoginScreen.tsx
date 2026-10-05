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

const LoginScreen = () => {
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()

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
          <View style={[styles.form, { paddingBottom: insets.bottom + 32 }]}>
            <Text style={styles.title}>Welcome aboard</Text>
            <Text style={styles.subtitle}>Log in to manage your next journey.</Text>

            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#8A93A6"
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
              placeholderTextColor="#8A93A6"
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
              {isLoading && <ActivityIndicator size="small" color="#05164D" />}
              <Text style={styles.buttonText}>{isLoading ? 'Logging in…' : 'Log in'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  keyboardContainer: {
    flex: 1,
  },
  hero: {
    backgroundColor: '#051D45',
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.8,
    color: '#05164D',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#596174',
    marginBottom: 32,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#05164D',
    marginBottom: 8,
  },

  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#A5AEC0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#05164D',
    marginBottom: 24,
  },
  button: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFB800',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },

  buttonPressed: {
    backgroundColor: '#E5A600',
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#05164D',
  },
})
