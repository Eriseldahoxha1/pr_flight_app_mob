import type { TextStyle } from 'react-native'

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  panel: 28,
  pill: 999,
} as const

export const sizes = {
  inputMinHeight: 56,
  buttonMinHeight: 56,
  touchTarget: 48,
  icon: 24,
  iconSmall: 20,
  borderWidth: 1,
  headerHeight: 64,
} as const

export const typography = {
  heading: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  input: {
    fontSize: 16,
    fontWeight: '400',
  },
  label: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  button: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
} as const satisfies Record<string, TextStyle>
