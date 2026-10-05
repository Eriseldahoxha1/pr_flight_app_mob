export function validateEmail(value: string) {
  if (!value.trim()) return 'Email is required'

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return 'Enter a valid email address'
  }

  return ''
}

export function validatePassword(password: string): string {
  if (!password) return 'Password is required'

  return ''
}
