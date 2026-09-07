import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { LearnerProfile } from '../type'
import { useMimicStore } from '../store/useMimicStore'

interface AuthContextType {
  user: LearnerProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  loginAsSampleUser: () => Promise<void>
  signup: (name: string, email: string, pass: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const storeProfile = useMimicStore((state) => state.profile)
  const updateStoreProfile = useMimicStore((state) => state.updateProfile)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check saved session/token
    const token = localStorage.getItem('mimic_auth_token')
    if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, _pass: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    localStorage.setItem('mimic_auth_token', 'demo_token_valid')
    updateStoreProfile({
      email,
      name: email.split('@')[0] || storeProfile.name,
    })
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const loginAsSampleUser = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    localStorage.setItem('mimic_auth_token', 'demo_sample_token')
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

  const signup = async (name: string, email: string, _pass: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    localStorage.setItem('mimic_auth_token', 'demo_new_user_token')
    updateStoreProfile({
      name: name.trim(),
      email: email.trim(),
      streakDays: 0,
      totalMinutes: 0,
      onboardingCompleted: false, // will go to /onboarding
    })
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('mimic_auth_token')
    setIsAuthenticated(false)
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

