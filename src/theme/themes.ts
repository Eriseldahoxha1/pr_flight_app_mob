export const lightTheme = {
  dark: false,
  colors: {
    background: '#F4F6FA',
    surface: '#FFFFFF',
    surfaceMuted: '#EDF1F6',
    text: '#05164D',
    textMuted: '#596174',
    placeholder: '#697386',
    border: '#D5DBE5',
    inputBorder: '#A5AEC0',
    focusBorder: '#05164D',
    primary: '#FFB800',
    primaryPressed: '#E5A600',
    onPrimary: '#05164D',
    disabled: '#D9DEE7',
    onDisabled: '#687386',
    error: '#C62828',
    header: '#05164D',
    onHeader: '#FFFFFF',
    tabActive: '#805900',
    tabInactive: '#65718B',
    overlay: 'rgba(0, 0, 0, 0.45)',
  },
}

// Both themes must provide the same color roles.
export type AppTheme = typeof lightTheme

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    background: '#0B1423',
    surface: '#152235',
    surfaceMuted: '#1B2C43',
    text: '#F5F7FC',
    textMuted: '#B8C5DB',
    placeholder: '#A0AEC3',
    border: '#2B3D55',
    inputBorder: '#63758F',
    focusBorder: '#FFB800',
    primary: '#FFB800',
    primaryPressed: '#E5A600',
    onPrimary: '#05164D',
    disabled: '#2B3D55',
    onDisabled: '#A0AEC3',
    error: '#FF796F',
    header: '#0B1423',
    onHeader: '#F5F7FC',
    tabActive: '#FFB800',
    tabInactive: '#B8C5DB',
    overlay: 'rgba(0, 0, 0, 0.65)',
  },
}
