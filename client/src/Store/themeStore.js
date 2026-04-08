const THEME_KEY = 'snaptrack-theme'

export function getInitialTheme() {
  // what did the user choose last time
  const saved = localStorage.getItem(THEME_KEY)
  if (saved !== null) {
    return saved === 'dark'
  }

  // window.matchMedia checks the operating system's dark mode setting
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(isDark) {
  const root = document.documentElement

  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // remember the choice for next time
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
}