import lightTheme from '@/themes/light'
import darkTheme from '@/themes/dark'

export const DEFAULT_THEME = 'dark'
export const THEMES = {
  light: lightTheme,
  dark: darkTheme,
}

export function getInitialTheme() {
  return typeof window === 'undefined' ? DEFAULT_THEME : window.localStorage.getItem('theme') || DEFAULT_THEME
}