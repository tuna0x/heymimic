import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import * as AuthContextModule from '../../../context/AuthContext'

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading spinner while authentication is loading', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      loginAsSampleUser: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText(/đang tải/i)).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      loginAsSampleUser: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders child content when user is authenticated', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'user-1',
        name: 'Alex',
        email: 'alex@example.com',
        avatarUrl: '',
        streakDays: 0,
        totalMinutes: 0,
        targetLanguage: 'en',
        goal: 'work',
        selfAssessedLevel: 'intermediate',
        dailyMinutesGoal: 15,
        onboardingCompleted: true,
      },
      login: vi.fn(),
      loginAsSampleUser: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
