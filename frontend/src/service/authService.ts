import type { LearnerProfile } from '../type'
import type { components } from './generated/api-schema'
import { apiClient, clearAccessToken, setAccessToken } from './api'

type AuthResponse = components['schemas']['AuthResponse']
type RegisterResponse = components['schemas']['RegisterResponse']
type LearnerProfileResponse = components['schemas']['LearnerProfileResponse']

function required<T>(value: T | undefined, field: string): T {
  if (value === undefined || value === null) {
    throw new Error(`Backend response is missing ${field}`)
  }
  return value
}

function toLearnerProfile(profile: LearnerProfileResponse): Partial<LearnerProfile> {
  return {
    id: required(profile.id, 'id'),
    name: required(profile.name, 'name'),
    email: required(profile.email, 'email'),
    targetLanguage: required(profile.targetLanguage, 'targetLanguage'),
    goal: required(profile.goal, 'goal') as LearnerProfile['goal'],
    selfAssessedLevel: required(
      profile.selfAssessedLevel,
      'selfAssessedLevel'
    ) as LearnerProfile['selfAssessedLevel'],
    dailyMinutesGoal: (profile.dailyMinutesGoal ?? 10) as LearnerProfile['dailyMinutesGoal'],
    onboardingCompleted: required(profile.onboardingCompleted, 'onboardingCompleted'),
  }
}

export const authService = {
  async login(email: string, password: string): Promise<Partial<LearnerProfile>> {
    const response = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuthRefresh: true,
    })
    setAccessToken(required(response.accessToken, 'accessToken'))
    return this.getProfile()
  },

  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    return apiClient<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      }),
      skipAuthRefresh: true,
    })
  },

  async getProfile(): Promise<Partial<LearnerProfile>> {
    const profile = await apiClient<LearnerProfileResponse>('/me')
    return toLearnerProfile(profile)
  },

  async logout(): Promise<void> {
    try {
      await apiClient<void>('/auth/logout', {
        method: 'POST',
        skipAuthRefresh: true,
      })
    } finally {
      clearAccessToken()
    }
  },
}
