import { AuthProvider, ThemeProvider } from './context'
import { AppRoutes } from './route'
import { ScrollToTop } from './components/shared/ScrollToTop'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
