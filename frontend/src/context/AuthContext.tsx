import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserProfile } from '../type'

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  logout: () => void
}

const mockUser: UserProfile = {
  id: 'usr_01',
  name: 'Alex Tran',
  email: 'alex.tran@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  streakDays: 14,
  totalMinutes: 180,
  targetLanguage: 'English',
  level: 'Intermediate',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check saved session/token
    const token = localStorage.getItem('mimic_auth_token')
    if (token) {
      setUser(mockUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (_email: string, _pass: string) => {
    setIsLoading(true)
    // Simulating API network call for backend integration
    await new Promise((resolve) => setTimeout(resolve, 400))
    localStorage.setItem('mimic_auth_token', 'mock_jwt_token_sample')
    setUser(mockUser)
    setIsLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('mimic_auth_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
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
