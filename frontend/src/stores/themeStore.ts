import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

function applyTheme(isDark: boolean) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

const saved = localStorage.getItem('theme') === 'dark'
applyTheme(saved)

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: saved,
  toggle: () =>
    set((s) => {
      const next = !s.isDark
      localStorage.setItem('theme', next ? 'dark' : 'light')
      applyTheme(next)
      return { isDark: next }
    }),
}))
