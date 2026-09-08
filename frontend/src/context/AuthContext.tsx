import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { LearnerProfile } from '../type'
import { useMimicStore } from '../store/useMimicStore'
import { authService } from '../service/authService'
import { clearAccessToken } from '../service/api'
import { clearUserScopedStorage } from '../store/storageKeys'

interface AuthContextType {
  user: LearnerProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  loginAsSampleUser: () => Promise<void>
  signup: (name: string, email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function clearAuthenticatedUserState() {
  clearUserScopedStorage()
  useMimicStore.setState({
    mistakePatterns: [],
    dailyActivities: [],
    activeStudySession: null,
    activePeerSession: null,
    peerSessions: [],
    videoAttempts: [],
    completedListeningIds: [],
    dialogueTurns: {},
  })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storeProfile = useMimicStore((state) => state.profile)
  const updateStoreProfile = useMimicStore((state) => state.updateProfile)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const restoreSession = async () => {
      try {
        const profile = await authService.getProfile()
        if (!active) return
        updateStoreProfile(profile)
        setIsAuthenticated(true)
      } catch {
        clearAccessToken()
        clearAuthenticatedUserState()
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void restoreSession()
    return () => {
      active = false
    }
  }, [updateStoreProfile])

  const login = async (email: string, pass: string) => {
    setIsLoading(true)
    try {
      const profile = await authService.login(email, pass)
      if (profile.id !== storeProfile.id) clearAuthenticatedUserState()
      updateStoreProfile(profile)
      setIsAuthenticated(true)
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsSampleUser = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    updateStoreProfile({
      name: 'Alex Trần',
      email: 'alex.tran@demo.heymimic.com',
      streakDays: 4,
      totalMinutes: 68,
      onboardingCompleted: true,
      goal: 'work',
      selfAssessedLevel: 'intermediate',
    })
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoading(true)
    try {
      await authService.register(name.trim(), email.trim(), pass)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Local logout must still complete when the backend is unavailable.
    } finally {
      clearAuthenticatedUserState()
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: isAuthenticated ? storeProfile : null,
        isAuthenticated,
        isLoading,
        login,
        loginAsSampleUser,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

