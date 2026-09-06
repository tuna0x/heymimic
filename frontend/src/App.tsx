import { AuthProvider, ThemeProvider } from './context'
import { AppRoutes } from './route'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
