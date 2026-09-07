export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ABOUT: '/about',
  SPEAKING_METHOD: '/speaking-method',
  CONTACT: '/contact',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',

  // Authenticated App Routes
  APP: '/app',
  DASHBOARD: '/dashboard',
  VOCAB: '/vocab',
  SPEAKING: '/speaking',
  PROGRESS: '/progress',
} as const
