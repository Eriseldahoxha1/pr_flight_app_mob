import { validationLabels } from '../constants/labels'

export function validateEmail(value: string) {
  if (!value.trim()) return validationLabels.emailRequired

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return validationLabels.emailInvalid
  }

  return ''
}

export function validatePassword(password: string): string {
  if (!password) return validationLabels.passwordRequired

  return ''
}
