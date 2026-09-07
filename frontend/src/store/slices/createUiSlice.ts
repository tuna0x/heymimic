import { StateCreator } from 'zustand'
import { applyTheme, getInitialTheme, safeJsonParse, STORAGE_KEYS, ThemeMode } from '../storageKeys'

export interface UiSlice {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const current = get().theme
    const nextTheme: ThemeMode = current === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
    set({ theme: nextTheme })
  },
  sidebarCollapsed: safeJsonParse<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
  toggleSidebar: () => {
    set((state) => {
      const next = !state.sidebarCollapsed
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(next))
      return { sidebarCollapsed: next }
    })
  },
  setSidebarCollapsed: (collapsed: boolean) => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(collapsed))
    set({ sidebarCollapsed: collapsed })
  },
})
